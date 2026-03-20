// src/data/compositionTopics.ts

export type CompositionTheme =
  | 'values'        // 品德与价值观
  | 'growth'        // 成长与反思
  | 'courage'       // 勇气
  | 'friendship'    // 友情
  | 'family'        // 亲情
  | 'teachers'      // 师恩
  | 'community'     // 邻里与他人
  | 'perseverance'  // 坚持与努力
  | 'forgiveness'   // 原谅与和解
  | 'open'          // 开放主题

export type CompositionType =
  | 'event'         // 写事
  | 'person'        // 写人
  | 'object'        // 写物

export type CompositionLevel = 'P3' | 'P4' | 'P5' | 'P6' | 'PSLE'

export interface ScaffoldQuestion {
  sectionIndex: 0 | 1 | 2 | 3 | 4
  // 0=开头 1=起因 2=经过① 3=经过② 4=结果与感想
  questionCn: string
}

export interface CompositionTopic {
  id: string
  level: CompositionLevel
  type: CompositionType
  theme: CompositionTheme
  titleCn: string
  year?: number
  source?: string
  scaffoldQuestions: ScaffoldQuestion[]
}

export const COMPOSITION_TOPICS: CompositionTopic[] = [

  // ─── P3 ─────────────────────────────────────────────────
  {
    id: 'p3-family-a',
    level: 'P3',
    type: 'event',
    theme: 'family',
    titleCn: '一次难忘的家庭活动',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你们去了哪里或做了什么' },
      { sectionIndex: 1, questionCn: '活动是怎么开始的' },
      { sectionIndex: 2, questionCn: '活动中发生了什么事' },
      { sectionIndex: 3, questionCn: '出现了什么问题或有趣的情况' },
      { sectionIndex: 4, questionCn: '你有什么感受' },
    ],
  },
  {
    id: 'p3-family-b',
    level: 'P3',
    type: 'event',
    theme: 'family',
    titleCn: '我帮家人做了一件事',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你帮了家人做什么' },
      { sectionIndex: 1, questionCn: '你为什么决定帮忙' },
      { sectionIndex: 2, questionCn: '帮忙的过程是怎样的' },
      { sectionIndex: 3, questionCn: '家人有什么反应' },
      { sectionIndex: 4, questionCn: '你有什么感受' },
    ],
  },
  {
    id: 'p3-friendship-a',
    level: 'P3',
    type: 'event',
    theme: 'friendship',
    titleCn: '我帮助了一位同学',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '那位同学遇到了什么困难' },
      { sectionIndex: 1, questionCn: '你是怎么发现他需要帮助的' },
      { sectionIndex: 2, questionCn: '你怎么帮助他' },
      { sectionIndex: 3, questionCn: '结果怎么样' },
      { sectionIndex: 4, questionCn: '你有什么感受' },
    ],
  },
  {
    id: 'p3-friendship-b',
    level: 'P3',
    type: 'event',
    theme: 'friendship',
    titleCn: '我和朋友一起玩耍',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你们在哪里玩' },
      { sectionIndex: 1, questionCn: '你们玩了什么游戏' },
      { sectionIndex: 2, questionCn: '玩耍时发生了什么有趣的事' },
      { sectionIndex: 3, questionCn: '玩耍结束时你们有什么感受' },
      { sectionIndex: 4, questionCn: '这件事让你明白了什么' },
    ],
  },
  {
    id: 'p3-school-a',
    level: 'P3',
    type: 'event',
    theme: 'growth',
    titleCn: '我学会了一件新事情',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你学的是什么' },
      { sectionIndex: 1, questionCn: '为什么你想学这件事' },
      { sectionIndex: 2, questionCn: '学习的过程是怎样的' },
      { sectionIndex: 3, questionCn: '你遇到了什么困难，怎样克服' },
      { sectionIndex: 4, questionCn: '学会后你有什么感受' },
    ],
  },
  {
    id: 'p3-school-b',
    level: 'P3',
    type: 'event',
    theme: 'growth',
    titleCn: '我在学校犯了一个错误',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你犯了什么错误' },
      { sectionIndex: 1, questionCn: '你是怎么犯这个错误的' },
      { sectionIndex: 2, questionCn: '老师或同学有什么反应' },
      { sectionIndex: 3, questionCn: '你怎么改正这个错误' },
      { sectionIndex: 4, questionCn: '你从中学到了什么' },
    ],
  },
  {
    id: 'p3-values-a',
    level: 'P3',
    type: 'event',
    theme: 'values',
    titleCn: '一次让我感到开心的事',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '是什么事让你开心' },
      { sectionIndex: 1, questionCn: '这件事是怎么发生的' },
      { sectionIndex: 2, questionCn: '发生了哪些事情' },
      { sectionIndex: 3, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 4, questionCn: '你为什么感到开心' },
    ],
  },
  {
    id: 'p3-open-a',
    level: 'P3',
    type: 'event',
    theme: 'open',
    titleCn: '一件令我难忘的事',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '事情是怎样发生的' },
      { sectionIndex: 2, questionCn: '经过是怎样的' },
      { sectionIndex: 3, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 4, questionCn: '为什么这件事令你难忘' },
    ],
  },
  {
    id: 'p3-community-a',
    level: 'P3',
    type: 'event',
    theme: 'community',
    titleCn: '我认识了一位新朋友',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你在哪里认识这位新朋友的' },
      { sectionIndex: 1, questionCn: '你们是怎么开始交谈的' },
      { sectionIndex: 2, questionCn: '你们一起做了什么事' },
      { sectionIndex: 3, questionCn: '这位新朋友给你留下什么印象' },
      { sectionIndex: 4, questionCn: '你有什么感受' },
    ],
  },
  {
    id: 'p3-perseverance-a',
    level: 'P3',
    type: 'event',
    theme: 'perseverance',
    titleCn: '我努力做到了一件难事',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '那件难事是什么' },
      { sectionIndex: 1, questionCn: '为什么它对你来说很难' },
      { sectionIndex: 2, questionCn: '你是怎么努力去做的' },
      { sectionIndex: 3, questionCn: '结果怎么样' },
      { sectionIndex: 4, questionCn: '你有什么感受' },
    ],
  },

  // ─── P4 ─────────────────────────────────────────────────
  {
    id: 'p4-family-a',
    level: 'P4',
    type: 'event',
    theme: 'family',
    titleCn: '一次难忘的家庭旅行',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你们去了哪里' },
      { sectionIndex: 1, questionCn: '旅行是怎么开始的' },
      { sectionIndex: 2, questionCn: '途中发生了什么事' },
      { sectionIndex: 3, questionCn: '有什么让你印象最深的' },
      { sectionIndex: 4, questionCn: '你有什么感受' },
    ],
  },
  {
    id: 'p4-family-b',
    level: 'P4',
    type: 'event',
    theme: 'family',
    titleCn: '这件事让我更了解父母的辛苦',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '发生了什么事' },
      { sectionIndex: 1, questionCn: '父母是怎么辛苦的' },
      { sectionIndex: 2, questionCn: '你是怎么发现这件事的' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你有什么感受' },
    ],
  },
  {
    id: 'p4-friendship-a',
    level: 'P4',
    type: 'event',
    theme: 'friendship',
    titleCn: '这件事让我更珍惜朋友',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 2, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 3, questionCn: '这件事对你和朋友的关系有什么影响' },
      { sectionIndex: 4, questionCn: '你从中明白了什么' },
    ],
  },
  {
    id: 'p4-friendship-b',
    level: 'P4',
    type: 'event',
    theme: 'friendship',
    titleCn: '我和同学合作完成了一件事',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你们要合作完成什么' },
      { sectionIndex: 1, questionCn: '合作的过程是怎样的' },
      { sectionIndex: 2, questionCn: '你们遇到了什么困难' },
      { sectionIndex: 3, questionCn: '你们是怎么解决困难的' },
      { sectionIndex: 4, questionCn: '你从中学到了什么' },
    ],
  },
  {
    id: 'p4-growth-a',
    level: 'P4',
    type: 'event',
    theme: 'growth',
    titleCn: '这件事让我改掉了一个坏习惯',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你有什么坏习惯' },
      { sectionIndex: 1, questionCn: '发生了什么让你决定改变' },
      { sectionIndex: 2, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 3, questionCn: '你是如何改变的' },
      { sectionIndex: 4, questionCn: '你从这件事学到了什么' },
    ],
  },
  {
    id: 'p4-growth-b',
    level: 'P4',
    type: 'event',
    theme: 'growth',
    titleCn: '一次让我感到骄傲的经历',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '发生了什么事' },
      { sectionIndex: 1, questionCn: '你做了什么让自己感到骄傲的事' },
      { sectionIndex: 2, questionCn: '别人有什么反应' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你有什么感想' },
    ],
  },
  {
    id: 'p4-values-a',
    level: 'P4',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我学会了诚实',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '发生了什么事' },
      { sectionIndex: 1, questionCn: '你当时有什么选择' },
      { sectionIndex: 2, questionCn: '你选择怎么做，为什么' },
      { sectionIndex: 3, questionCn: '事情的结果是怎样的' },
      { sectionIndex: 4, questionCn: '你从中明白了什么' },
    ],
  },
  {
    id: 'p4-values-b',
    level: 'P4',
    type: 'event',
    theme: 'values',
    titleCn: '我做了一件好事',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你做了什么好事' },
      { sectionIndex: 1, questionCn: '事情是怎么发生的' },
      { sectionIndex: 2, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 3, questionCn: '对方有什么反应' },
      { sectionIndex: 4, questionCn: '你有什么感受' },
    ],
  },
  {
    id: 'p4-perseverance-a',
    level: 'P4',
    type: 'event',
    theme: 'perseverance',
    titleCn: '这件事让我明白了坚持的重要',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你在做什么事' },
      { sectionIndex: 1, questionCn: '你遇到了什么困难' },
      { sectionIndex: 2, questionCn: '你有没有想过放弃，为什么没有放弃' },
      { sectionIndex: 3, questionCn: '事情最后怎样了' },
      { sectionIndex: 4, questionCn: '你从中学到了什么' },
    ],
  },
  {
    id: 'p4-open-a',
    level: 'P4',
    type: 'event',
    theme: 'open',
    titleCn: '一件让我感动的事',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 2, questionCn: '事情是怎样发生的' },
      { sectionIndex: 3, questionCn: '这件事为什么让你感动' },
      { sectionIndex: 4, questionCn: '你有什么感想' },
    ],
  },
  {
    id: 'p4-community-a',
    level: 'P4',
    type: 'event',
    theme: 'community',
    titleCn: '我帮助了一个陌生人',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '那个陌生人是谁，遇到了什么困难' },
      { sectionIndex: 1, questionCn: '你是怎么发现他需要帮助的' },
      { sectionIndex: 2, questionCn: '你是怎么帮助他的' },
      { sectionIndex: 3, questionCn: '对方有什么反应' },
      { sectionIndex: 4, questionCn: '你从这件事明白了什么' },
    ],
  },
  {
    id: 'p4-teachers-a',
    level: 'P4',
    type: 'event',
    theme: 'teachers',
    titleCn: '我的老师帮助了我',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你遇到了什么困难' },
      { sectionIndex: 1, questionCn: '老师发现了你的困难' },
      { sectionIndex: 2, questionCn: '老师怎么帮助你' },
      { sectionIndex: 3, questionCn: '结果怎么样' },
      { sectionIndex: 4, questionCn: '你有什么感受' },
    ],
  },

  // ─── PSLE ───────────────────────────────────────────────
  {
    id: 'psle-2024',
    level: 'PSLE',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我明白了答应别人的事一定要做到',
    year: 2024,
    source: 'PSLE 2024',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2023',
    level: 'PSLE',
    type: 'event',
    theme: 'friendship',
    titleCn: '这件事让我感谢朋友',
    year: 2023,
    source: 'PSLE 2023',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2022',
    level: 'PSLE',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我明白了耐心的重要',
    year: 2022,
    source: 'PSLE 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 2, questionCn: '你周围的人对这件事有什么反应' },
      { sectionIndex: 3, questionCn: '这件事怎样让你明白耐心的重要' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'psle-2021',
    level: 'PSLE',
    type: 'object',
    theme: 'open',
    titleCn: '一份珍贵的礼物',
    year: 2021,
    source: 'PSLE 2021',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2020',
    level: 'PSLE',
    type: 'event',
    theme: 'values',
    titleCn: '这样做是自私的',
    year: 2020,
    source: 'PSLE 2020',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2019',
    level: 'PSLE',
    type: 'event',
    theme: 'open',
    titleCn: '我做了正确的决定',
    year: 2019,
    source: 'PSLE 2019',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2018',
    level: 'PSLE',
    type: 'event',
    theme: 'friendship',
    titleCn: '这件事让我更加了解我的朋友',
    year: 2018,
    source: 'PSLE 2018',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2017',
    level: 'PSLE',
    type: 'object',
    theme: 'open',
    titleCn: '一份珍贵的礼物',
    year: 2017,
    source: 'PSLE 2017',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2016',
    level: 'PSLE',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我明白了互相合作的重要性',
    year: 2016,
    source: 'PSLE 2016',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2015',
    level: 'PSLE',
    type: 'event',
    theme: 'values',
    titleCn: '说真话对我有好处',
    year: 2015,
    source: 'PSLE 2015',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2014',
    level: 'PSLE',
    type: 'event',
    theme: 'friendship',
    titleCn: '这件事让我明白了友情的可贵',
    year: 2014,
    source: 'PSLE 2014',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2013',
    level: 'PSLE',
    type: 'person',
    theme: 'community',
    titleCn: '我的好邻居',
    year: 2013,
    source: 'PSLE 2013',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2012',
    level: 'PSLE',
    type: 'event',
    theme: 'open',
    titleCn: '在学校主办的一项活动中，发生了一件意想不到的事',
    year: 2012,
    source: 'PSLE 2012',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2011',
    level: 'PSLE',
    type: 'event',
    theme: 'open',
    titleCn: '这一天对我来说很特别',
    year: 2011,
    source: 'PSLE 2011',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2010',
    level: 'PSLE',
    type: 'event',
    theme: 'growth',
    titleCn: '他的话使我改过自新',
    year: 2010,
    source: 'PSLE 2010',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2009',
    level: 'PSLE',
    type: 'event',
    theme: 'growth',
    titleCn: '这件事让我改掉了坏习惯',
    year: 2009,
    source: 'PSLE 2009',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2008',
    level: 'PSLE',
    type: 'event',
    theme: 'values',
    titleCn: '我再也不敢没有礼貌了',
    year: 2008,
    source: 'PSLE 2008',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2007',
    level: 'PSLE',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我明白了储蓄的重要',
    year: 2007,
    source: 'PSLE 2007',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2006',
    level: 'PSLE',
    type: 'event',
    theme: 'values',
    titleCn: '贪心的结果',
    year: 2006,
    source: 'PSLE 2006',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2005',
    level: 'PSLE',
    type: 'person',
    theme: 'community',
    titleCn: '家里来了一个意想不到的陌生人',
    year: 2005,
    source: 'PSLE 2005',
    scaffoldQuestions: []
  },
  {
    id: 'psle-2004',
    level: 'PSLE',
    type: 'event',
    theme: 'family',
    titleCn: '一件令父母开心的事',
    year: 2004,
    source: 'PSLE 2004',
    scaffoldQuestions: []
  },

  // ─── P6 ─────────────────────────────────────────────────
  {
    id: 'p6-2025-a',
    level: 'P6',
    type: 'event',
    theme: 'courage',
    titleCn: '我做了一个勇敢的决定',
    year: 2025,
    source: 'P6 Prelim 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '你做了什么决定' },
      { sectionIndex: 2, questionCn: '为什么你认为做这个决定很勇敢' },
      { sectionIndex: 3, questionCn: '这个决定对你和你周围的人有什么影响' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p6-2025-b',
    level: 'P6',
    type: 'event',
    theme: 'friendship',
    titleCn: '这件事影响了我和同学的感情',
    year: 2025,
    source: 'P6 Prelim 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 2, questionCn: '这件事怎么影响你和同学的感情' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你对这件事有什么感想' }
    ]
  },
  {
    id: 'p6-2025-c',
    level: 'P6',
    type: 'event',
    theme: 'courage',
    titleCn: '这件事让我明白了勇气的重要',
    year: 2025,
    source: 'P6 Prelim 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这件事发生在什么时候' },
      { sectionIndex: 1, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 2, questionCn: '你为什么需要勇气' },
      { sectionIndex: 3, questionCn: '这件事怎样让你明白勇气的重要' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p6-2025-d',
    level: 'P6',
    type: 'event',
    theme: 'family',
    titleCn: '这件事让我明白了亲情的可贵',
    year: 2025,
    source: 'P6 Prelim 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些家人跟这件事有关' },
      { sectionIndex: 2, questionCn: '这件事怎样让你体会到亲情的可贵' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到或明白了什么' }
    ]
  },
  {
    id: 'p6-2025-e',
    level: 'P6',
    type: 'event',
    theme: 'family',
    titleCn: '这件事让我发现家人的辛苦',
    year: 2025,
    source: 'P6 Prelim 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '你怎么发现这位家人很辛苦' },
      { sectionIndex: 2, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 3, questionCn: '你对这件事有什么感受' },
      { sectionIndex: 4, questionCn: '你从这件事学到了什么' }
    ]
  },
  {
    id: 'p6-2024-a',
    level: 'P6',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我学会了要尊重长辈',
    year: 2024,
    source: 'P6 Prelim 2024',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人和这件事有关' },
      { sectionIndex: 2, questionCn: '你周围的人对这件事有什么反应' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '这件事怎样让你学会要尊重长辈' }
    ]
  },
  {
    id: 'p6-2024-b',
    level: 'P6',
    type: 'event',
    theme: 'teachers',
    titleCn: '我得到了老师的称赞',
    year: 2024,
    source: 'P6 Prelim 2024',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '发生了什么事情' },
      { sectionIndex: 1, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 2, questionCn: '老师怎样称赞你' },
      { sectionIndex: 3, questionCn: '这件事让你有什么感受' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p6-2024-c',
    level: 'P6',
    type: 'event',
    theme: 'values',
    titleCn: '做事没有责任心的后果',
    year: 2024,
    source: 'P6 Prelim 2024',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 2, questionCn: '不负责任造成了什么后果' },
      { sectionIndex: 3, questionCn: '哪些人受到了影响' },
      { sectionIndex: 4, questionCn: '你从这件事学到了什么' }
    ]
  },
  {
    id: 'p6-2023-a',
    level: 'P6',
    type: 'event',
    theme: 'forgiveness',
    titleCn: '我原谅了他',
    year: 2023,
    source: 'P6 Prelim 2023',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '他是谁' },
      { sectionIndex: 1, questionCn: '他做了什么事' },
      { sectionIndex: 2, questionCn: '你为什么原谅他' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中明白了什么' }
    ]
  },
  {
    id: 'p6-2023-b',
    level: 'P6',
    type: 'event',
    theme: 'open',
    titleCn: '一件让我印象最深刻的事',
    year: 2023,
    source: 'P6 Prelim 2023',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人和这件事有关' },
      { sectionIndex: 2, questionCn: '这件事是如何影响你的' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '为什么你对这件事印象深刻' }
    ]
  },
  {
    id: 'p6-2023-c',
    level: 'P6',
    type: 'event',
    theme: 'forgiveness',
    titleCn: '她终于原谅了我',
    year: 2023,
    source: 'P6 Prelim 2023',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你和她之间发生了什么事' },
      { sectionIndex: 1, questionCn: '后来怎么了' },
      { sectionIndex: 2, questionCn: '你有什么感受' },
      { sectionIndex: 3, questionCn: '结果怎样' },
      { sectionIndex: 4, questionCn: '你从中学到或明白了什么' }
    ]
  },
  {
    id: 'p6-2022-a',
    level: 'P6',
    type: 'event',
    theme: 'values',
    titleCn: '说真话对我有好处',
    year: 2022,
    source: 'P6 Prelim 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你在什么情况下说了真话' },
      { sectionIndex: 1, questionCn: '为什么你会说真话' },
      { sectionIndex: 2, questionCn: '说了真话对你和其他人有什么影响' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p6-2022-b',
    level: 'P6',
    type: 'event',
    theme: 'friendship',
    titleCn: '我差一点儿失去了这位好朋友',
    year: 2022,
    source: 'P6 Prelim 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这位好朋友是谁' },
      { sectionIndex: 1, questionCn: '你们之间发生了什么事' },
      { sectionIndex: 2, questionCn: '你们是怎么和好的' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事学到了什么' }
    ]
  },
  {
    id: 'p6-2022-c',
    level: 'P6',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我学会了不要骗人',
    year: 2022,
    source: 'P6 Prelim 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 2, questionCn: '骗人有什么不好的结果' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p6-2022-d',
    level: 'P6',
    type: 'event',
    theme: 'friendship',
    titleCn: '我错怪了一位朋友',
    year: 2022,
    source: 'P6 Prelim 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这件事是怎样发生的' },
      { sectionIndex: 1, questionCn: '你怎么知道自己错怪了这位朋友' },
      { sectionIndex: 2, questionCn: '这件事的结果怎样' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你对这件事有什么感想' }
    ]
  },
  {
    id: 'p6-2022-e',
    level: 'P6',
    type: 'event',
    theme: 'growth',
    titleCn: '这件事让我从失败中成长',
    year: 2022,
    source: 'P6 Prelim 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 2, questionCn: '这件事是怎么改变你的' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },

  // ─── P5 ─────────────────────────────────────────────────
  {
    id: 'p5-2025-a',
    level: 'P5',
    type: 'event',
    theme: 'family',
    titleCn: '这件事让我明白了要关心父母',
    year: 2025,
    source: 'P5 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '为什么你会这么做' },
      { sectionIndex: 2, questionCn: '父母对这件事有什么反应' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你用什么方式让你的父母知道你关心他们' }
    ]
  },
  {
    id: 'p5-2025-b',
    level: 'P5',
    type: 'event',
    theme: 'growth',
    titleCn: '这件事让我感到惭愧',
    year: 2025,
    source: 'P5 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '发生了什么事' },
      { sectionIndex: 1, questionCn: '你为什么会感到惭愧' },
      { sectionIndex: 2, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到什么' }
    ]
  },
  {
    id: 'p5-2025-c',
    level: 'P5',
    type: 'event',
    theme: 'teachers',
    titleCn: '我获得了老师的表扬',
    year: 2025,
    source: 'P5 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '你做了什么' },
      { sectionIndex: 2, questionCn: '你的行为带来了什么结果' },
      { sectionIndex: 3, questionCn: '老师怎样表扬你' },
      { sectionIndex: 4, questionCn: '你有什么感想' }
    ]
  },
  {
    id: 'p5-2025-d',
    level: 'P5',
    type: 'event',
    theme: 'teachers',
    titleCn: '这件事让我明白老师是为了我好',
    year: 2025,
    source: 'P5 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '发生了什么事' },
      { sectionIndex: 1, questionCn: '老师做了什么' },
      { sectionIndex: 2, questionCn: '结果怎么样' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你有什么感受' }
    ]
  },
  {
    id: 'p5-2025-e',
    level: 'P5',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我改掉了坏习惯',
    year: 2025,
    source: 'P5 2025',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你有什么坏习惯' },
      { sectionIndex: 1, questionCn: '这个坏习惯对你或他人造成了什么影响' },
      { sectionIndex: 2, questionCn: '后来发生了什么事让你下决心改过' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你是怎样改掉坏习惯的' }
    ]
  },
  {
    id: 'p5-2024-a',
    level: 'P5',
    type: 'event',
    theme: 'open',
    titleCn: '我最喜欢的一堂课',
    year: 2024,
    source: 'P5 2024',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一堂什么课' },
      { sectionIndex: 1, questionCn: '上课的过程是怎样的' },
      { sectionIndex: 2, questionCn: '为什么你喜欢这堂课' },
      { sectionIndex: 3, questionCn: '课上发生了什么特别的事' },
      { sectionIndex: 4, questionCn: '你从这堂课中学到了什么' }
    ]
  },
  {
    id: 'p5-2024-b',
    level: 'P5',
    type: 'event',
    theme: 'community',
    titleCn: '他的善良让我难忘',
    year: 2024,
    source: 'P5 2024',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '他是谁' },
      { sectionIndex: 1, questionCn: '他做了什么事' },
      { sectionIndex: 2, questionCn: '你为什么会记得他做的事' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '这件事对你有什么影响' }
    ]
  },
  {
    id: 'p5-2024-c',
    level: 'P5',
    type: 'event',
    theme: 'open',
    titleCn: '这次我终于做到了',
    year: 2024,
    source: 'P5 2024',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '你在之前遇到了什么难题' },
      { sectionIndex: 2, questionCn: '你怎样解决所遇到的难题' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p5-2024-d',
    level: 'P5',
    type: 'event',
    theme: 'open',
    titleCn: '一件让我感动的事',
    year: 2024,
    source: 'P5 2024',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 1, questionCn: '这件事是如何发生的' },
      { sectionIndex: 2, questionCn: '为什么这件事让你感动' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p5-2023-a',
    level: 'P5',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我明白要遵守规则',
    year: 2023,
    source: 'P5 2023',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '这件事给谁带来影响' },
      { sectionIndex: 2, questionCn: '你对这件事有什么反应' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '经过这件事后你会有什么改变' }
    ]
  },
  {
    id: 'p5-2023-b',
    level: 'P5',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我明白了分享能带来快乐',
    year: 2023,
    source: 'P5 2023',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 2, questionCn: '你周围的人对这件事有什么反应' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '为什么你会明白分享能带来快乐' }
    ]
  },
  {
    id: 'p5-2023-c',
    level: 'P5',
    type: 'event',
    theme: 'friendship',
    titleCn: '这件事让我和邻居和好了',
    year: 2023,
    source: 'P5 2023',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你和邻居的关系之前怎么样' },
      { sectionIndex: 1, questionCn: '发生了什么事' },
      { sectionIndex: 2, questionCn: '这件事是怎么发生的' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事明白了什么' }
    ]
  },
  {
    id: 'p5-2023-d',
    level: 'P5',
    type: 'event',
    theme: 'friendship',
    titleCn: '这件事让我明白了朋友的重要',
    year: 2023,
    source: 'P5 2023',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '跟这件事有关的人是谁' },
      { sectionIndex: 2, questionCn: '你得到了什么帮助' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事学到了什么道理' }
    ]
  },
  {
    id: 'p5-2023-e',
    level: 'P5',
    type: 'event',
    theme: 'growth',
    titleCn: '这件事让我重新认识自己',
    year: 2023,
    source: 'P5 2023',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 2, questionCn: '这件事怎样影响你' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '这件事让你明白了什么' }
    ]
  },
  {
    id: 'p5-2022-a',
    level: 'P5',
    type: 'event',
    theme: 'growth',
    titleCn: '我再也不会这么做了',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你做了什么事' },
      { sectionIndex: 1, questionCn: '这件事是怎么发生的' },
      { sectionIndex: 2, questionCn: '这件事的结果是什么' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p5-2022-b',
    level: 'P5',
    type: 'event',
    theme: 'open',
    titleCn: '一件令我后悔的事',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你做了什么事' },
      { sectionIndex: 1, questionCn: '这件事对谁有影响' },
      { sectionIndex: 2, questionCn: '你对这件事有什么感受' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '这件事让你明白了什么' }
    ]
  },
  {
    id: 'p5-2022-c',
    level: 'P5',
    type: 'event',
    theme: 'perseverance',
    titleCn: '这件事让我学到了坚持到底',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这件事发生在什么时候' },
      { sectionIndex: 1, questionCn: '这件事的经过是怎样的' },
      { sectionIndex: 2, questionCn: '这件事的结果如何' },
      { sectionIndex: 3, questionCn: '你遇到了什么困难' },
      { sectionIndex: 4, questionCn: '你有什么感受' }
    ]
  },
  {
    id: 'p5-2022-d',
    level: 'P5',
    type: 'event',
    theme: 'family',
    titleCn: '我做了一件令父母感到骄傲的事',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '这件事是怎么发生的' },
      { sectionIndex: 2, questionCn: '父母为什么会为你感到骄傲' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p5-2022-e',
    level: 'P5',
    type: 'event',
    theme: 'growth',
    titleCn: '我不再骄傲了',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你以前为什么会骄傲' },
      { sectionIndex: 1, questionCn: '发生了什么事让你做出改变' },
      { sectionIndex: 2, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '这件事对你有什么影响' }
    ]
  },
  {
    id: 'p5-2022-f',
    level: 'P5',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我明白了不要轻易相信不认识的人',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是什么事' },
      { sectionIndex: 1, questionCn: '这件事是怎样发生的' },
      { sectionIndex: 2, questionCn: '为什么这件事会让你不再相信不认识的人' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '发生这件事后，你有什么感受' }
    ]
  },
  {
    id: 'p5-2022-g',
    level: 'P5',
    type: 'event',
    theme: 'family',
    titleCn: '这件事让家人为我感到骄傲',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你做了什么事让家人感到骄傲' },
      { sectionIndex: 1, questionCn: '你的家人是怎么知道你做这件事的' },
      { sectionIndex: 2, questionCn: '你的家人当时有什么反应' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你当时有什么感想' }
    ]
  },
  {
    id: 'p5-2022-h',
    level: 'P5',
    type: 'event',
    theme: 'growth',
    titleCn: '我再也不迟到了',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '你为什么会迟到' },
      { sectionIndex: 1, questionCn: '你迟到造成了什么后果' },
      { sectionIndex: 2, questionCn: '对于你的行为，别人有什么反应' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中明白了什么' }
    ]
  },
  {
    id: 'p5-2022-i',
    level: 'P5',
    type: 'event',
    theme: 'perseverance',
    titleCn: '这件事让我学会了不要放弃',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '发生了什么事' },
      { sectionIndex: 1, questionCn: '哪些人和这件事有关' },
      { sectionIndex: 2, questionCn: '什么原因使你不要放弃' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
  {
    id: 'p5-2022-j',
    level: 'P5',
    type: 'event',
    theme: 'growth',
    titleCn: '这件事让我不再胆小',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '这件事发生在什么时候' },
      { sectionIndex: 2, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 3, questionCn: '你遇到了什么困难' },
      { sectionIndex: 4, questionCn: '这件事为什么让你不再胆小' }
    ]
  },
  {
    id: 'p5-2022-k',
    level: 'P5',
    type: 'event',
    theme: 'values',
    titleCn: '这件事让我学会了分享',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '这是一件什么事' },
      { sectionIndex: 1, questionCn: '哪些人跟这件事有关' },
      { sectionIndex: 2, questionCn: '这件事怎样让你学会分享' },
      { sectionIndex: 3, questionCn: '事情的经过是怎样的' },
      { sectionIndex: 4, questionCn: '你对这件事有什么感受' }
    ]
  },
  {
    id: 'p5-2022-l',
    level: 'P5',
    type: 'event',
    theme: 'open',
    titleCn: '一件让我后悔的事',
    year: 2022,
    source: 'P5 2022',
    scaffoldQuestions: [
      { sectionIndex: 0, questionCn: '发生了什么事' },
      { sectionIndex: 1, questionCn: '事情的经过是怎么样的' },
      { sectionIndex: 2, questionCn: '这件事为什么让你后悔' },
      { sectionIndex: 3, questionCn: '这件事对谁有影响' },
      { sectionIndex: 4, questionCn: '你从这件事中学到了什么' }
    ]
  },
]

