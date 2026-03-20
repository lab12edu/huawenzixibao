// ─────────────────────────────────────────────────────────────────────────────
// TONE_KEYWORD_MAP.ts
// Generated for idioms_sg_v5.json (400 entries)
//
// The Muse detection runs in two tiers:
//
// TIER 1 — Explicit keywords (直接词): student uses the emotion word directly
//   e.g. "害怕" → fear
//
// TIER 2 — Body language / physical reaction (隐性线索): student shows, not tells
//   e.g. "手在发抖" → fear   "满头大汗" → nervous   "握紧拳头" → angry
//   This makes the Muse feel "telepathic" — it picks up implicit emotional cues.
//
// Usage in Muse useEffect (single pass, checks both tiers):
//
//   const toneHit = detectTone(currentText)
//   const matches = IDIOM_BANK
//     .filter(i => i.tone === toneHit && i.difficulty === difficulty)
//     .sort(() => Math.random() - 0.5)
//     .slice(0, 3)
//
// For deduplication across section re-renders, use the usedIdiomIds Set pattern
// described at the bottom of this file.
// ─────────────────────────────────────────────────────────────────────────────

export type ToneValue =
  | 'fear' | 'sad' | 'joy' | 'angry' | 'grateful' | 'nervous' | 'proud' | 'regret'
  | 'brave' | 'rush' | 'careful' | 'lazy'
  | 'honest' | 'humble' | 'kind' | 'responsible'
  | 'study' | 'progress' | 'failure'
  | 'persist' | 'hardwork'
  | 'lesson' | 'warning' | 'strategy'
  | 'nature' | 'weather' | 'setting'
  | 'sudden' | 'gradual' | 'ending'
  | 'help' | 'teamwork' | 'loyalty'

// Chinese display labels — used in the Muse UI subtitle
export const TONE_DISPLAY: Record<ToneValue, string> = {
  fear:        '恐惧',
  sad:         '悲伤',
  joy:         '喜悦',
  angry:       '愤怒',
  grateful:    '感恩',
  nervous:     '紧张',
  proud:       '自豪',
  regret:      '惭愧',
  brave:       '勇敢',
  rush:        '急躁',
  careful:     '谨慎',
  lazy:        '懒惰',
  honest:      '诚实',
  humble:      '谦逊',
  kind:        '善良',
  responsible: '负责',
  study:       '学习',
  progress:    '进步',
  failure:     '失败',
  persist:     '坚持',
  hardwork:    '刻苦',
  lesson:      '道理',
  warning:     '警示',
  strategy:    '策略',
  nature:      '自然',
  weather:     '天气',
  setting:     '场景',
  sudden:      '突然',
  gradual:     '渐进',
  ending:      '结局',
  help:        '助人',
  teamwork:    '合作',
  loyalty:     '忠诚',
}

