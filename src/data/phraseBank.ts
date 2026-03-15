// src/data/phraseBank.ts
// Singapore-appropriate, write-safe phrases for P3–P6 Chinese composition.
// Every character is writable by a P5 Singapore student.
// Each phrase is usable in at least three common PSLE themes.

export type PhraseCategory =
  | 'weather'
  | 'scene'
  | 'emotion_happy'
  | 'emotion_sad'
  | 'emotion_nervous'
  | 'emotion_angry'
  | 'action'
  | 'appearance'
  | 'psychology'
  | 'metaphor'
  | 'speech'
  | 'opening'
  | 'closing'

export interface Phrase {
  id: string
  category: PhraseCategory
  chinese: string
  pinyin?: string
  english: string
  example: string // Full example sentence using the phrase
  difficulty: 'P3P4' | 'P5P6'
}

export const PHRASE_BANK: Phrase[] = [

  // ── WEATHER ──────────────────────────────────────────────────
  {
    id: 'w01', category: 'weather', difficulty: 'P3P4',
    chinese: '大雨哗哗地下',
    english: 'Heavy rain poured down noisily',
    example: '大雨哗哗地下，同学们纷纷躲到走廊里避雨。'
  },
  {
    id: 'w02', category: 'weather', difficulty: 'P3P4',
    chinese: '太阳火辣辣地烤着大地',
    english: 'The blazing sun scorched the ground',
    example: '太阳火辣辣地烤着大地，操场上几乎没有人。'
  },
  {
    id: 'w03', category: 'weather', difficulty: 'P5P6',
    chinese: '乌云密布，天色越来越暗',
    english: 'Dark clouds gathered and the sky grew darker',
    example: '乌云密布，天色越来越暗，一场大雨眼看就要来临。'
  },
  {
    id: 'w04', category: 'weather', difficulty: 'P5P6',
    chinese: '雨点打在窗上，发出嘀嗒嘀嗒的声音',
    english: 'Raindrops tapped against the window with a pitter-patter sound',
    example: '雨点打在窗上，发出嘀嗒嘀嗒的声音，让人心里觉得很安静。'
  },
  {
    id: 'w05', category: 'weather', difficulty: 'P3P4',
    chinese: '凉风习习',
    english: 'A gentle breeze blowing',
    example: '凉风习习，树叶轻轻地摇摆着。'
  },

  // ── SCENE ────────────────────────────────────────────────────
  {
    id: 's01', category: 'scene', difficulty: 'P3P4',
    chinese: '校园里人来人往，热闹非凡',
    english: 'The school was busy with people coming and going',
    example: '下课铃一响，校园里人来人往，热闹非凡。'
  },
  {
    id: 's02', category: 'scene', difficulty: 'P3P4',
    chinese: '食堂里飘来阵阵香味',
    english: 'Waves of delicious aroma drifted from the canteen',
    example: '一走近食堂，里面飘来阵阵香味，让人肚子咕咕叫。'
  },
  {
    id: 's03', category: 'scene', difficulty: 'P5P6',
    chinese: '操场上传来阵阵加油声',
    english: 'Waves of cheering rang out from the field',
    example: '运动会那天，操场上传来阵阵加油声，气氛十分热烈。'
  },
  {
    id: 's04', category: 'scene', difficulty: 'P5P6',
    chinese: '走廊上一片寂静，只听见风声',
    english: 'The corridor was silent, with only the sound of wind',
    example: '考试开始了，走廊上一片寂静，只听见风声。'
  },

  // ── EMOTION: HAPPY ───────────────────────────────────────────
  {
    id: 'eh01', category: 'emotion_happy', difficulty: 'P3P4',
    chinese: '心里像喝了蜜一样甜',
    english: 'Heart felt as sweet as if drinking honey',
    example: '听到老师的夸奖，她心里像喝了蜜一样甜。'
  },
  {
    id: 'eh02', category: 'emotion_happy', difficulty: 'P5P6',
    chinese: '嘴角忍不住往上扬',
    english: 'Could not help the corners of the mouth curling upward',
    example: '拿到成绩单的那一刻，她嘴角忍不住往上扬。'
  },
  {
    id: 'eh03', category: 'emotion_happy', difficulty: 'P5P6',
    chinese: '心头像有一朵小花悄悄开了',
    english: 'It was as if a small flower quietly bloomed in the heart',
    example: '好朋友送来一张贺卡，她心头像有一朵小花悄悄开了。'
  },

  // ── EMOTION: SAD ─────────────────────────────────────────────
  {
    id: 'es01', category: 'emotion_sad', difficulty: 'P3P4',
    chinese: '眼眶红了，泪水在眼眶里打转',
    english: 'Eyes reddened and tears swirled in the eye sockets',
    example: '她努力忍着，但眼眶还是红了，泪水在眼眶里打转。'
  },
  {
    id: 'es02', category: 'emotion_sad', difficulty: 'P5P6',
    chinese: '心里像压着一块大石头，很不好受',
    english: 'It felt as if a heavy stone was pressing on the heart',
    example: '看到妈妈失望的眼神，她心里像压着一块大石头，很不好受。'
  },
  {
    id: 'es03', category: 'emotion_sad', difficulty: 'P5P6',
    chinese: '泪水不争气地流了下来',
    english: 'Tears fell uncontrollably',
    example: '她不想哭，可泪水不争气地流了下来。'
  },

  // ── EMOTION: NERVOUS ─────────────────────────────────────────
  {
    id: 'en01', category: 'emotion_nervous', difficulty: 'P3P4',
    chinese: '心跳得很快，手心也出汗了',
    english: 'Heart pounded rapidly and palms grew sweaty',
    example: '上台表演前，她心跳得很快，手心也出汗了。'
  },
  {
    id: 'en02', category: 'emotion_nervous', difficulty: 'P5P6',
    chinese: '他的心里像十五个吊桶打水——七上八下',
    english: 'Heart was in a flutter, like fifteen buckets drawing water — going up and down',
    example: '等待成绩公布时，他的心里像十五个吊桶打水——七上八下。'
  },
  {
    id: 'en03', category: 'emotion_nervous', difficulty: 'P5P6',
    chinese: '腿有些发软，迈不开步子',
    english: 'Legs went a little weak and steps became difficult',
    example: '站在起跑线前，她腿有些发软，迈不开步子。'
  },

  // ── EMOTION: ANGRY ───────────────────────────────────────────
  {
    id: 'ea01', category: 'emotion_angry', difficulty: 'P3P4',
    chinese: '气得脸都红了',
    english: 'So angry that the face turned red',
    example: '同学说了不公平的话，她气得脸都红了。'
  },
  {
    id: 'ea02', category: 'emotion_angry', difficulty: 'P5P6',
    chinese: '胸口像堵着一口气，怎么也消不掉',
    english: 'It felt as if a breath was stuck in the chest that could not be released',
    example: '看到大家不理她，她胸口像堵着一口气，怎么也消不掉。'
  },

  // ── ACTION ───────────────────────────────────────────────────
  {
    id: 'ac01', category: 'action', difficulty: 'P3P4',
    chinese: '蹑手蹑脚地走过去',
    english: 'Tiptoed over quietly',
    example: '她不想吵醒妈妈，便蹑手蹑脚地走过去关上灯。'
  },
  {
    id: 'ac02', category: 'action', difficulty: 'P3P4',
    chinese: '飞快地跑过去',
    english: 'Dashed over at full speed',
    example: '她看见朋友摔倒了，立刻飞快地跑过去扶他。'
  },
  {
    id: 'ac03', category: 'action', difficulty: 'P5P6',
    chinese: '低着头，默默地收拾书包',
    english: 'Head lowered, quietly packing the school bag',
    example: '考试没考好，她低着头，默默地收拾书包，一句话也没说。'
  },
  {
    id: 'ac04', category: 'action', difficulty: 'P5P6',
    chinese: '把嘴唇咬得发白',
    english: 'Bit the lips until they turned white',
    example: '她忍住不哭，把嘴唇咬得发白。'
  },

  // ── APPEARANCE ───────────────────────────────────────────────
  {
    id: 'ap01', category: 'appearance', difficulty: 'P3P4',
    chinese: '满脸通红',
    english: 'Face completely flushed red',
    example: '在台上念错了字，他满脸通红，恨不得找个地方躲起来。'
  },
  {
    id: 'ap02', category: 'appearance', difficulty: 'P5P6',
    chinese: '眼神里带着一丝不安',
    english: 'Eyes held a trace of unease',
    example: '她走进办公室，眼神里带着一丝不安。'
  },

  // ── PSYCHOLOGY ───────────────────────────────────────────────
  {
    id: 'ps01', category: 'psychology', difficulty: 'P3P4',
    chinese: '心里有一个声音说',
    english: 'A voice inside the heart said',
    example: '心里有一个声音说：你一定可以做到的！'
  },
  {
    id: 'ps02', category: 'psychology', difficulty: 'P5P6',
    chinese: '脑子里不停地转着一个念头',
    english: 'One thought kept turning over and over in the mind',
    example: '她脑子里不停地转着一个念头——万一失败了怎么办？'
  },
  {
    id: 'ps03', category: 'psychology', difficulty: 'P5P6',
    chinese: '后悔的感觉像一根刺，扎在心上',
    english: 'Regret felt like a thorn lodged in the heart',
    example: '看着同学哭泣，她后悔的感觉像一根刺，扎在心上。'
  },

  // ── METAPHOR ─────────────────────────────────────────────────
  {
    id: 'me01', category: 'metaphor', difficulty: 'P5P6',
    chinese: '他的笑容像太阳一样，让人看了心里暖暖的',
    english: 'His smile was like the sun, warming the heart of all who saw it',
    example: '他的笑容像太阳一样，让人看了心里暖暖的。'
  },
  {
    id: 'me02', category: 'metaphor', difficulty: 'P5P6',
    chinese: '那句话像一把刀，深深地插进她的心里',
    english: 'Those words were like a knife, cutting deep into the heart',
    example: '那句话像一把刀，深深地插进她的心里，久久无法平复。'
  },
  {
    id: 'me03', category: 'metaphor', difficulty: 'P5P6',
    chinese: '泪水像断了线的珠子，一颗一颗地滴下来',
    english: 'Tears fell like beads slipping off a broken thread, one by one',
    example: '她再也忍不住了，泪水像断了线的珠子，一颗一颗地滴下来。'
  },

  // ── SPEECH ───────────────────────────────────────────────────
  {
    id: 'sp01', category: 'speech', difficulty: 'P3P4',
    chinese: '轻声说道',
    english: 'Said softly',
    example: '她走到好友身边，轻声说道：「没关系，我陪着你。」'
  },
  {
    id: 'sp02', category: 'speech', difficulty: 'P5P6',
    chinese: '鼓起勇气，开口说',
    english: 'Summoned up courage and spoke',
    example: '她鼓起勇气，开口说：「老师，是我不小心打破的。」'
  },

  // ── OPENING ──────────────────────────────────────────────────
  {
    id: 'op01', category: 'opening', difficulty: 'P3P4',
    chinese: '那一天，发生了一件让我永远忘不了的事',
    english: 'That day, something happened that I will never forget',
    example: '那一天，发生了一件让我永远忘不了的事。'
  },
  {
    id: 'op02', category: 'opening', difficulty: 'P5P6',
    chinese: '如果时间可以倒流，我真希望那一幕从未发生过',
    english: 'If time could be reversed, I truly wish that moment had never happened',
    example: '如果时间可以倒流，我真希望那一幕从未发生过。'
  },

  // ── CLOSING ──────────────────────────────────────────────────
  {
    id: 'cl01', category: 'closing', difficulty: 'P3P4',
    chinese: '这件事让我明白了一个道理',
    english: 'This incident taught me an important lesson',
    example: '这件事让我明白了一个道理：真正的朋友，在你最难受的时候才会出现。'
  },
  {
    id: 'cl02', category: 'closing', difficulty: 'P5P6',
    chinese: '直到今天，每当我想起那一幕，心里还是会暖暖的',
    english: 'Even today, whenever I recall that moment, my heart still feels warm',
    example: '直到今天，每当我想起那一幕，心里还是会暖暖的。'
  }
]

export const PHRASE_CATEGORY_LABELS: Record<PhraseCategory, string> = {
  weather:         '天气描写',
  scene:           '场景描写',
  emotion_happy:   '开心',
  emotion_sad:     '难过',
  emotion_nervous: '紧张',
  emotion_angry:   '生气',
  action:          '动作描写',
  appearance:      '外貌描写',
  psychology:      '心理描写',
  metaphor:        '比喻句',
  speech:          '语言描写',
  opening:         '开头',
  closing:         '结尾'
}

export function getPhrasesByCategory(category: PhraseCategory): Phrase[] {
  return PHRASE_BANK.filter(p => p.category === category)
}

export function getPhrasesByDifficulty(difficulty: 'P3P4' | 'P5P6'): Phrase[] {
  return PHRASE_BANK.filter(p => p.difficulty === difficulty)
}
