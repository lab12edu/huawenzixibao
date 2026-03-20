// src/index.tsx
// Hono Worker — secure AI proxy for 华文自习宝.
// All Gemini prompts are defined here on the server.
// The frontend sends only a task name + dynamic data fields; no prompt text
// ever appears in the JS bundle served to the browser.

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getVocabFromVault, searchVault, getIdiomsFromVault, getComposFromVault, getOralDataFromVault } from './server/vocabVault'

// ── Cloudflare bindings ───────────────────────────────────────────────────────
type Bindings = {
  GEMINI_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// ── Constants ─────────────────────────────────────────────────────────────────
const MODEL    = 'gemini-2.5-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

// ── Singapore guardrail (server-side only) ────────────────────────────────────
const SG_GUARDRAIL = `You are a Singapore Primary School Chinese writing coach.
All names must be Singapore names: 小明, 小红, 小华, 阿明, Ali, Siti, Muthu, Wei Liang.
All settings must be Singapore settings: 组屋 (HDB flat), 食阁 (hawker centre),
民众俱乐部 (community centre), 图书馆 (public library), CCA, PSLE,
组屋走廊 (HDB corridor), 巴刹 (wet market), 学校操场 (school field).
Never reference 祖国, 长城, 北京, 天安门, 故宫, or any China-specific landmark.
Every suggestion must feel like it was written by a Singapore child about their Singapore life.`

const SG_WRITING_TEACHER = `${SG_GUARDRAIL}\n\n你是一位专业的新加坡小学华文作文老师。`
const SG_SCORING_TEACHER = `${SG_GUARDRAIL}\n\n你是一位专业的小学华文作文评分老师。请用简单的新加坡小学华文，避免生僻字。`

// ── Gemini helper ─────────────────────────────────────────────────────────────
interface GeminiResult {
  text: string
  error: boolean
  rateLimited?: boolean
}

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  generationConfig: Record<string, unknown> = { temperature: 0.7, maxOutputTokens: 1024 },
): Promise<GeminiResult> {
  const url       = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`
  const geminiBody = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig,
  })

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    geminiBody,
    })
    if (res.status === 429 && attempt === 0) {
      await new Promise(r => setTimeout(r, 6000))
      continue
    }
    if (res.status === 429) return { error: true, rateLimited: true, text: '' }
    if (!res.ok)            return { error: true, text: '' }
    const data = await res.json() as Record<string, unknown>
    const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return { error: !text, text }
  }
  return { error: true, rateLimited: true, text: '' }
}

async function callGeminiWithImage(
  apiKey:    string,
  prompt:    string,
  base64:    string,
  mimeType = 'image/jpeg',
): Promise<GeminiResult> {
  const url = `${API_BASE}/${MODEL}:generateContent?key=${apiKey}`
  const body = JSON.stringify({
    contents: [{
      role: 'user',
      parts: [
        { inline_data: { mime_type: mimeType, data: base64 } },
        { text: prompt },
      ],
    }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
  })

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body })
    if (res.status === 429 && attempt === 0) {
      await new Promise(r => setTimeout(r, 6000))
      continue
    }
    if (res.status === 429) return { error: true, rateLimited: true, text: '' }
    if (!res.ok)            return { error: true, text: '' }
    const data = await res.json() as Record<string, unknown>
    const text = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    return { error: !text, text }
  }
  return { error: true, rateLimited: true, text: '' }
}

// ── Level helpers ────────────────────────────────────────────────────────────
const isLowerPrimary = (level: string) => ['P3', 'P4'].includes(level)

/** Word-count target for one section paragraph, calibrated by level. */
function sectionWordCount(level: string, needsExpansion: boolean): string {
  if (level === 'P3') return needsExpansion ? '30至50个汉字' : '40至60个汉字'
  if (level === 'P4') return needsExpansion ? '50至70个汉字' : '60至80个汉字'
  return needsExpansion ? '60至90个汉字' : '80至120个汉字'
}

/** Full-essay word-count target, calibrated by level. */
function essayWordCount(level: string): string {
  if (level === 'P3') return '180至280个汉字'
  if (level === 'P4') return '250至350个汉字'
  return '350至500个汉字'
}

/** Words-per-paragraph target for full-enhance, calibrated by level. */
function paraWordCount(level: string): string {
  if (level === 'P3') return '每段40至55字'
  if (level === 'P4') return '每段55至70字'
  return '每段80至100字'
}

// ── /api/ai — task-based secure proxy ────────────────────────────────────────
//
// Accepted task names and their required data fields:
//
//   enhance         – { task, topic, level, sectionKey, previousSections, currentText, needsExpansion }
//   translate       – { task, text }
//   score           – { task, level, topicTitle, fullEssay }
//   fullEnhance     – { task, topicTitle, level, fullEssay }
//   imageAnalyse    – { task, base64, mimeType? }
//
// The frontend NEVER sends systemPrompt or userPrompt.

app.post('/api/ai', async (c) => {
  const apiKey = c.env.GEMINI_API_KEY
  if (!apiKey) {
    return c.json({ error: true, text: '', message: 'API key not configured' }, 500)
  }

  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: true, text: '', message: 'Invalid JSON body' }, 400)
  }

  const task = body.task as string | undefined

  // ── Image analysis ─────────────────────────────────────────────────────────
  if (task === 'imageAnalyse') {
    const rawBase64 = (body.base64 as string ?? '').replace(/^data:image\/\w+;base64,/, '')
    const mimeType  = (body.mimeType as string | undefined) ?? 'image/jpeg'
    const systemPrompt =
      '你是一位新加坡小学华文作文老师。请用简单的小学华文描述这张图片里发生的事情，' +
      '包括人物、动作、表情和背景。避免生僻字。请控制在150字以内。' +
      '请用好词好句，确保每个字都是小学生能认识的常用字。'
    const result = await callGeminiWithImage(apiKey, systemPrompt, rawBase64, mimeType)
    return c.json(result)
  }

  // ── Section enhance ────────────────────────────────────────────────────────
  if (task === 'enhance') {
    const topic            = body.topic as string
    const level            = body.level as string
    const sectionKey       = body.sectionKey as string
    const sectionLabel     = body.sectionLabel as string
    const previousSections = (body.previousSections as string | undefined) ?? ''
    const currentText      = body.currentText as string
    const needsExpansion   = !!body.needsExpansion

    const userPrompt =
      `作文题目：${topic}\n` +
      `作文体裁：记叙文（六段式）\n` +
      `学生年级：${level}\n\n` +
      (previousSections ? `已完成的段落：\n${previousSections}\n\n` : '') +
      `当前段落（${sectionLabel}）学生原文：\n${currentText}\n\n` +
      `要求：\n` +
      `1. 保留并改写学生原文的所有内容，不得遗漏任何句子或意思。\n` +
      (needsExpansion
        ? '2. 学生写得太少，请在保留原意的基础上，继续发展这段的情节，让段落更完整生动。\n'
        : '2. 在学生原有内容基础上适当扩充，使段落更完整。\n') +
      `3. 改写后的段落应为${sectionWordCount(level, needsExpansion)}，句子完整，不得在句子中间截断。\n` +
      `4. 使用${level}水平的词汇，句子自然流畅，适合小学生写作风格，避免生僻字${isLowerPrimary(level) ? "，用词简单易懂，每个字小学低年级学生都能认识" : ""}。\n` +
      `5. 内容必须与作文题目"${topic}"紧密相关。\n` +
      (previousSections ? `6. 内容必须与前文自然衔接。\n` : '') +
      `7. 直接输出改写后的段落，不要解释，不要标题，不要多余符号。`

    const result = await callGemini(
      apiKey,
      SG_WRITING_TEACHER,
      userPrompt,
      { maxOutputTokens: 2048, temperature: 0.75, thinkingConfig: { thinkingBudget: 0 } },
    )
    return c.json(result)
  }

  // ── Translation (enhanced paragraph → English summary for parents) ─────────
  if (task === 'translate') {
    const text = body.text as string
    const userPrompt =
      `Translate this Chinese text into exactly 2 simple English sentences for a Singapore primary school parent. ` +
      `Simple everyday words only. Return only the English translation, no explanation.\n\n${text}`
    const result = await callGemini(
      apiKey,
      'You are a helpful translator.',
      userPrompt,
      { maxOutputTokens: 256, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } },
    )
    return c.json(result)
  }

  // ── Essay scoring ──────────────────────────────────────────────────────────
  if (task === 'score') {
    const level      = body.level as string
    const topicTitle = body.topicTitle as string
    const fullEssay  = body.fullEssay as string

    // P3/P4 use a simplified 8-dimension rubric; P5/P6/PSLE use the full 14-dimension PSLE rubric.
    const isLower = isLowerPrimary(level)
    const scoreSystem = isLower
      ? `${SG_GUARDRAIL}\n\n你是一位专业的小学华文作文评分老师。请用${level}年级学生能理解的简单华文，避免生僻字。`
      : SG_SCORING_TEACHER
    const userPrompt = isLower
      ? `你是新加坡小学华文作文评卷老师。请根据以下8个维度为这篇${level}作文评分，` +
        `每个维度满分为5分（1=很弱，5=非常好）。` +
        `只返回合法JSON，格式：` +
        `{"dimensions":[{"name":"内容","score":4},...], "totalScore":28, "feedback":"CN总评 / EN summary",` +
        `"idiomFeedback":null}。` +
        `评分请依据${level}年级程度，用鼓励性的语气，标准不应与高年级相同。` +
        `8个维度：内容、结构、开头、结尾、描写细节、词汇量、句子流畅度、标点符号。\n\n` +
        `作文题目：${topicTitle}\n学生年级：${level}\n\n` +
        `作文内容：\n${fullEssay}`
      : `你是新加坡小学华文作文评卷老师。请根据以下14个维度为这篇小学作文评分，` +
        `每个维度满分为5分（1=很弱，5=非常好）。` +
        `只返回合法JSON，格式：` +
        `{"dimensions":[{"name":"内容","score":4},...], "totalScore":52, "feedback":"CN总评 / EN summary",` +
        `"idiomFeedback":{"idiom":"成语词","feedbackCn":"中文评语","feedbackEn":"English feedback"}}。` +
        `成语运用 (Idiom Usage)：检查学生是否正确使用了成语。如果有，填写 idiomFeedback，` +
        `feedbackCn 中须提及好词好句及语文评分，feedbackEn 须提及 Language marks 和 PSLE rubric。` +
        `如果没有使用成语，idiomFeedback 设为 null。` +
        `14个维度：内容、结构、开头、结尾、心理描写、动作描写、对话描写、场景描写、` +
        `成语运用、比喻句、词汇量、句子变化、标点符号、整体流畅度。\n\n` +
        `作文题目：${topicTitle}\n学生年级：${level}\n\n` +
        `作文内容：\n${fullEssay}`

    const result = await callGemini(
      apiKey,
      scoreSystem,
      userPrompt,
      { maxOutputTokens: 2048, temperature: 0.3, thinkingConfig: { thinkingBudget: 0 } },
    )
    return c.json(result)
  }

  // ── Full-essay enhance ─────────────────────────────────────────────────────
  if (task === 'fullEnhance') {
    const topicTitle = body.topicTitle as string
    const level      = body.level as string
    const fullEssay  = body.fullEssay as string

    const userPrompt =
      `你是一位新加坡小学华文老师。请帮助润色以下学生的作文。\n\n` +
      `作文题目：${topicTitle}\n学生年级：${level}\n\n` +
      `学生原文：\n${fullEssay}\n\n` +
      `要求：\n` +
      `1. 改写后的作文应为${essayWordCount(level)}，五段式记叙文结构。\n` +
      `2. 保留学生原文的所有主要情节和意思。\n` +
      `3. 使用${level}水平的词汇，句子自然流畅${isLowerPrimary(level) ? '，用词简单，适合低年级小学生' : ''}。\n` +
      `4. ${paraWordCount(level)}，段落之间衔接自然。\n` +
      `5. 直接输出完整作文，不要解释，不要标题，不要多余符号。`

    const result = await callGemini(
      apiKey,
      SG_WRITING_TEACHER,
      userPrompt,
      { maxOutputTokens: 3000, temperature: 0.7, thinkingConfig: { thinkingBudget: 0 } },
    )
    return c.json(result)
  }

  return c.json({ error: true, text: '', message: `Unknown task: ${task}` }, 400)
})

// ── /api/vocab ────────────────────────────────────────────────────────────────
// Returns the word list for one semester of a given level.
// Query params:
//   level  — e.g. "P1", "P1new", "K1"  (required)
//   sem    — "A" or "B"                 (default: "A")
//
// Examples:
//   GET /api/vocab?level=P3&sem=A
//   GET /api/vocab?level=P1new&sem=B
app.get('/api/vocab', (c) => {
  const level = c.req.query('level') || ''
  const sem   = ((c.req.query('sem') || 'A').toUpperCase()) as 'A' | 'B'

  if (!level) {
    return c.json({ error: true, message: 'Missing required query param: level' }, 400)
  }
  if (sem !== 'A' && sem !== 'B') {
    return c.json({ error: true, message: 'sem must be "A" or "B"' }, 400)
  }

  const result = getVocabFromVault(level, sem)
  if (!result.exists) {
    return c.json({ error: true, message: `No vocab found for level="${level}" sem="${sem}"` }, 404)
  }
  return c.json({ level, sem, total: result.items.length, items: result.items })
})

// ── /api/search ───────────────────────────────────────────────────────────────
// Global dictionary search across ALL levels simultaneously.
// Query params:
//   q — search string (required, min 1 char)
//
// Example:
//   GET /api/search?q=快乐
//   GET /api/search?q=happy
app.get('/api/search', (c) => {
  const q = (c.req.query('q') || '').trim()
  if (q.length < 1) {
    return c.json([])
  }
  const results = searchVault(q)
  return c.json(results)
})

// ── /api/idioms ───────────────────────────────────────────────────────────────
app.get('/api/idioms', (c) => c.json(getIdiomsFromVault()))

// ── /api/compositions ─────────────────────────────────────────────────────────
app.get('/api/compositions', (c) => c.json(getComposFromVault()))

// ── /api/oral ─────────────────────────────────────────────────────────────────
app.get('/api/oral', (c) => c.json(getOralDataFromVault()))

// ── /api/health ───────────────────────────────────────────────────────────────
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', app: '华文自习宝', version: '0.3.1' })
})

// ── Static files & SPA fallback ──────────────────────────────────────────────
// Static assets (dist/assets/*, dist/static/*) and index.html are served
// automatically by Cloudflare Pages and by `wrangler pages dev`.
// The worker only needs to handle /api/* routes — do NOT use serveStatic
// here because __STATIC_CONTENT_MANIFEST is not available in local dev.

export default app