// ─────────────────────────────────────────────────────────────────────────────
// TIER 1 — Explicit emotional / situational keywords
// Longer and more specific phrases are listed first to prevent shorter
// substrings from matching too eagerly (e.g. "帮助别人" before "帮").
// ─────────────────────────────────────────────────────────────────────────────
export const TONE_KEYWORD_MAP: Record<string, ToneValue> = {

  // ── fear ──────────────────────────────────────────────────────────────────
  '毛骨悚然':   'fear',
  '魂飞魄散':   'fear',
  '心惊胆战':   'fear',
  '胆战心惊':   'fear',
  '惊慌失措':   'fear',
  '提心吊胆':   'fear',
  '害怕':       'fear',
  '恐惧':       'fear',
  '不敢':       'fear',
  '担心':       'fear',
  '心惊':       'fear',

  // ── sad ───────────────────────────────────────────────────────────────────
  '痛哭流涕':   'sad',
  '泪流满面':   'sad',
  '垂头丧气':   'sad',
  '依依不舍':   'sad',
  '伤心':       'sad',
  '难过':       'sad',
  '哭泣':       'sad',
  '哭':         'sad',
  '失落':       'sad',
  '遗憾':       'sad',
  '悲':         'sad',
  '泪':         'sad',
  '痛苦':       'sad',

  // ── joy ───────────────────────────────────────────────────────────────────
  '欣喜若狂':   'joy',
  '喜出望外':   'joy',
  '心花怒放':   'joy',
  '眉开眼笑':   'joy',
  '喜气洋洋':   'joy',
  '兴高采烈':   'joy',
  '手舞足蹈':   'joy',
  '高兴':       'joy',
  '开心':       'joy',
  '快乐':       'joy',
  '兴奋':       'joy',
  '喜':         'joy',
  '笑':         'joy',
  '欢':         'joy',

  // ── angry ─────────────────────────────────────────────────────────────────
  '义愤填膺':   'angry',
  '怒发冲冠':   'angry',
  '怒气冲冲':   'angry',
  '生气':       'angry',
  '愤怒':       'angry',
  '发火':       'angry',
  '怒':         'angry',
  '不满':       'angry',

  // ── grateful ──────────────────────────────────────────────────────────────
  '感激涕零':   'grateful',
  '万分感激':   'grateful',
  '没齿难忘':   'grateful',
  '受宠若惊':   'grateful',
  '感谢':       'grateful',
  '感激':       'grateful',
  '谢谢':       'grateful',
  '报答':       'grateful',
  '恩情':       'grateful',
  '感恩':       'grateful',

  // ── nervous ───────────────────────────────────────────────────────────────
  '如坐针毡':   'nervous',
  '忐忑不安':   'nervous',
  '七上八下':   'nervous',
  '心急如焚':   'nervous',
  '坐立不安':   'nervous',
  '紧张':       'nervous',
  '焦虑':       'nervous',
  '不安':       'nervous',
  '考试前':     'nervous',
  '上台前':     'nervous',

  // ── proud ─────────────────────────────────────────────────────────────────
  '扬眉吐气':   'proud',
  '自豪':       'proud',
  '骄傲':       'proud',
  '得意':       'proud',
  '荣耀':       'proud',
  '光荣':       'proud',

  // ── regret ────────────────────────────────────────────────────────────────
  '追悔莫及':   'regret',
  '悔恨交加':   'regret',
  '羞愧难当':   'regret',
  '功亏一篑':   'regret',
  '前功尽弃':   'regret',
  '后悔':       'regret',
  '惭愧':       'regret',
  '对不起':     'regret',
  '抱歉':       'regret',
  '反省':       'regret',

  // ── brave ─────────────────────────────────────────────────────────────────
  '奋不顾身':   'brave',
  '挺身而出':   'brave',
  '当机立断':   'brave',
  '临危不乱':   'brave',
  '见义勇为':   'brave',
  '雷厉风行':   'brave',
  '勇敢':       'brave',
  '勇气':       'brave',
  '胆量':       'brave',
  '冒险':       'brave',

  // ── rush ──────────────────────────────────────────────────────────────────
  '马不停蹄':   'rush',
  '争分夺秒':   'rush',
  '分秒必争':   'rush',
  '时不我待':   'rush',
  '只争朝夕':   'rush',
  '急忙':       'rush',
  '匆忙':       'rush',
  '赶紧':       'rush',
  '急于':       'rush',

  // ── careful ───────────────────────────────────────────────────────────────
  '从容不迫':   'careful',
  '一丝不苟':   'careful',
  '小心翼翼':   'careful',
  '胸有成竹':   'careful',
  '小心':       'careful',
  '仔细':       'careful',
  '认真':       'careful',
  '谨慎':       'careful',
  '细心':       'careful',

  // ── lazy ──────────────────────────────────────────────────────────────────
  '好逸恶劳':   'lazy',
  '敷衍了事':   'lazy',
  '懒':         'lazy',
  '偷懒':       'lazy',
  '不努力':     'lazy',
  '马虎':       'lazy',
  '不认真':     'lazy',

  // ── honest ────────────────────────────────────────────────────────────────
  '表里如一':   'honest',
  '言出必行':   'honest',
  '实事求是':   'honest',
  '诚实':       'honest',
  '说谎':       'honest',
  '真话':       'honest',
  '欺骗':       'honest',
  '坦白':       'honest',
  '守信':       'honest',

  // ── humble ────────────────────────────────────────────────────────────────
  '厚德载物':   'humble',
  '见贤思齐':   'humble',
  '以礼相待':   'humble',
  '谦虚':       'humble',
  '虚心':       'humble',
  '不自大':     'humble',
  '低调':       'humble',

  // ── kind ──────────────────────────────────────────────────────────────────
  '将心比心':   'kind',
  '推己及人':   'kind',
  '扶危济困':   'kind',
  '善良':       'kind',
  '帮助别人':   'kind',
  '爱心':       'kind',
  '关心':       'kind',
  '慷慨':       'kind',
  '乐于助人':   'kind',

  // ── responsible ───────────────────────────────────────────────────────────
  '独当一面':   'responsible',
  '克己奉公':   'responsible',
  '当仁不让':   'responsible',
  '责任':       'responsible',
  '负责':       'responsible',
  '认错':       'responsible',
  '承担':       'responsible',
  '尽职':       'responsible',

  // ── study ─────────────────────────────────────────────────────────────────
  '好学不倦':   'study',
  '专心致志':   'study',
  '开卷有益':   'study',
  '厚积薄发':   'study',
  '勤学苦练':   'study',
  '读书':       'study',
  '学习':       'study',
  '温习':       'study',
  '复习':       'study',
  '上课':       'study',
  '作业':       'study',
  '温书':       'study',

  // ── progress ──────────────────────────────────────────────────────────────
  '突飞猛进':   'progress',
  '迎头赶上':   'progress',
  '后来居上':   'progress',
  '手到擒来':   'progress',
  '进步':       'progress',
  '提高':       'progress',
  '成绩好':     'progress',
  '考好':       'progress',
  '名列前茅':   'progress',

  // ── failure ───────────────────────────────────────────────────────────────
  '一知半解':   'failure',
  '失败':       'failure',
  '考差':       'failure',
  '没考好':     'failure',
  '错误':       'failure',
  '落后':       'failure',
  '不及格':     'failure',

  // ── persist ───────────────────────────────────────────────────────────────
  '勇往直前':   'persist',
  '不懈努力':   'persist',
  '自强不息':   'persist',
  '迎难而上':   'persist',
  '披荆斩棘':   'persist',
  '滴水穿石':   'persist',
  '坚持':       'persist',
  '不放弃':     'persist',
  '继续努力':   'persist',
  '坚韧':       'persist',
  '训练':       'persist',

  // ── hardwork ──────────────────────────────────────────────────────────────
  '精益求精':   'hardwork',
  '全力以赴':   'hardwork',
  '脚踏实地':   'hardwork',
  '勤奋':       'hardwork',
  '刻苦':       'hardwork',
  '用功':       'hardwork',
  '废寝忘食':   'hardwork',
  '夜以继日':   'hardwork',
  '努力':       'hardwork',

  // ── lesson ────────────────────────────────────────────────────────────────
  '知足常乐':   'lesson',
  '量力而为':   'lesson',
  '道理':       'lesson',
  '明白了':     'lesson',
  '懂得':       'lesson',
  '教训':       'lesson',
  '启发':       'lesson',
  '明白':       'lesson',

  // ── warning ───────────────────────────────────────────────────────────────
  '居安思危':   'warning',
  '防患未然':   'warning',
  '防微杜渐':   'warning',
  '一失足成千古恨': 'warning',
  '聪明反被聪明误': 'warning',
  '自食恶果':   'warning',
  '玩火自焚':   'warning',
  '作茧自缚':   'warning',
  '得不偿失':   'warning',
  '因小失大':   'warning',
  '祸从口出':   'warning',
  '一错再错':   'warning',
  '后果':       'warning',
  '警惕':       'warning',
  '危险':       'warning',

  // ── strategy ──────────────────────────────────────────────────────────────
  '知己知彼':   'strategy',
  '有备无患':   'strategy',
  '因地制宜':   'strategy',
  '换位思考':   'strategy',
  '办法':       'strategy',
  '计划':       'strategy',
  '聪明':       'strategy',
  '方法':       'strategy',
  '解决问题':   'strategy',

  // ── nature ────────────────────────────────────────────────────────────────
  '郁郁葱葱':   'nature',
  '波光粼粼':   'nature',
  '花团锦簇':   'nature',
  '烟波浩渺':   'nature',
  '万紫千红':   'nature',
  '鸟语花香':   'nature',
  '绿树成荫':   'nature',
  '树木':       'nature',
  '花朵':       'nature',
  '草地':       'nature',
  '大树':       'nature',
  '海边':       'nature',
  '公园':       'nature',

  // ── weather ───────────────────────────────────────────────────────────────
  '骄阳似火':   'weather',
  '乌云密布':   'weather',
  '电闪雷鸣':   'weather',
  '烈日当空':   'weather',
  '下雨':       'weather',
  '雷阵雨':     'weather',
  '太阳':       'weather',
  '天气':       'weather',
  '起风':       'weather',
  '乌云':       'weather',
  '雷声':       'weather',

  // ── setting ───────────────────────────────────────────────────────────────
  '万籁俱寂':   'setting',
  '人声鼎沸':   'setting',
  '宁静致远':   'setting',
  '热闹':       'setting',
  '安静':       'setting',
  '组屋':       'setting',
  '食阁':       'setting',
  '小贩中心':   'setting',
  '图书馆':     'setting',
  '学校':       'setting',

  // ── sudden ────────────────────────────────────────────────────────────────
  '转瞬即逝':   'sudden',
  '措手不及':   'sudden',
  '突然':       'sudden',
  '忽然':       'sudden',
  '没想到':     'sudden',
  '一下子':     'sudden',
  '猛然':       'sudden',

  // ── gradual ───────────────────────────────────────────────────────────────
  '岁月如梭':   'gradual',
  '来日方长':   'gradual',
  '事过境迁':   'gradual',
  '日新月异':   'gradual',
  '慢慢':       'gradual',
  '渐渐':       'gradual',
  '一天天':     'gradual',
  '日积月累':   'gradual',

  // ── ending ────────────────────────────────────────────────────────────────
  '白驹过隙':   'ending',
  '一去不返':   'ending',
  '光阴似箭':   'ending',
  '毕业':       'ending',
  '最后':       'ending',
  '终于':       'ending',
  '结束':       'ending',
  '完成了':     'ending',

  // ── help ──────────────────────────────────────────────────────────────────
  '守望相助':   'help',
  '投桃报李':   'help',
  '雪中送炭':   'help',
  '帮忙':       'help',
  '支持':       'help',
  '互相帮助':   'help',
  '关怀':       'help',
  '照顾别人':   'help',

  // ── teamwork ──────────────────────────────────────────────────────────────
  '众志成城':   'teamwork',
  '同舟共济':   'teamwork',
  '相辅相成':   'teamwork',
  '齐心协力':   'teamwork',
  '合作':       'teamwork',
  '团队':       'teamwork',
  '分工':       'teamwork',
  '共同努力':   'teamwork',

  // ── loyalty ───────────────────────────────────────────────────────────────
  '生死之交':   'loyalty',
  '两肋插刀':   'loyalty',
  '惺惺相惜':   'loyalty',
  '肝胆相照':   'loyalty',
  '患难与共':   'loyalty',
  '风雨同舟':   'loyalty',
  '朋友':       'loyalty',
  '信任':       'loyalty',
  '忠诚':       'loyalty',
  '义气':       'loyalty',
  '背叛':       'loyalty',
}

