// src/data/idiomBank.ts
// Singapore-appropriate Chinese idioms for P3–P6 composition.
// Every character is writable by a P5 Singapore student.
// All idioms are usable in at least three common PSLE themes.

export interface Idiom {
  id: string
  chinese: string
  pinyin: string
  meaningChinese: string
  meaningEnglish: string
  example: string
  difficulty: 'P3P4' | 'P5P6'
  themes: string[] // e.g. ['helping others', 'friendship', 'perseverance']
}

export const IDIOM_BANK: Idiom[] = [
  {
    id: 'i01', chinese: '七上八下', pinyin: 'qī shàng bā xià',
    meaningChinese: '心里慌乱，不安定',
    meaningEnglish: 'Feeling anxious and unsettled',
    example: '考试前，她心里七上八下，根本睡不着。',
    difficulty: 'P3P4', themes: ['exam', 'competition', 'nervousness']
  },
  {
    id: 'i02', chinese: '心花怒放', pinyin: 'xīn huā nù fàng',
    meaningChinese: '心情非常高兴，像花朵盛开一样',
    meaningEnglish: 'Overjoyed; heart blooming with happiness',
    example: '听到自己获奖了，她心花怒放，高兴得跳了起来。',
    difficulty: 'P3P4', themes: ['achievement', 'happiness', 'competition']
  },
  {
    id: 'i03', chinese: '手忙脚乱', pinyin: 'shǒu máng jiǎo luàn',
    meaningChinese: '形容做事慌张，不知所措',
    meaningEnglish: 'Flustered; not knowing what to do',
    example: '她一下子找不到准考证，顿时手忙脚乱。',
    difficulty: 'P3P4', themes: ['exam', 'accident', 'daily life']
  },
  {
    id: 'i04', chinese: '坚持不懈', pinyin: 'jiān chí bù xiè',
    meaningChinese: '坚定地一直做下去，不放弃',
    meaningEnglish: 'To persevere without giving up',
    example: '她坚持不懈地练习，终于学会了游泳。',
    difficulty: 'P3P4', themes: ['perseverance', 'sports', 'learning']
  },
  {
    id: 'i05', chinese: '知错能改', pinyin: 'zhī cuò néng gǎi',
    meaningChinese: '知道自己的错误，能够改正',
    meaningEnglish: 'Able to acknowledge and correct one\'s mistakes',
    example: '老师说，知错能改，才是真正的勇气。',
    difficulty: 'P3P4', themes: ['moral values', 'friendship', 'school life']
  },
  {
    id: 'i06', chinese: '品学兼优', pinyin: 'pǐn xué jiān yōu',
    meaningChinese: '品格和学业都很好',
    meaningEnglish: 'Excellent in both conduct and studies',
    example: '班长是全班品学兼优的同学，大家都很尊敬她。',
    difficulty: 'P5P6', themes: ['character', 'school life', 'achievement']
  },
  {
    id: 'i07', chinese: '助人为乐', pinyin: 'zhù rén wéi lè',
    meaningChinese: '以帮助别人为快乐',
    meaningEnglish: 'Finding joy in helping others',
    example: '她总是助人为乐，同学们都喜欢找她帮忙。',
    difficulty: 'P3P4', themes: ['helping others', 'friendship', 'moral values']
  },
  {
    id: 'i08', chinese: '自作自受', pinyin: 'zì zuò zì shòu',
    meaningChinese: '自己做了错事，自己承担后果',
    meaningEnglish: 'Suffering the consequences of one\'s own actions',
    example: '他不听劝告，结果自作自受，只好自己承担。',
    difficulty: 'P5P6', themes: ['moral values', 'accident', 'consequences']
  },
  {
    id: 'i09', chinese: '后悔莫及', pinyin: 'hòu huǐ mò jí',
    meaningChinese: '后悔也来不及了',
    meaningEnglish: 'Too late to regret',
    example: '她这才知道自己错了，但已经后悔莫及。',
    difficulty: 'P5P6', themes: ['regret', 'moral values', 'friendship']
  },
  {
    id: 'i10', chinese: '半途而废', pinyin: 'bàn tú ér fèi',
    meaningChinese: '做事做到一半就放弃了',
    meaningEnglish: 'To give up halfway',
    example: '做事不能半途而废，要坚持到最后。',
    difficulty: 'P5P6', themes: ['perseverance', 'learning', 'sports']
  },
  {
    id: 'i11', chinese: '全力以赴', pinyin: 'quán lì yǐ fù',
    meaningChinese: '用全部的力量去做某件事',
    meaningEnglish: 'To give one\'s all; to go all out',
    example: '运动会上，她全力以赴，为班级争取荣誉。',
    difficulty: 'P5P6', themes: ['sports', 'competition', 'perseverance']
  },
  {
    id: 'i12', chinese: '迫不及待', pinyin: 'pò bù jí dài',
    meaningChinese: '急得不能再等',
    meaningEnglish: 'Unable to wait any longer; eager',
    example: '她迫不及待地打开礼物，眼睛亮了起来。',
    difficulty: 'P3P4', themes: ['happiness', 'daily life', 'excitement']
  },
  {
    id: 'i13', chinese: '目瞪口呆', pinyin: 'mù dèng kǒu dāi',
    meaningChinese: '眼睛和嘴巴都来不及反应，形容非常惊讶',
    meaningEnglish: 'Stunned and speechless with surprise',
    example: '看到变魔术的表演，她目瞪口呆，说不出话来。',
    difficulty: 'P3P4', themes: ['surprise', 'daily life', 'school life']
  },
  {
    id: 'i14', chinese: '无忧无虑', pinyin: 'wú yōu wú lǜ',
    meaningChinese: '没有烦恼，生活开心自在',
    meaningEnglish: 'Carefree and without worries',
    example: '小时候，她每天无忧无虑，整天在外面玩耍。',
    difficulty: 'P3P4', themes: ['childhood', 'happiness', 'daily life']
  },
  {
    id: 'i15', chinese: '泪如雨下', pinyin: 'lèi rú yǔ xià',
    meaningChinese: '眼泪像下雨一样不停流下来',
    meaningEnglish: 'Tears falling like rain; crying uncontrollably',
    example: '听到这个消息，她泪如雨下，无法平静。',
    difficulty: 'P5P6', themes: ['sadness', 'family', 'friendship']
  },
  {
    id: 'i16', chinese: '将心比心', pinyin: 'jiāng xīn bǐ xīn',
    meaningChinese: '站在别人的角度为别人着想',
    meaningEnglish: 'To put oneself in another\'s shoes',
    example: '妈妈说，将心比心，才能真正理解别人的感受。',
    difficulty: 'P5P6', themes: ['moral values', 'friendship', 'family']
  },
  {
    id: 'i17', chinese: '一鸣惊人', pinyin: 'yī míng jīng rén',
    meaningChinese: '突然做出了让人非常惊讶的成绩',
    meaningEnglish: 'To achieve a stunning success that surprises everyone',
    example: '她平时安安静静，却在比赛中一鸣惊人，拿下了第一名。',
    difficulty: 'P5P6', themes: ['competition', 'achievement', 'surprise']
  },
  {
    id: 'i18', chinese: '专心致志', pinyin: 'zhuān xīn zhì zhì',
    meaningChinese: '全神贯注，认真做一件事',
    meaningEnglish: 'Completely focused and dedicated',
    example: '她专心致志地做作业，连门铃响了也没听见。',
    difficulty: 'P3P4', themes: ['learning', 'exam', 'school life']
  },
  {
    id: 'i19', chinese: '患难见真情', pinyin: 'huàn nàn jiàn zhēn qíng',
    meaningChinese: '在困难的时候，才能看出真正的感情',
    meaningEnglish: 'True feelings are revealed in times of difficulty',
    example: '她生病住院，好朋友每天来陪她，真是患难见真情。',
    difficulty: 'P5P6', themes: ['friendship', 'family', 'moral values']
  },
  {
    id: 'i20', chinese: '马到成功', pinyin: 'mǎ dào chéng gōng',
    meaningChinese: '一开始做就成功了，形容顺利',
    meaningEnglish: 'Immediate success upon starting',
    example: '祝你考试马到成功，一切顺利！',
    difficulty: 'P3P4', themes: ['exam', 'achievement', 'encouragement']
  },
  {
    id: 'i21', chinese: '不知所措', pinyin: 'bù zhī suǒ cuò',
    meaningChinese: '不知道该怎么办，感到慌张',
    meaningEnglish: 'Not knowing what to do; at a loss',
    example: '发现书包不见了，她顿时不知所措，站在原地发呆。',
    difficulty: 'P3P4', themes: ['accident', 'daily life', 'nervousness']
  },
  {
    id: 'i22', chinese: '悔不当初', pinyin: 'huǐ bù dāng chū',
    meaningChinese: '后悔当时没有做出正确的选择',
    meaningEnglish: 'Regretting one\'s initial decision',
    example: '她没有好好复习，考完试才悔不当初。',
    difficulty: 'P5P6', themes: ['regret', 'exam', 'moral values']
  },
  {
    id: 'i23', chinese: '竭尽全力', pinyin: 'jié jìn quán lì',
    meaningChinese: '用尽全部力气和心思',
    meaningEnglish: 'To do one\'s utmost; to spare no effort',
    example: '她竭尽全力地完成比赛，虽然没拿第一，但毫不遗憾。',
    difficulty: 'P5P6', themes: ['sports', 'competition', 'perseverance']
  },
  {
    id: 'i24', chinese: '关怀备至', pinyin: 'guān huái bèi zhì',
    meaningChinese: '关心照顾得非常周到',
    meaningEnglish: 'Showing thorough and thoughtful care',
    example: '她受伤了，同学们关怀备至，让她很感动。',
    difficulty: 'P5P6', themes: ['friendship', 'family', 'helping others']
  },
  {
    id: 'i25', chinese: '勇往直前', pinyin: 'yǒng wǎng zhí qián',
    meaningChinese: '勇敢地向前走，不退缩',
    meaningEnglish: 'To press forward bravely without hesitation',
    example: '面对困难，她勇往直前，从不轻易放弃。',
    difficulty: 'P5P6', themes: ['perseverance', 'character', 'competition']
  }
]

export function getIdiomById(id: string): Idiom | undefined {
  return IDIOM_BANK.find(i => i.id === id)
}

export function getIdiomsByDifficulty(difficulty: 'P3P4' | 'P5P6'): Idiom[] {
  return IDIOM_BANK.filter(i => i.difficulty === difficulty)
}

export function getIdiomsByTheme(theme: string): Idiom[] {
  return IDIOM_BANK.filter(i => i.themes.includes(theme))
}