// ── Helper functions ──────────────────────────────────────

export function getTopicsByLevel(level: CompositionLevel): CompositionTopic[] {
  return COMPOSITION_TOPICS.filter(t => t.level === level)
}

export function getTopicsByTheme(theme: CompositionTheme): CompositionTopic[] {
  return COMPOSITION_TOPICS.filter(t => t.theme === theme)
}

export function getTopicById(id: string): CompositionTopic | undefined {
  return COMPOSITION_TOPICS.find(t => t.id === id)
}

export const THEME_LABELS: Record<CompositionTheme, { cn: string; en: string }> = {
  values:       { cn: '品德与价值观', en: 'Values' },
  growth:       { cn: '成长与反思',   en: 'Growth' },
  courage:      { cn: '勇气',         en: 'Courage' },
  friendship:   { cn: '友情',         en: 'Friendship' },
  family:       { cn: '亲情',         en: 'Family' },
  teachers:     { cn: '师恩',         en: 'Teachers' },
  community:    { cn: '邻里与他人',   en: 'Community' },
  perseverance: { cn: '坚持与努力',   en: 'Perseverance' },
  forgiveness:  { cn: '原谅与和解',   en: 'Forgiveness' },
  open:         { cn: '开放主题',     en: 'Open Theme' },
}

export const LEVEL_LABELS: Record<CompositionLevel, { cn: string; en: string }> = {
  P3:   { cn: '小学三年级', en: 'Primary 3' },
  P4:   { cn: '小学四年级', en: 'Primary 4' },
  P5:   { cn: '小学五年级', en: 'Primary 5' },
  P6:   { cn: '小学六年级', en: 'Primary 6' },
  PSLE: { cn: 'PSLE 真题',  en: 'PSLE Past Years' },
}