// ─────────────────────────────────────────────────────────────────────────────
// TIER 2 — Body language & physical reaction keywords (隐性情绪线索)
//
// Students often "show, don't tell." They write "我的手在发抖" without ever
// writing "害怕". This tier catches those implicit emotional cues.
//
// Lookup priority: Tier 2 is checked AFTER Tier 1. If Tier 1 already matched,
// Tier 2 is skipped. This prevents "手" matching 'careful' when the student
// already wrote "害怕" explicitly.
// ─────────────────────────────────────────────────────────────────────────────
export const BODY_LANGUAGE_MAP: Record<string, ToneValue> = {

  // ── Physical trembling / shaking → fear / nervous ─────────────────────────
  '浑身发抖':   'fear',
  '双腿发软':   'fear',
  '四肢发抖':   'fear',
  '瑟瑟发抖':   'fear',
  '打冷战':     'fear',
  '汗毛竖起':   'fear',
  '脸色发白':   'fear',
  '脸色苍白':   'fear',
  '全身僵住':   'fear',
  '发抖':       'nervous',
  '颤抖':       'nervous',
  '手抖':       'nervous',
  '腿抖':       'nervous',

  // ── Sweating → nervous / rush ─────────────────────────────────────────────
  '满头大汗':   'nervous',
  '汗流浃背':   'nervous',
  '冒冷汗':     'nervous',
  '手心出汗':   'nervous',
  '手心冒汗':   'nervous',
  '额头冒汗':   'rush',
  '流汗':       'nervous',
  '大汗淋漓':   'rush',

  // ── Freezing / staring / dazed → sudden / fear ───────────────────────────
  '目瞪口呆':   'sudden',
  '愣住了':     'sudden',
  '愣在原地':   'sudden',
  '呆呆地站':   'sudden',
  '呆若木鸡':   'fear',
  '发呆':       'sudden',
  '愣神':       'sudden',
  '张口结舌':   'sudden',
  '说不出话':   'sudden',
  '脑子一片空白': 'fear',
  '脑袋空白':   'fear',

  // ── Stomping / clenching / grinding → angry ───────────────────────────────
  '握紧拳头':   'angry',
  '咬紧牙关':   'angry',
  '咬牙切齿':   'angry',
  '跺脚':       'angry',
  '拍桌子':     'angry',
  '摔东西':     'angry',
  '脸涨红':     'angry',
  '脸红脖子粗': 'angry',
  '青筋暴起':   'angry',

  // ── Lowering head / blushing / ashamed posture → regret ──────────────────
  '低下头':     'regret',
  '低着头':     'regret',
  '脸红':       'regret',
  '羞红了脸':   'regret',
  '无地自容':   'regret',
  '恨不得找缝钻': 'regret',
  '说不出口':   'regret',
  '眼眶湿润':   'sad',
  '眼眶红了':   'sad',
  '鼻子酸了':   'sad',
  '喉咙哽咽':   'sad',

  // ── Jumping / smiling broadly → joy ──────────────────────────────────────
  '蹦蹦跳跳':   'joy',
  '欢呼雀跃':   'joy',
  '跳了起来':   'joy',
  '拍手叫好':   'joy',
  '咧嘴笑':     'joy',
  '合不拢嘴':   'joy',
  '笑开了花':   'joy',
  '扑上去':     'joy',

  // ── Eyes wide / looking around cautiously → careful / strategy ───────────
  '东张西望':   'careful',
  '左顾右盼':   'careful',
  '四处张望':   'careful',
  '小心探头':   'careful',
  '踮起脚尖':   'careful',

  // ── Head held high / standing tall → proud ───────────────────────────────
  '昂首挺胸':   'proud',
  '挺起胸膛':   'proud',
  '神采飞扬':   'proud',
  '满脸笑容':   'proud',
  '精神抖擞':   'proud',

  // ── Rushing / running → rush ──────────────────────────────────────────────
  '冲了出去':   'rush',
  '飞奔而去':   'rush',
  '拔腿就跑':   'rush',
  '迫不及待':   'rush',
  '一刻也不停': 'rush',

  // ── Sitting quietly / reading / focusing → study ──────────────────────────
  '埋头苦读':   'study',
  '聚精会神':   'study',
  '全神贯注':   'study',
  '翻阅书本':   'study',
  '拿起书':     'study',

  // ── Crying silently / wiping tears → sad ─────────────────────────────────
  '悄悄抹泪':   'sad',
  '眼泪夺眶':   'sad',
  '泪水滑落':   'sad',
  '哽咽':       'sad',
  '抽泣':       'sad',

  // ── Pacing / unable to sit still → nervous ────────────────────────────────
  '走来走去':   'nervous',
  '坐立难安':   'nervous',
  '不停踱步':   'nervous',
  '心跳加速':   'nervous',
  '双手不停搓': 'nervous',
  '搓着手':     'nervous',
}

// ─────────────────────────────────────────────────────────────────────────────
// detectTone()
//
// Single entry point for the Muse useEffect.
// Runs Tier 1 first (explicit keywords), then Tier 2 (body language).
// Returns undefined if no match — caller falls back to section defaults.
//
// Example:
//   const tone = detectTone(currentText)
//   if (tone) {
//     const pool = IDIOM_BANK.filter(i => i.tone === tone && i.difficulty === difficulty)
//     setSuggestedIdioms(pool.sort(() => Math.random() - 0.5).slice(0, 3))
//     setMuseTriggered(true)
//     setMuseTriggerType(tone in BODY_LANGUAGE_MAP_KEYS ? 'body' : 'explicit')
//   }
// ─────────────────────────────────────────────────────────────────────────────
export function detectTone(text: string): ToneValue | undefined {
  // Tier 1 — explicit keywords (longer phrases checked first via entry order)
  for (const [keyword, tone] of Object.entries(TONE_KEYWORD_MAP)) {
    if (text.includes(keyword)) return tone
  }
  // Tier 2 — body language / physical reaction
  for (const [keyword, tone] of Object.entries(BODY_LANGUAGE_MAP)) {
    if (text.includes(keyword)) return tone
  }
  return undefined
}

// ─────────────────────────────────────────────────────────────────────────────
// Muse deduplication pattern
//
// The problem: if the student triggers 'fear' three times in one essay,
// the Muse shuffles the same small pool and shows repeats.
//
// Solution: track which idiom IDs have already been shown in this session.
// Pass the Set into the filter so shown idioms are excluded first.
// Only fall back to the full pool if the unseen pool is exhausted.
//
// In your CoachingFlow component:
//
//   const [shownIdiomIds, setShownIdiomIds] = useState<Set<string>>(new Set())
//
//   function getMuseSuggestions(tone: ToneValue, difficulty: string): Idiom[] {
//     const pool = IDIOM_BANK.filter(
//       i => i.tone === tone && i.difficulty === difficulty
//     )
//     const unseen = pool.filter(i => !shownIdiomIds.has(i.id))
//     const source = unseen.length >= 3 ? unseen : pool   // graceful fallback
//     const picked = source.sort(() => Math.random() - 0.5).slice(0, 3)
//     setShownIdiomIds(prev => new Set([...prev, ...picked.map(i => i.id)]))
//     return picked
//   }
//
// Reset shownIdiomIds when the student starts a new composition.
// ─────────────────────────────────────────────────────────────────────────────
