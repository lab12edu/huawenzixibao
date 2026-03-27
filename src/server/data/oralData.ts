// ============================================================
// oralData.ts — Huawen Zixibao Oral Practice Vault
// 28 sets · 7 themes · PSLE archive 2002–2025
//
// Architecture:
//   • Raw vault data (OralVaultSet[]) lives here — server-side only.
//   • A transform layer maps compact JSON → full OralSet shape
//     so existing panel components (ReadingAloudPanel, PictureStoryPanel,
//     VocabPrepPanel) continue to work without modification.
//   • NEVER import oralSets directly on the frontend.
//     Use /api/oral/themes and /api/oral/set/:id instead.
// ============================================================

// ── Raw JSON vault types ──────────────────────────────────────────────────────

interface PeelAnswer {
  point:          string;
  elaboration:    string;
  example:        string;
  link:           string;
  pointEn?:       string;
  elaborationEn?: string;
  exampleEn?:     string;
  linkEn?:        string;
}

interface VaultQuestion {
  cn:          string;
  en:          string;
  peelAnswer?: PeelAnswer;
  keywords?:   string[];   // per-question keyword override; falls back to set targetKeywords
}

type FocusSkill = 'Phonetic' | 'Narrative' | 'Vocab' | 'Opinion';

interface VaultSet {
  id: string;
  yearLabel: string;
  themeId: ThemeId;
  subThemeCn: string;
  subThemeEn: string;
  focusSkill: FocusSkill;
  reading: {
    text: string;
    targetWords: string[];
  };
  conversation: {
    storyboardDesc:       string;
    scenarioDescription?:   string;  // if absent, falls back to storyboardDesc
    scenarioDescriptionEn?: string;  // English translation for parent mode
    questions:              { q1: VaultQuestion; q2: VaultQuestion; q3: VaultQuestion };
    targetKeywords:       string[];
    guidingPointers?:     string[];
    newsAnchor?:          string;
    moralReflection?:     string;
  };
}

// ── Public TypeScript interfaces (re-exported for components) ─────────────────

export interface OralVocabItem {
  chinese: string;
  pinyin: string;
  english: string;
  exampleChinese?: string;
  exampleEnglish?: string;
}

export interface OralPeelAnswer {
  point:          string;
  elaboration:    string;
  example:        string;
  link:           string;
  pointEn?:       string;
  elaborationEn?: string;
  exampleEn?:     string;
  linkEn?:        string;
}

export interface OralQuestion {
  questionChinese:    string;
  questionEnglish:    string;
  starterChinese:     string;
  starterEnglish:     string;
  modelAnswerChinese: string;
  modelAnswerEnglish: string;
  keyPhrases:         string[];
  peelAnswer?:        OralPeelAnswer;
}

export interface OralPassage {
  paragraphs: string[];
  difficulty: '基础' | '中级' | '高级';
  characterCount: number;
}

export interface OralVideoFrame {
  descriptionChinese: string;
  descriptionEnglish: string;
  captionChinese: string;
  captionEnglish: string;
}

export interface OralPictureStory {
  titleChinese:        string;
  titleEnglish:        string;
  introChinese:        string;
  introEnglish:        string;
  narratorChinese:     string;
  narratorEnglish:     string;
  scenarioDescription:   string;  // examiner's verbal scenario prompt (Chinese)
  scenarioDescriptionEn: string;  // English translation for parent mode
  frames: [OralVideoFrame, OralVideoFrame, OralVideoFrame, OralVideoFrame]; // kept for backward compat — do not render in ConversationPanel ★
}

export interface OralSet {
  id: string;
  setNumber: number;
  themeId: ThemeId;
  themeChinese: string;
  themeEnglish: string;
  subThemeCn: string;
  subThemeEn: string;
  focusSkill: string;
  moralChinese: string;
  accentColour: string;
  levels: string[];
  psleYears: string[];
  vocab: OralVocabItem[];
  questions: {
    q1: OralQuestion;
    q2: OralQuestion;
    q3: OralQuestion;
    q3TipByLevel: { advanced: string; standard: string };
  };
  passage: OralPassage;
  pictureStory: OralPictureStory;
  /** Absolute URL to a pre-recorded MP3 for this set's reading passage.
   *  Pattern: /audio/oral/${id}.mp3
   *  File is served as a Cloudflare Pages static asset from public/audio/oral/.
   *  When the file is absent (404), SpeechButton falls back to speakPassage(). */
  audioUrl:         string;
  scenarioAudioUrl?:      string;   // set to `/audio/oral/${id}_scenario.mp3` once recorded
  scenarioDescriptionEn?: string;   // English translation of scenario for parent mode
  guidingPointers?:       string[];
  newsAnchor?:       string;
  moralReflection?:  string;
}

// ── Theme metadata ────────────────────────────────────────────────────────────

export type ThemeId = 'school' | 'civic' | 'community' | 'environment' | 'personal' | 'safety' | 'tech';

export interface OralTheme {
  id: ThemeId;
  titleChinese: string;
  titleEnglish: string;
  descChinese: string;
  descEnglish: string;
  icon: string;
  accentColour: string;
  moralChinese: string;
}

export const ORAL_THEMES: OralTheme[] = [
  {
    id: 'school',
    titleChinese: '学校生活',
    titleEnglish: 'School Life',
    descChinese: '食堂、运动会、团队合作',
    descEnglish: 'Canteen, sports day, teamwork',
    icon: 'fa-solid fa-school',
    accentColour: '#1565C0',
    moralChinese: '友谊',
  },
  {
    id: 'civic',
    titleChinese: '公民与公德',
    titleEnglish: 'Civic Responsibility',
    descChinese: '公共场所礼仪、乘车礼貌',
    descEnglish: 'Public etiquette, transport courtesy',
    icon: 'fa-solid fa-city',
    accentColour: '#00695C',
    moralChinese: '公德心',
  },
  {
    id: 'community',
    titleChinese: '邻里与社区',
    titleEnglish: 'Community & Neighbourhood',
    descChinese: '邻里互助、义工服务、甘榜精神',
    descEnglish: 'Mutual aid, volunteering, kampong spirit',
    icon: 'fa-solid fa-people-roof',
    accentColour: '#6A1B9A',
    moralChinese: '同理心',
  },
  {
    id: 'environment',
    titleChinese: '环保与自然',
    titleEnglish: 'Environment & Nature',
    descChinese: '节约资源、减少浪费、爱护地球',
    descEnglish: 'Save resources, reduce waste, protect Earth',
    icon: 'fa-solid fa-leaf',
    accentColour: '#2E7D32',
    moralChinese: '环保',
  },
  {
    id: 'personal',
    titleChinese: '个人成长',
    titleEnglish: 'Personal Development',
    descChinese: '健康习惯、家务、阅读、旅游',
    descEnglish: 'Healthy habits, chores, reading, travel',
    icon: 'fa-solid fa-seedling',
    accentColour: '#AD1457',
    moralChinese: '责任感',
  },
  {
    id: 'safety',
    titleChinese: '安全意识',
    titleEnglish: 'Safety Awareness',
    descChinese: '道路安全、网络安全、自我保护',
    descEnglish: 'Road safety, cyber safety, self-protection',
    icon: 'fa-solid fa-shield-halved',
    accentColour: '#F57F17',
    moralChinese: '安全',
  },
  {
    id: 'tech',
    titleChinese: '科技与生活',
    titleEnglish: 'Technology & Life',
    descChinese: '电子产品、网络、科技对社会的影响',
    descEnglish: 'Devices, internet, technology\'s impact',
    icon: 'fa-solid fa-microchip',
    accentColour: '#4E342E',
    moralChinese: '勤奋',
  },
];

export const THEME_COLOURS: Record<string, string> = {
  '责任感': '#E65100',
  '友谊':   '#1565C0',
  '公德心': '#00695C',
  '环保':   '#2E7D32',
  '同理心': '#AD1457',
  '安全':   '#F57F17',
  '勤奋':   '#4E342E',
  '健康':   '#6A1B9A',
};

// ── Pinyin lookup for targetWords ─────────────────────────────────────────────
// Covers all targetWords used across the 28 sets.
const PINYIN_MAP: Record<string, string> = {
  // school
  '清晨': 'qīng chén', '清新': 'qīng xīn', '乐龄人士': 'lè líng rén shì',
  '修剪': 'xiū jiǎn', '敬佩': 'jìng pèi', '自动自觉': 'zì dòng zì jué',
  '整洁': 'zhěng jié', '彩旗飞扬': 'cǎi qí fēi yáng', '欢声笑语': 'huān shēng xiào yǔ',
  '代表': 'dài biǎo', '咬紧牙关': 'yǎo jǐn yá guān', '坚持': 'jiān chí',
  '掌声': 'zhǎng shēng', '胜利': 'shèng lì', '指导': 'zhǐ dǎo',
  '壁画': 'bì huà', '分工合作': 'fēn gōng hé zuò', '构图': 'gòu tú',
  '调色': 'tiáo sè', '团队': 'tuán duì', '体会': 'tǐ huì',
  '欢送会': 'huān sòng huì', '依依不舍': 'yī yī bù shě', '教导': 'jiào dǎo',
  '道理': 'dào lǐ', '献花': 'xiàn huā', '努力': 'nǔ lì',
  // civic
  '建议': 'jiàn yì', '宜人': 'yí rén', '赞叹': 'zàn tàn',
  '壮观': 'zhuàng guān', '热情': 'rè qíng', '礼貌': 'lǐ mào',
  '放松': 'fàng sōng', '熟食中心': 'shú shí zhōng xīn', '自觉': 'zì jué',
  '托盘': 'tuō pán', '夸奖': 'kuā jiǎng', '改善': 'gǎi shàn',
  '卫生': 'wèi shēng', '懂事': 'dǒng shì', '热闹': 'rè nào',
  '尽情': 'jìn qíng', '齐心协力': 'qí xīn xié lì', '居民': 'jū mín',
  '责任': 'zé rèn', '轻松': 'qīng sōng', '求知': 'qiú zhī',
  '气氛': 'qì fēn', '遵守': 'zūn shǒu', '规章制度': 'guī zhāng zhì dù',
  '严重': 'yán zhòng', '专注力': 'zhuān zhù lì', '修养': 'xiū yǎng',
  // community
  '组屋区': 'zǔ wū qū', '沉重': 'chén zhòng', '关怀': 'guān huái',
  '行为': 'xíng wéi', '美好': 'měi hǎo', '和谐': 'hé xié',
  '期间': 'qī jiān', '义工': 'yì gōng', '责任感': 'zé rèn gǎn',
  '整理': 'zhěng lǐ', '充实': 'chōng shí', '助人为乐': 'zhù rén wéi lè',
  '经历': 'jīng lì', '傍晚': 'bàng wǎn', '锻炼': 'duàn liàn',
  '点滴': 'diǎn dī', '亲切': 'qīn qiē', '感情': 'gǎn qíng',
  '紧密': 'jǐn mì', '团结': 'tuán jié', '工具': 'gōng jù',
  '满头大汗': 'mǎn tóu dà hàn', '成就感': 'chéng jiù gǎn', '保护': 'bǎo hù',
  '本分': 'běn fèn', '共同努力': 'gòng tóng nǔ lì',
  // environment
  '挑战': 'tiǎo zhàn', '积极': 'jī jí', '塑料制品': 'sù liào zhì pǐn',
  '养成': 'yǎng chéng', '自然环境': 'zì rán huán jìng', '影响': 'yǐng xiǎng',
  '源泉': 'yuán quán', '珍惜': 'zhēn xī', '意识': 'yì shí',
  '充足': 'chōng zú', '节约': 'jié yuē', '供水': 'gōng shuǐ',
  '后代': 'hòu dài', '干劲十足': 'gàn jìn shí zú', '沙滩': 'shā tān',
  '废弃': 'fèi qì', '受害': 'shòu hài', '爱护': 'ài hù',
  '浪费': 'làng fèi', '忽视': 'hū shì', '剩余': 'shèng yú',
  '适量': 'shì liàng', '贪心': 'tān xīn', '贡献': 'gòng xiàn',
  '排放': 'pái fàng',
  // personal
  '兴奋': 'xīng fèn', '景点': 'jǐng diǎn', '特色美食': 'tè sè měi shí',
  '大开眼界': 'dà kāi yǎn jiè', '情谊': 'qíng yì', '共度': 'gòng dù',
  '良好': 'liáng hǎo', '习惯': 'xí guàn', '奇妙': 'qí miào',
  '独立思考': 'dú lì sī kǎo', '宝藏': 'bǎo zàng', '精神世界': 'jīng shén shì jiè',
  '饮食': 'yǐn shí', '摄入': 'shè rù', '吸引力': 'xī yǐn lì',
  '损害': 'sǔn hài', '合理': 'hé lǐ', '精力': 'jīng lì',
  '注重': 'zhù zhòng', '必经之路': 'bì jīng zhī lù', '毅力': 'yì lì',
  '整洁有序': 'zhěng jié yǒu xù', '体贴': 'tǐ tiē', '感谢': 'gǎn xiè',
  // safety
  '安全': 'ān quán', '危险': 'wēi xiǎn', '注意': 'zhù yì',
  '保障': 'bǎo zhàng', '谨慎': 'jǐn shèn', '事故': 'shì gù',
  '预防': 'yù fáng', '网络': 'wǎng luò', '陌生人': 'mò shēng rén',
  '自我保护': 'zì wǒ bǎo hù', '求助': 'qiú zhù', '紧急': 'jǐn jí',
  '规则': 'guī zé', '遵守规则': 'zūn shǒu guī zé', '安全意识': 'ān quán yì shí',
  '交通': 'jiāo tōng', '闯红灯': 'chuǎng hóng dēng', '后果': 'hòu guǒ',
  '保护自己': 'bǎo hù zì jǐ', '骑车': 'qí chē',
  // tech
  '科技': 'kē jì', '电子产品': 'diàn zǐ chǎn pǐn', '上网': 'shàng wǎng',
  '成瘾': 'chéng yǐn', '沉迷': 'chén mí',
  '合理使用': 'hé lǐ shǐ yòng', '自律': 'zì lǜ', '人工智能': 'rén gōng zhì néng',
  '方便': 'fāng biàn', '依赖': 'yī lài', '节制': 'jié zhì',
  '社交媒体': 'shè jiāo méi tǐ', '隐私': 'yǐn sī', '虚假信息': 'xū jiǎ xìn xī',
  '辨别': 'biàn bié',
  // shared
  '体谅': 'tǐ liàng',
  // school — civic interaction / canteen / classroom
  '推挤': 'tuī jǐ', '收拾碗碟': 'shōu shí wǎn dié', '礼让': 'lǐ ràng',
  '意外': 'yì wài', '见义勇为': 'jiàn yì yǒng wéi', '友谊第一': 'yǒu yì dì yī',
  '扶起': 'fú qǐ', '感动': 'gǎn dòng', '不小心': 'bù xiǎo xīn',
  '涂鸦': 'tú yā', '收拾': 'shōu shí', '合作': 'hé zuò',
  '互相体谅': 'hù xiāng tǐ liàng', '感激': 'gǎn jī', '卡片': 'kǎ piàn',
  '尊师重道': 'zūn shī zhòng dào', '难舍难分': 'nán shě nán fēn', '礼物': 'lǐ wù',
  '大声喧哗': 'dà shēng xuān huá', '让位': 'ràng wèi',
  '体谅他人': 'tǐ liàng tā rén', '碗碟': 'wǎn dié', '保持卫生': 'bǎo chí wèi shēng',
  '肮脏': 'āng zāng', '小贩中心': 'xiǎo fàn zhōng xīn',
  '乱丢垃圾': 'luàn diū lā jī', '提醒': 'tí xǐng', '爱护公物': 'ài hù gōng wù',
  '垃圾桶': 'lā jī tǒng', '以身作则': 'yǐ shēn zuò zé',
  '安静': 'ān jìng', '自私': 'zì sī', '干扰': 'gān rǎo',
  '专注': 'zhuān zhù', '道歉': 'dào qiàn',
  // community
  '远亲不如近邻': 'yuǎn qīn bù rú jìn lín', '互相照顾': 'hù xiāng zhào gù',
  '温馨': 'wēn xīn', '举手之劳': 'jǔ shǒu zhī láo', '人情味': 'rén qíng wèi',
  '温暖': 'wēn nuǎn', '爱心': 'ài xīn',
  '分享美食': 'fēn xiǎng měi shí', '各族同胞': 'gè zú tóng bāo',
  '凝聚力': 'níng jù lì', '庆祝': 'qìng zhù',
  '甘榜精神': 'gān bǎng jīng shén', '分享': 'fēn xiǎng',
  '收成': 'shōu chéng', '邻里关系': 'lín lǐ guān xì', '耕种': 'gēng zhòng',
  // environment
  '再循环': 'zài xún huán', '蓝色回收箱': 'lán sè huí shōu xiāng',
  '分类': 'fēn lèi', '环保意识': 'huán bǎo yì shí',
  '节约用水': 'jié yuē yòng shuǐ', '水龙头': 'shuǐ lóng tóu',
  '捡垃圾': 'jiǎn lā jī', '海洋生物': 'hǎi yáng shēng wù',
  '污染': 'wū rǎn', '保护环境': 'bǎo hù huán jìng', '参与': 'cān yǔ',
  '光盘行动': 'guāng pán xíng dòng', '粒粒皆辛苦': 'lì lì jiē xīn kǔ',
  '珍惜食物': 'zhēn xī shí wù',
  // personal / family
  '亲子关系': 'qīn zǐ guān xì', '沟通': 'gōu tōng',
  '其乐融融': 'qí lè róng róng', '天伦之乐': 'tiān lún zhī lè',
  '美好回忆': 'měi hǎo huí yì',
  '博览群书': 'bó lǎn qún shū', '保护视力': 'bǎo hù shì lì',
  '知识就是力量': 'zhī shì jiù shì lì liàng',
  '均衡饮食': 'jūn héng yǐn shí', '营养': 'yíng yǎng',
  '强身健体': 'qiáng shēn jiàn tǐ', '病从口入': 'bìng cóng kǒu rù',
  '自理能力': 'zì lǐ néng lì', '分担家务': 'fēn dān jiā wù',
  '感恩': 'gǎn ēn', '独立': 'dú lì',
  // safety
  '头盔': 'tóu kuī', '刹车': 'shā chē', '安全措施': 'ān quán cuò shī',
  '负责任': 'fù zé rèn', '网络霸凌': 'wǎng luò bā líng',
  '安全上网': 'ān quán shàng wǎng', '违规': 'wéi guī', '制止': 'zhì zhǐ',
  // tech
  '家庭关系': 'jiā tíng guān xì', '面对面交流': 'miàn duì miàn jiāo liú',
  '健康使用': 'jiàn kāng shǐ yòng', '核实': 'hé shí', '误导': 'wù dǎo',
  '编程': 'biān chéng', '人机合作': 'rén jī hé zuò',
  '未来技能': 'wèi lái jì néng', '适应': 'shì yìng', '创新': 'chuàng xīn',
  '时间管理': 'shí jiān guǎn lǐ', '自控': 'zì kòng',
  '游戏成瘾': 'yóu xì chéng yǐn', '学业': 'xué yè', '平衡': 'píng héng',
  // civic / transport per-question keywords
  '公德心': 'gōng dé xīn', '有秩序': 'yǒu zhì xù', '依次': 'yī cì',
  '耐心等候': 'nài xīn děng hòu', '不插队': 'bù chā duì',
  '公共礼仪': 'gōng gòng lǐ yí', '互相尊重': 'hù xiāng zūn zhòng',
  '自觉排队': 'zì jué pái duì', '文明行为': 'wén míng xíng wéi',
  '体现': 'tǐ xiàn', '素质': 'sù zhì', '低声交谈': 'dī shēng jiāo tán',
  '言行举止': 'yán xíng jǔ zhǐ', '有助于': 'yǒu zhù yú',
  '社会和谐': 'shè huì hé xié', '良好习惯': 'liáng hǎo xí guàn',
  '尊重他人': 'zūn zhòng tā rén', '主动让座': 'zhǔ dòng ràng zuò',
  '关爱': 'guān ài', '力所能及': 'lì suǒ néng jí',
  '身体力行': 'shēn tǐ lì xíng', '从小培养': 'cóng xiǎo péi yǎng',
  '奉献精神': 'fèng xiàn jīng shén',
  // conjunction patterns (appear in keyPhrases chips)
  '不仅……也……': 'bù jǐn…… yě……', '一方面……另一方面……': 'yī fāng miàn…… lìng yī fāng miàn……',
  '既……又……': 'jì…… yòu……',
  // family / tech t1 per-question keywords
  '团聚': 'tuán jù', '长辈': 'zhǎng bèi', '晚辈': 'wǎn bèi',
  '一家人': 'yī jiā rén', '饭桌礼仪': 'fàn zhuō lǐ yí',
  '家庭凝聚力': 'jiā tíng níng jù lì', '尊老爱幼': 'zūn lǎo ài yòu',
  '传统价值观': 'chuán tǒng jià zhí guān', '代代相传': 'dài dài xiāng chuán',
  '家庭温暖': 'jiā tíng wēn nuǎn', '家庭教育': 'jiā tíng jiào yù',
  '言传身教': 'yán chuán shēn jiào', '潜移默化': 'qián yí mò huà',
  '难忘': 'nán wàng', '印象深刻': 'yìn xiàng shēn kè',
  '温馨时光': 'wēn xīn shí guāng', '感情深厚': 'gǎn qíng shēn hòu',
  '回味无穷': 'huí wèi wú qióng', '家人陪伴': 'jiā rén péi bàn',
  '心怀感恩': 'xīn huái gǎn ēn', '倍感温暖': 'bèi gǎn wēn nuǎn',
  // p3 weekend leisure
  '紧张': 'jǐn zhāng', '期待': 'qī dài', '篮球场': 'lán qiú chǎng',
  '家务': 'jiā wù', '有规律': 'yǒu guī lǜ', '精神充沛': 'jīng shén chōng pèi',
  // p4 diary
  '感受': 'gǎn shòu', '反省': 'fǎn xǐng', '成熟': 'chéng shú',
  '珍贵': 'zhēn guì', '瞬间': 'shùn jiān',
  // a1 road safety
  '交通灯': 'jiāo tōng dēng', '虚线': 'xū xiàn', '十字路口': 'shí zì lù kǒu',
  '逃过一劫': 'táo guò yī jié', '交通规则': 'jiāo tōng guī zé',
  '斑马线': 'bān mǎ xiàn', '疏忽大意': 'shū hū dà yì',
  '后果不堪设想': 'hòu guǒ bù kān shè xiǎng', '过马路': 'guò mǎ lù',
  // a2 electrical safety
  '电器用品': 'diàn qì yòng pǐn', '火灾': 'huǒ zāi', '插座': 'chā zuò',
  '过载': 'guò zài', '短路': 'duǎn lù', '预防措施': 'yù fáng cuò shī',
  '个人隐私': 'gè rén yǐn sī', '网络安全': 'wǎng luò ān quán', '提高警惕': 'tí gāo jǐng tì',
  // a3 fire drill
  '演习': 'yǎn xí', '警铃': 'jǐng líng', '疏散': 'shū sàn',
  '操场': 'cāo chǎng', '消防员': 'xiāo fáng yuán', '灭火器': 'miè huǒ qì',
  '应对技能': 'yìng duì jì néng', '攀爬': 'pān pá', '跌倒': 'diē dǎo',
  '受伤': 'shòu shāng', '小心翼翼': 'xiǎo xīn yì yì',
  // a4 scam prevention
  '骗子': 'piàn zi', '假装': 'jiǎ zhuāng', '信任': 'xìn rèn',
  '钱财': 'qián cái', '可疑': 'kě yí', '透露': 'tòu lù',
  '防范意识': 'fáng fàn yì shí', '医务室': 'yī wù shì',
  // t1 smartphones
  '智能手机': 'zhì néng shǒu jī', '联系': 'lián xì', '查询': 'chá xún',
  '过度依赖': 'guò dù yī lài', '学习效率': 'xué xí xiào lǜ',
  '合理安排': 'hé lǐ ān pái', '绊脚石': 'bàn jiǎo shí',
  '互动': 'hù dòng', '生动有趣': 'shēng dòng yǒu qù', '多媒体': 'duō méi tǐ',
  '自主学习': 'zì zhǔ xué xí', '效率': 'xiào lǜ',
  // t2 online learning
  '网络学习': 'wǎng luò xué xí', '普及': 'pǔ jí', '灵活': 'líng huó',
  '自律能力': 'zì lǜ néng lì', '监督': 'jiān dū', '意志力': 'yì zhì lì',
  '优势': 'yōu shì', '耐心': 'nài xīn', '手忙脚乱': 'shǒu máng jiǎo luàn',
  '包容': 'bāo róng', '时代接轨': 'shí dài jiē guǐ',
  // t3 social media & privacy
  '网络欺凌': 'wǎng luò qī líng', '风雨无阻': 'fēng yǔ wú zǔ',
  '外卖': 'wài mài', '辛苦': 'xīn kǔ',
  // t4 AI
  '智能机器人': 'zhì néng jī qì rén', '诊断': 'zhěn duàn', '组装': 'zǔ zhuāng',
  '取代': 'qǔ dài', '提升': 'tí shēng', '共同进步': 'gòng tóng jìn bù',
  '日新月异': 'rì xīn yuè yì', '辅助工具': 'fǔ zhù gōng jù',
  '灵活应用': 'líng huó yìng yòng', '掌握': 'zhǎng wò',
};

const ENGLISH_MAP: Record<string, string> = {
  '清晨': 'early morning', '清新': 'fresh (air)', '乐龄人士': 'senior citizen',
  '修剪': 'to trim/prune', '敬佩': 'to admire/respect', '自动自觉': 'willingly and consciously',
  '整洁': 'neat and tidy', '彩旗飞扬': 'colourful flags flying', '欢声笑语': 'laughter and cheer',
  '代表': 'representative', '咬紧牙关': 'to grit one\'s teeth', '坚持': 'to persevere',
  '掌声': 'applause', '胜利': 'victory', '指导': 'to guide/coach',
  '壁画': 'mural', '分工合作': 'division of labour and cooperation', '构图': 'composition (art)',
  '调色': 'to mix colours', '团队': 'team', '体会': 'to appreciate/understand',
  '欢送会': 'farewell party', '依依不舍': 'reluctant to part', '教导': 'to teach and guide',
  '道理': 'reasoning/principle', '献花': 'to present flowers', '努力': 'to work hard',
  '建议': 'to suggest', '宜人': 'pleasant', '赞叹': 'to exclaim in admiration',
  '壮观': 'spectacular', '热情': 'warm/enthusiastic', '礼貌': 'politeness',
  '放松': 'to relax', '熟食中心': 'hawker centre', '自觉': 'consciously/voluntarily',
  '托盘': 'tray', '夸奖': 'to praise', '改善': 'to improve',
  '卫生': 'hygiene', '懂事': 'sensible/mature', '热闹': 'lively/bustling',
  '尽情': 'to one\'s heart\'s content', '齐心协力': 'to work together with one heart',
  '居民': 'resident', '责任': 'responsibility', '轻松': 'relaxed/carefree',
  '求知': 'to seek knowledge', '气氛': 'atmosphere', '遵守': 'to abide by',
  '规章制度': 'rules and regulations', '严重': 'serious/severe', '专注力': 'concentration',
  '修养': 'cultivation/etiquette', '组屋区': 'HDB housing estate', '沉重': 'heavy/weighty',
  '关怀': 'care and concern', '行为': 'behaviour', '美好': 'wonderful/beautiful',
  '和谐': 'harmonious', '期间': 'during/period', '义工': 'volunteer',
  '责任感': 'sense of responsibility', '整理': 'to tidy/organise', '充实': 'fulfilling',
  '助人为乐': 'finding joy in helping others', '经历': 'experience', '傍晚': 'evening/dusk',
  '锻炼': 'to exercise', '点滴': 'bits and pieces/small details', '亲切': 'warm/friendly',
  '感情': 'feelings/affection', '紧密': 'close/tight-knit', '团结': 'unity/solidarity',
  '工具': 'tool', '满头大汗': 'sweating profusely', '成就感': 'sense of achievement',
  '保护': 'to protect', '本分': 'one\'s duty', '共同努力': 'to work together',
  '挑战': 'challenge', '积极': 'positive/proactive', '塑料制品': 'plastic products',
  '养成': 'to cultivate (a habit)', '自然环境': 'natural environment', '影响': 'influence/impact',
  '源泉': 'source/spring', '珍惜': 'to cherish', '意识': 'awareness/consciousness',
  '充足': 'sufficient', '节约': 'to conserve/save', '供水': 'water supply',
  '后代': 'future generations', '干劲十足': 'full of energy and enthusiasm', '沙滩': 'beach/sandy shore',
  '废弃': 'discarded/abandoned', '受害': 'to be harmed', '爱护': 'to cherish and protect',
  '浪费': 'to waste', '忽视': 'to ignore', '剩余': 'surplus/leftover',
  '适量': 'appropriate amount', '贪心': 'greedy', '贡献': 'contribution',
  '排放': 'emission/discharge', '兴奋': 'excited', '景点': 'tourist attraction/scenic spot',
  '特色美食': 'local speciality food', '大开眼界': 'eye-opening experience', '情谊': 'friendship/bond',
  '共度': 'to spend time together', '良好': 'good/healthy', '习惯': 'habit',
  '奇妙': 'wonderful/marvellous', '独立思考': 'independent thinking', '宝藏': 'treasure',
  '精神世界': 'inner/spiritual world', '饮食': 'diet/eating habits', '摄入': 'intake',
  '吸引力': 'attraction/appeal', '损害': 'to damage/harm', '合理': 'reasonable/sensible',
  '精力': 'energy/vigour', '注重': 'to attach importance to', '必经之路': 'an inevitable path',
  '毅力': 'perseverance/willpower', '整洁有序': 'neat and orderly', '体贴': 'considerate',
  '感谢': 'gratitude', '安全': 'safety/safe', '危险': 'danger/dangerous',
  '注意': 'to pay attention', '保障': 'to safeguard', '谨慎': 'cautious/careful',
  '事故': 'accident', '预防': 'to prevent', '网络': 'internet/network',
  '陌生人': 'stranger', '自我保护': 'self-protection', '求助': 'to seek help',
  '紧急': 'urgent/emergency', '规则': 'rules', '遵守规则': 'to follow rules',
  '安全意识': 'safety awareness', '交通': 'traffic/transport', '闯红灯': 'to run a red light',
  '后果': 'consequence', '保护自己': 'to protect oneself', '骑车': 'to ride a bicycle',
  '科技': 'technology/science', '电子产品': 'electronic devices', '上网': 'to go online',
  '成瘾': 'addiction', '沉迷': 'to be obsessed with', '合理使用': 'to use reasonably',
  '自律': 'self-discipline', '人工智能': 'artificial intelligence', '方便': 'convenient',
  '依赖': 'to rely on/dependency', '节制': 'moderation/restraint', '社交媒体': 'social media',
  '隐私': 'privacy', '虚假信息': 'false information/misinformation', '辨别': 'to distinguish',
  '体谅': 'to be understanding of',
  // school — civic / canteen / classroom
  '推挤': 'to push and jostle', '收拾碗碟': 'to clear away dishes', '礼让': 'to give way politely',
  '意外': 'accident/unexpected', '见义勇为': 'to act bravely for a just cause',
  '友谊第一': 'friendship first', '扶起': 'to help up/to assist someone to stand',
  '感动': 'to be moved/touched', '不小心': 'careless/accidentally',
  '涂鸦': 'to scribble/graffiti', '收拾': 'to tidy up/clear away', '合作': 'to cooperate/teamwork',
  '互相体谅': 'to be mutually understanding', '感激': 'grateful/thankful',
  '卡片': 'card', '尊师重道': 'to respect and value teachers',
  '难舍难分': 'reluctant to part/inseparable', '礼物': 'gift/present',
  '大声喧哗': 'to make loud noise', '让位': 'to give up one\'s seat',
  '体谅他人': 'to be considerate of others', '碗碟': 'bowls and dishes',
  '保持卫生': 'to maintain hygiene/cleanliness', '肮脏': 'dirty/filthy',
  '小贩中心': 'hawker centre', '乱丢垃圾': 'to litter carelessly',
  '提醒': 'to remind', '爱护公物': 'to take care of public property',
  '垃圾桶': 'rubbish bin', '以身作则': 'to lead by example',
  '安静': 'quiet/silent', '自私': 'selfish', '干扰': 'to disturb/interfere',
  '专注': 'focused/concentrated', '道歉': 'to apologise',
  // community
  '远亲不如近邻': 'a close neighbour is better than a distant relative',
  '互相照顾': 'to look out for each other', '温馨': 'warm and cosy',
  '举手之劳': 'a small effort/no trouble at all', '人情味': 'human warmth/personal touch',
  '温暖': 'warmth/warm', '爱心': 'love and care/compassion',
  '分享美食': 'to share food', '各族同胞': 'fellow citizens of all races',
  '凝聚力': 'cohesion/unity', '庆祝': 'to celebrate',
  '甘榜精神': 'kampong spirit', '分享': 'to share',
  '收成': 'harvest', '邻里关系': 'neighbourly relations', '耕种': 'to farm/cultivate',
  // environment
  '再循环': 'recycling', '蓝色回收箱': 'blue recycling bin',
  '分类': 'to sort/classify', '环保意识': 'environmental awareness',
  '节约用水': 'to conserve water', '水龙头': 'tap/faucet',
  '捡垃圾': 'to pick up litter', '海洋生物': 'marine life/sea creatures',
  '污染': 'pollution', '保护环境': 'to protect the environment', '参与': 'to participate',
  '光盘行动': 'clean-plate campaign (finish your food)', '粒粒皆辛苦': 'every grain of rice comes from hard work',
  '珍惜食物': 'to cherish food/not waste food',
  // personal / family
  '亲子关系': 'parent-child relationship', '沟通': 'to communicate',
  '其乐融融': 'harmonious and joyful', '天伦之乐': 'family happiness',
  '美好回忆': 'wonderful memories',
  '博览群书': 'to read widely', '保护视力': 'to protect one\'s eyesight',
  '知识就是力量': 'knowledge is power',
  '均衡饮食': 'balanced diet', '营养': 'nutrition/nourishment',
  '强身健体': 'to strengthen the body', '病从口入': 'illness enters through the mouth',
  '自理能力': 'ability to take care of oneself', '分担家务': 'to share household chores',
  '感恩': 'gratitude/to be grateful', '独立': 'independent/independence',
  // safety
  '头盔': 'helmet', '刹车': 'brakes/to brake', '安全措施': 'safety measures',
  '负责任': 'responsible/to be responsible', '网络霸凌': 'cyberbullying',
  '安全上网': 'safe internet use', '违规': 'to break rules/violation',
  '制止': 'to stop/prevent',
  // tech
  '家庭关系': 'family relationships', '面对面交流': 'face-to-face communication',
  '健康使用': 'healthy use', '核实': 'to verify/fact-check', '误导': 'to mislead',
  '编程': 'coding/programming', '人机合作': 'human-machine collaboration',
  '未来技能': 'future skills', '适应': 'to adapt', '创新': 'innovation',
  '时间管理': 'time management', '自控': 'self-control',
  '游戏成瘾': 'gaming addiction', '学业': 'academic studies', '平衡': 'balance',
  // civic / transport per-question keywords
  '公德心': 'civic-mindedness/public morality', '有秩序': 'orderly',
  '依次': 'in turn/one after another', '耐心等候': 'to wait patiently',
  '不插队': 'not to queue-jump', '公共礼仪': 'public etiquette',
  '互相尊重': 'mutual respect', '自觉排队': 'to queue consciously/willingly',
  '文明行为': 'civilised behaviour', '体现': 'to reflect/embody',
  '素质': 'quality/character/moral standards', '低声交谈': 'to speak softly',
  '言行举止': 'words and actions/conduct', '有助于': 'helpful in/conducive to',
  '社会和谐': 'social harmony', '良好习惯': 'good habits',
  '尊重他人': 'to respect others', '主动让座': 'to proactively offer one\'s seat',
  '关爱': 'care and love', '力所能及': 'within one\'s ability/as best one can',
  '身体力行': 'to lead by example/practise what you preach',
  '从小培养': 'to cultivate from young', '奉献精神': 'spirit of contribution/dedication',
  // conjunction patterns
  '不仅……也……': 'not only … but also …', '一方面……另一方面……': 'on one hand … on the other hand …',
  '既……又……': 'both … and …',
  // family / tech t1 per-question keywords
  '团聚': 'family reunion', '长辈': 'elders/seniors (in family)',
  '晚辈': 'younger generation', '一家人': 'the whole family',
  '饭桌礼仪': 'dining table etiquette', '家庭凝聚力': 'family cohesion',
  '尊老爱幼': 'to respect the elderly and cherish the young',
  '传统价值观': 'traditional values', '代代相传': 'passed down from generation to generation',
  '家庭温暖': 'family warmth', '家庭教育': 'family upbringing/home education',
  '言传身教': 'to teach by word and example',
  '潜移默化': 'imperceptible influence/subtle guidance',
  '难忘': 'unforgettable', '印象深刻': 'deeply impressive/left a deep impression',
  '温馨时光': 'warm and cosy moments', '感情深厚': 'deep affection/strong bond',
  '回味无穷': 'to linger in the memory/endlessly savoured',
  '家人陪伴': 'family companionship', '心怀感恩': 'to hold gratitude in one\'s heart',
  '倍感温暖': 'to feel doubly warm/to feel especially warmly loved',
  // p3 weekend leisure
  '紧张': 'intense/stressful', '期待': 'to look forward to', '篮球场': 'basketball court',
  '家务': 'household chores', '有规律': 'regular/with a routine', '精神充沛': 'full of energy/refreshed',
  // p4 diary
  '感受': 'feelings/impression', '反省': 'to reflect/self-examine', '成熟': 'mature/grown-up',
  '珍贵': 'precious/valuable', '瞬间': 'moment/instant',
  // a1 road safety
  '交通灯': 'traffic light', '虚线': 'dotted/blinking signal line', '十字路口': 'crossroads/junction',
  '逃过一劫': 'to narrowly escape danger', '交通规则': 'traffic rules',
  '斑马线': 'zebra crossing/pedestrian crossing', '疏忽大意': 'careless/negligent',
  '后果不堪设想': 'the consequences would be unthinkable', '过马路': 'to cross the road',
  // a2 electrical safety
  '电器用品': 'electrical appliances', '火灾': 'fire/fire hazard', '插座': 'power socket/outlet',
  '过载': 'overload', '短路': 'short circuit', '预防措施': 'preventive measures',
  '个人隐私': 'personal privacy', '网络安全': 'internet/cyber safety', '提高警惕': 'to heighten vigilance/be alert',
  // a3 fire drill
  '演习': 'drill/exercise', '警铃': 'alarm bell', '疏散': 'to evacuate',
  '操场': 'school field/playground', '消防员': 'firefighter', '灭火器': 'fire extinguisher',
  '应对技能': 'response skills/coping skills', '攀爬': 'to climb', '跌倒': 'to fall down',
  '受伤': 'to be injured', '小心翼翼': 'very carefully/cautiously',
  // a4 scam prevention
  '骗子': 'scammer/cheat', '假装': 'to pretend/disguise', '信任': 'trust',
  '钱财': 'money/wealth', '可疑': 'suspicious', '透露': 'to reveal/disclose',
  '防范意识': 'vigilance/awareness of dangers', '医务室': 'sick bay/medical room',
  // t1 smartphones
  '智能手机': 'smartphone', '联系': 'to contact/keep in touch', '查询': 'to look up/enquire',
  '过度依赖': 'over-reliance/excessive dependence', '学习效率': 'learning efficiency/study productivity',
  '合理安排': 'to arrange reasonably/plan sensibly', '绊脚石': 'stumbling block/obstacle',
  '互动': 'interaction/interactive', '生动有趣': 'lively and interesting', '多媒体': 'multimedia',
  '自主学习': 'independent/self-directed learning', '效率': 'efficiency',
  // t2 online learning
  '网络学习': 'online learning', '普及': 'to become widespread/popularise', '灵活': 'flexible',
  '自律能力': 'ability to self-discipline', '监督': 'to supervise/monitor', '意志力': 'willpower',
  '优势': 'advantage/strength', '耐心': 'patience/patient',
  '手忙脚乱': 'flustered/in a panic',
  '包容': 'inclusive/tolerant', '时代接轨': 'to keep up with the times',
  // t3 social media & privacy
  '网络欺凌': 'cyberbullying', '风雨无阻': 'rain or shine/undeterred by any weather',
  '外卖': 'food delivery/takeaway', '辛苦': 'hard work/toil',
  // t4 AI
  '智能机器人': 'intelligent robot', '诊断': 'to diagnose/diagnosis', '组装': 'to assemble',
  '取代': 'to replace/take the place of', '提升': 'to improve/enhance', '共同进步': 'to progress together',
  '日新月异': 'changing rapidly/new every day', '辅助工具': 'auxiliary/assistive tool',
  '灵活应用': 'flexible application', '掌握': 'to master/grasp',
};

// ── Transform: VaultSet → OralSet ────────────────────────────────────────────

function makeVocab(words: string[]): OralVocabItem[] {
  return words.map((w) => ({
    chinese: w,
    pinyin: PINYIN_MAP[w] ?? '—',
    english: ENGLISH_MAP[w] ?? w,
  }));
}

const STARTERS = [
  { cn: '我在录像中看到……',  en: 'In the video, I saw…'          },  // Q1 observation
  { cn: '我认为……',          en: 'I think…'                       },  // Q2 opinion
  { cn: '记得有一次……',      en: 'I remember one time…'           },  // Q3 personal experience
] as const;

// Conjunction / discourse markers worth highlighting for students
const CONJUNCTION_PATTERNS = [
  '不仅……而且……', '不仅……也……', '虽然……但是……', '虽然……却……',
  '首先……其次……', '第一……第二……', '因此……', '由此可见……',
  '相反……', '然而……', '例如……', '比如……', '于是……',
];

function extractConjunctions(peel?: PeelAnswer): string[] {
  if (!peel) return [];
  const allText = [peel.point, peel.elaboration, peel.example, peel.link].join('');
  return CONJUNCTION_PATTERNS.filter(p => {
    const core = p.replace(/……/g, '');
    return allText.includes(core);
  });
}

/**
 * Extract meaningful vocab terms that actually appear in this question's
 * PEEL answer text by scanning against the ENGLISH_MAP dictionary.
 * Sort by length descending so multi-char phrases are preferred over
 * single-char substrings.  Cap at MAX_VOCAB per question.
 */
function extractPeelVocab(peel: PeelAnswer | undefined, max = 6): string[] {
  if (!peel) return [];
  const allText = [peel.point, peel.elaboration, peel.example, peel.link]
    .filter(Boolean).join('');
  // Collect all known dictionary terms that appear in the text
  const found: string[] = [];
  // Sort keys longest-first so '不顾他人' beats '他人'
  const dictKeys = Object.keys(ENGLISH_MAP).sort((a, b) => b.length - a.length);
  for (const term of dictKeys) {
    if (term.length < 2) continue;          // skip single chars
    if (!allText.includes(term)) continue;
    // Avoid adding a term that is a substring of one already collected
    if (found.some(f => f.includes(term))) continue;
    found.push(term);
    if (found.length >= max) break;
  }
  return found;
}

function makeQuestion(vq: VaultQuestion, _keywords: string[], questionIndex: 0 | 1 | 2): OralQuestion {
  // Chips = vocab terms found IN this question's PEEL text + conjunctions used
  const vocabChips   = extractPeelVocab(vq.peelAnswer, 5);
  const conjunctions = extractConjunctions(vq.peelAnswer);
  // Deduplicate; show vocab first, then conjunction patterns (max 3)
  const merged = [...new Set([...vocabChips, ...conjunctions.slice(0, 3)])];
  return {
    questionChinese:    vq.cn,
    questionEnglish:    vq.en,
    starterChinese:     STARTERS[questionIndex].cn,
    starterEnglish:     STARTERS[questionIndex].en,
    modelAnswerChinese: '',
    modelAnswerEnglish: '',
    keyPhrases:         merged,
    peelAnswer:         vq.peelAnswer,
  };
}

function makePassage(text: string): OralPassage {
  // Split at Chinese sentence endings while keeping delimiter
  const parts = text.match(/[^。！？]+[。！？]/g) ?? [text];
  // Group into ~2-sentence paragraphs
  const paras: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    paras.push(parts.slice(i, i + 2).join(''));
  }
  const count = text.replace(/[^\u4e00-\u9fff]/g, '').length;
  const diff: OralPassage['difficulty'] =
    count < 90 ? '基础' : count < 130 ? '中级' : '高级';
  return { paragraphs: paras, difficulty: diff, characterCount: count };
}

function makeFrame(idx: number, desc: string): OralVideoFrame {
  const labels = ['第一幅', '第二幅', '第三幅', '第四幅'];
  return {
    descriptionChinese: `${labels[idx]}：${desc}`,
    descriptionEnglish: desc,
    captionChinese: desc,
    captionEnglish: desc,
  };
}

function themeFor(id: ThemeId): OralTheme {
  return ORAL_THEMES.find(t => t.id === id)!;
}

let _setNumber = 0;

function transform(v: VaultSet): OralSet {
  _setNumber += 1;
  const theme = themeFor(v.themeId);
  const kw = v.conversation.targetKeywords;
  const desc = v.conversation.storyboardDesc;

  // Generate 4 picture frames from storyboard description sentences
  const sentences = desc.match(/[^.!?]+[.!?]?/g) ?? [desc];
  const frameTexts = [
    sentences[0]?.trim() ?? desc,
    sentences[1]?.trim() ?? desc,
    sentences[2]?.trim() ?? sentences[0]?.trim() ?? desc,
    sentences[3]?.trim() ?? sentences[1]?.trim() ?? desc,
  ];

  return {
    id: v.id,
    setNumber: _setNumber,
    themeId: v.themeId,
    themeChinese: theme.titleChinese,
    themeEnglish: theme.titleEnglish,
    subThemeCn: v.subThemeCn,
    subThemeEn: v.subThemeEn,
    focusSkill: v.focusSkill,
    moralChinese: theme.moralChinese,
    accentColour: theme.accentColour,
    levels: ['P3', 'P4', 'P5', 'P6'],
    psleYears: [v.yearLabel],
    // Vocab tab: reading target words  +  every term from all three PEEL answers
    // that exists in ENGLISH_MAP (so every card has a pinyin + translation).
    vocab: makeVocab([
      ...new Set([
        ...v.reading.targetWords,
        ...extractPeelVocab(v.conversation.questions.q1.peelAnswer, 10),
        ...extractPeelVocab(v.conversation.questions.q2.peelAnswer, 10),
        ...extractPeelVocab(v.conversation.questions.q3.peelAnswer, 10),
      ])
    ]),
    questions: {
      q1: makeQuestion(v.conversation.questions.q1, kw,           0),
      q2: makeQuestion(v.conversation.questions.q2, kw.slice(1),  1),
      q3: makeQuestion(v.conversation.questions.q3, kw.slice(2),  2),
      q3TipByLevel: {
        advanced: '用"不仅……而且……"连接两个观点，展示高层次的表达能力。',
        standard: '说出两个理由，用"第一……第二……"来组织你的回答。',
      },
    },
    audioUrl:             `/audio/oral/${v.id}.mp3`,
    scenarioAudioUrl:     undefined,
    scenarioDescriptionEn: v.conversation.scenarioDescriptionEn,
    guidingPointers:      v.conversation.guidingPointers,
    newsAnchor:       v.conversation.newsAnchor,
    moralReflection:  v.conversation.moralReflection,
    passage: makePassage(v.reading.text),
    pictureStory: {
      titleChinese:        theme.titleChinese,
      titleEnglish:        theme.titleEnglish,
      introChinese:        `${v.yearLabel}年口试主题：${theme.titleChinese}`,
      introEnglish:        `${v.yearLabel} Oral Theme: ${theme.titleEnglish}`,
      narratorChinese:     v.reading.text.slice(0, 40) + '……',
      narratorEnglish:     v.conversation.storyboardDesc,
      scenarioDescription:   v.conversation.scenarioDescription   ?? v.conversation.storyboardDesc,
      scenarioDescriptionEn: v.conversation.scenarioDescriptionEn ?? v.conversation.storyboardDesc,
      frames: [
        makeFrame(0, frameTexts[0]),
        makeFrame(1, frameTexts[1]),
        makeFrame(2, frameTexts[2]),
        makeFrame(3, frameTexts[3]),
      ],
    },
  };
}

// ── Raw vault data (28 sets from PSLE archive 2002–2025) ─────────────────────

const RAW_VAULT: VaultSet[] = [
  // ── School (s1–s4) ──────────────────────────────────────────
  {
    id: 's1', yearLabel: '2002', themeId: 'school',
    subThemeCn: '食堂礼仪', subThemeEn: 'Canteen Etiquette', focusSkill: 'Phonetic',
    reading: {
      text: '今天清晨，我到组屋楼下的公园跑步。天气晴朗，空气十分清新。我看见一位乐龄人士正细心地修剪花草，还不忘把地上的枯叶捡起来放进垃圾桶。这种自动自觉保持环境整洁的行为，真的很令我敬佩。如果每个居民都能像他这样爱护公共场所，我们的社区一定会变得更加美好和和谐。',
      targetWords: ['清晨', '清新', '乐龄人士', '修剪', '敬佩', '自动自觉', '整洁'],
    },
    conversation: {
      storyboardDesc: 'Students queuing in the canteen. One student pushes others. Another helps a vendor clear trays.',
      scenarioDescription:   '录像里，几名小学生正在食堂排队购买午餐。其中一名同学不顾他人，用力推挤插队；而另一名同学却主动帮忙把散乱的碗碟收拾整齐，交给档口的阿姨。',
      scenarioDescriptionEn: 'In the video, several primary school students are queuing to buy lunch in the canteen. One student ignores others and pushes in aggressively, while another student proactively tidies up scattered bowls and plates, handing them back to the stall auntie.',
      questions: {
        q1: {
          cn: '请谈谈你在录像中看到的同学们在食堂里的不同行为。',
          en: 'Describe the different behaviours of students in the canteen as seen in the video.',
          peelAnswer: {
            point:         '录像中的同学们在食堂里表现出截然不同的行为。',
            pointEn:       'The students in the video displayed very different behaviours in the canteen.',
            elaboration:   '有些同学礼貌地排队等候，耐心地等待轮到自己；然而，有一名同学却不顾他人，推挤插队，还有同学吃完饭后主动帮忙收拾碗碟，协助阿姨保持食堂整洁。',
            elaborationEn: 'Some students queued politely and waited patiently for their turn; however, one student ignored others and pushed into the queue. Meanwhile, another student proactively helped tidy up the bowls and plates to keep the canteen clean.',
            example:       '比如，录像里一名同学在同伴推挤时，仍然冷静地站在队伍里，没有以牙还牙；而另一名同学则主动把散落的碗碟叠好，递给档口的阿姨。',
            exampleEn:     'For instance, one student in the video remained calm and stayed in line even when being pushed, refusing to retaliate; while another student proactively stacked the scattered bowls and handed them to the stall auntie.',
            link:          '这些行为让我明白，食堂礼仪不只是个人修养的体现，更关系到大家共同用餐的环境，我们每个人都有责任维护一个和谐、整洁的公共空间。',
            linkEn:        'These behaviours reminded me that canteen etiquette is not just about personal character — it also affects the dining environment we all share. Each of us has a responsibility to maintain a harmonious and clean public space.',
          },
        },
        q2: {
          cn: '在食堂排队时，你认为最重要的礼仪是什么？',
          en: 'What do you think is the most important etiquette when queuing in the canteen?',
          peelAnswer: {
            point:         '我认为在食堂排队时，最重要的礼仪是自动自觉地排队，不推挤、不插队。',
            pointEn:       'I think the most important etiquette when queuing in the canteen is to queue willingly and consciously, without pushing or cutting in.',
            elaboration:   '食堂在午餐时段往往人潮汹涌，如果每个人都能自律地依次排队，不仅能保持秩序，也能让档口阿姨更快地服务每一位同学，减少大家等待的时间。相反，若有人插队，就会引起混乱，甚至让其他同学感到愤怒或委屈。',
            elaborationEn: 'The canteen is often very crowded during lunchtime. If everyone queues in an orderly and self-disciplined manner, it not only maintains order but also allows the stall auntie to serve each student more quickly, reducing waiting time for everyone. On the contrary, queue-cutting causes chaos and may even make other students feel angry or upset.',
            example:       '有一次，我亲眼看见一名高年级的同学径直走到队伍前头，后面的同学都投以不满的眼神。那时我便明白，守秩序是对他人时间和感受的基本尊重。',
            exampleEn:     "Once, I witnessed a senior student walk straight to the front of the queue, and the students behind all gave him looks of displeasure. That moment made me realise that keeping order is a basic form of respect for others' time and feelings.",
            link:          '因此，自动自觉地遵守排队秩序，不仅体现了个人的公德心，也能营造一个让大家都感到舒适的用餐环境，值得我们每个人用行动去维护。',
            linkEn:        "Therefore, queuing in a self-disciplined manner not only reflects one's civic-mindedness but also creates a comfortable dining environment for everyone — something each of us should uphold through our actions.",
          },
        },
        q3: {
          cn: '学校应该如何鼓励学生保持食堂的整洁？',
          en: 'How should the school encourage students to keep the canteen clean?',
          peelAnswer: {
            point:         '我认为学校可以从教育和奖励两个方面入手，鼓励学生共同保持食堂的整洁。',
            pointEn:       'I believe the school can encourage students to keep the canteen clean through both education and rewards.',
            elaboration:   '首先，学校可以在食堂张贴生动的海报，提醒同学们用餐后要收拾碗碟、把剩余食物丢进垃圾桶，帮助大家养成良好习惯。其次，学校也可以设立"整洁达人"奖励制度，每月表扬在食堂表现突出的班级，用正面激励来强化学生的自律意识。',
            elaborationEn:   "Firstly, the school could display eye-catching posters in the canteen reminding students to clear their trays and dispose of leftover food after meals, helping everyone build good habits. Secondly, the school could set up a \"Cleanliness Champion\" reward system, praising the class with the best canteen behaviour each month, using positive reinforcement to strengthen students' sense of self-discipline.",
            example:       '例如，我们学校曾经举办过"光盘达人"活动，鼓励同学们把碗里的饭菜吃完，并在宣传栏上展示做得好的班级。那段期间，食堂的卫生情况明显改善，同学们也更加自觉了。',
            exampleEn:       "For example, our school once held a \"Clean Plate Champion\" campaign, encouraging students to finish all the food in their bowls, and displaying the best-performing classes on the notice board. During that period, the canteen's hygiene improved noticeably and students became much more conscientious.",
            link:          '由此可见，通过教育与激励相结合的方式，学校能有效地培养学生的公德心，让每个人都成为维护食堂整洁的小主人，共同创造一个舒适的用餐环境。',
            linkEn:        "This shows that by combining education with incentives, the school can effectively cultivate students' civic values, turning everyone into a responsible steward of the canteen and creating a comfortable dining environment together.",
          },
        },
      },
      targetKeywords: ['推挤', '自动自觉', '收拾碗碟', '礼让', '公德心'],
    },
  },
  {
    id: 's2', yearLabel: '2013', themeId: 'school',
    subThemeCn: '运动精神', subThemeEn: 'Sportsmanship', focusSkill: 'Narrative',
    reading: {
      text: '学校的运动场上彩旗飞扬，到处欢声笑语。一年一度的运动会开始了，同学们都在为自己班级的代表加油打气。看，那名运动员虽然不小心跌倒了，但他还是咬紧牙关，坚持跑到了终点。这种永不放弃的精神，赢得了全场热烈的掌声。我也从中明白了，只要坚持到底，就是真正的胜利。',
      targetWords: ['彩旗飞扬', '欢声笑语', '代表', '咬紧牙关', '坚持', '掌声', '胜利'],
    },
    conversation: {
      storyboardDesc: 'Sports Day at school. A student is running a race but falls down. His classmate stops to help him up.',
      questions: {
        q1: {
          cn: '描述比赛中发生的意外以及同学的反应。',
          en: "Describe the accident during the race and the classmate's reaction.",
          peelAnswer: {
            point:         '录像中，一场紧张的运动会赛跑比赛正在进行，其中一名参赛选手突然跌倒，情况十分紧急。',
            pointEn:       'In the video, an intense Sports Day race was underway when one of the competing students suddenly fell, creating a very urgent situation.',
            elaboration:   '那名同学跌倒后，脚踝明显受伤，难以站起来。就在旁人都呆站着的时候，他的队友却毫不犹豫地停下脚步，跑回去将他扶起，还亲切地询问他有没有受伤。这种见义勇为、友谊第一的精神，赢得了全场观众热烈的掌声。',
            elaborationEn:  "After falling, the student's ankle appeared to be hurt and he struggled to stand up. While others stood frozen, his teammate did not hesitate — he stopped, ran back, and helped him to his feet, asking warmly if he was injured. This spirit of acting bravely and putting friendship first earned thunderous applause from the entire crowd.",
            example:       '例如，录像中那名扶起同学的同学，明明自己也在争夺名次，却放弃了获奖的机会，只为确保受伤的队友得到帮助。这一幕让在场所有人都深受感动，也让我们明白，真正的体育精神不只是争第一，更是懂得照顾身边的人。',
            exampleEn:     'For example, the student who helped his fallen classmate in the video was himself competing for a placing, yet he gave up his chance of winning just to make sure his injured teammate was all right. This scene deeply moved everyone present, reminding us that true sportsmanship is not just about coming first, but about caring for those around us.',
            link:          '由此可见，在比赛中互相帮助、友谊第一，才是新加坡学生应该具备的体育精神。运动会不仅是一场竞技，更是培养同学情谊和团队精神的宝贵机会。',
            linkEn:        'This shows us that helping each other and putting friendship first in competition is the true sportsmanship Singapore students should embody. Sports Day is not merely a contest — it is a precious opportunity to nurture friendship and team spirit.',
          },
        },
        q2: {
          cn: '你曾有过在困难中得到同学帮助的经历吗？',
          en: 'Have you ever had an experience where a classmate helped you during a difficulty?',
          peelAnswer: {
            point:         '我认为在困难时刻得到同学的帮助，是非常令人感动、也让人难以忘怀的经历。',
            pointEn:       'I believe that receiving help from a classmate during a difficult moment is a very touching and unforgettable experience.',
            elaboration:   '在学校生活中，我们难免会遇到各种挑战，比如功课难以理解、体育活动受伤，或是心情低落时。这时，如果有同学主动伸出援手，不仅能帮助我们度过难关，更能让我们深刻体会到同学之间的情谊是多么珍贵。',
            elaborationEn: 'In school life, we inevitably face all sorts of challenges — such as struggling with schoolwork, getting injured during physical activities, or feeling down. At those times, if a classmate proactively reaches out to help, it not only gets us through the difficulty but also makes us deeply appreciate how precious the bond between classmates truly is.',
            example:       '记得有一次，我在体育课上不小心扭伤了脚踝，痛得无法走路。就在我不知所措时，班上的好朋友陈明主动扶着我，一步一步地把我送到医务室，还陪我等到老师赶到。那一刻，我心里非常感激，深刻体会到朋友在身边的重要性。',
            exampleEn:     'I remember once during PE class I accidentally twisted my ankle and could not walk from the pain. Just as I was at a loss, my good friend Chen Ming proactively supported me and walked me step by step to the sick bay, staying with me until the teacher arrived. In that moment, I felt extremely grateful and deeply appreciated how important it is to have a friend by your side.',
            link:          '这次经历让我明白，真正的友情体现在患难与共、互相扶持。正是这些小小的善举，让我们的班级更像一个温暖的大家庭，也让我更珍惜身边每一位同学。',
            linkEn:        'This experience taught me that true friendship is shown in standing by each other through difficulties. It is precisely these small acts of kindness that make our class feel like a warm family, and it made me cherish every classmate around me even more.',
          },
        },
        q3: {
          cn: '你认为互相帮助和比赛成绩哪个更重要？为什么？',
          en: 'Do you think helping each other or competition results are more important? Why?',
          peelAnswer: {
            point:         '我认为互相帮助比比赛成绩更加重要，因为友谊和品格才是学校运动会真正想要培养的核心价值观。',
            pointEn:       'I believe that helping each other is far more important than competition results, because friendship and character are the true core values that Sports Day aims to cultivate.',
            elaboration:   '比赛成绩固然重要，能激励我们努力训练、不断突破自己，但成绩只是一时的，而在竞技中建立的情谊和学到的品德却能影响一生。如果我们只顾追求名次而对身边有困难的同学视而不见，那么即使夺得金牌，也失去了运动竞技的真正意义。',
            elaborationEn: 'Competition results are certainly important — they motivate us to train hard and continually push our limits — but results are temporary, while the friendships built and character developed through competition can influence us for life. If we focus solely on rankings and ignore classmates who are in difficulty around us, then even winning a gold medal loses its true meaning.',
            example:       '例如，在新加坡的小学运动会上，每当有选手因意外受伤而放弃比赛时，观众和对手都会给予热烈的掌声和鼓励。这说明，公众更看重的是运动员展现出的精神，而非最终的名次。',
            exampleEn:     'For example, at primary school Sports Days in Singapore, whenever a competitor withdraws due to an unexpected injury, the crowd and opponents always respond with warm applause and encouragement. This shows that what the public values most is the spirit the athletes demonstrate, not the final ranking.',
            link:          '因此，我认为学校在举办运动会时，应该不仅仅强调成绩，更要让同学们学会在竞争中保持良好的体育精神——既能全力以赴争取名次，也能在队友需要时毫不犹豫地伸出援手。这种平衡，才是真正有意义的成长。',
            linkEn:        'Therefore, I believe that when schools organise Sports Days, they should emphasise not only results, but also teach students to maintain good sportsmanship in competition — to strive with full effort for their placing, while at the same time never hesitating to help a teammate in need. This balance is what makes for truly meaningful growth.',
          },
        },
      },
      targetKeywords: ['意外', '见义勇为', '友谊第一', '扶起', '感动'],
    },
  },
  {
    id: 's3', yearLabel: '2016', themeId: 'school',
    subThemeCn: '美术团队', subThemeEn: 'Art & Teamwork', focusSkill: 'Vocab',
    reading: {
      text: '放学后，美术室里静悄悄的。林老师正耐心地指导几名学生完成他们的壁画作品。同学们分工合作，有的在调色，有的在构图，配合得非常好。看着色彩多样的墙壁，大家脸上都露出了满意的笑容。通过这次活动，我们不仅学到了绘画技巧，还深刻体会到了团队合作的重要力量。',
      targetWords: ['指导', '壁画', '分工合作', '构图', '调色', '团队', '体会'],
    },
    conversation: {
      storyboardDesc: 'Students working in an art room. One student spills paint on the table. Another helps him clean it up before the teacher sees.',
      questions: {
        q1: {
          cn: '录像中在美术室里的学生发生了什么事？',
          en: 'What happened among the students in the art room in the video?',
          peelAnswer: {
            point:         '录像中，美术室里发生了一个小意外，但同学之间互相体谅、合作的精神，让这件事有了温馨的结局。',
            pointEn:       'In the video, a small accident occurred in the art room, but the spirit of mutual understanding and cooperation between classmates gave the incident a warm and heartening outcome.',
            elaboration:   '一名同学在调色时，不小心把颜料撒在了桌上，顿时神情慌张。眼看老师即将走进来检查，旁边的同学立刻放下手中的工作，迅速帮他一起把颜料抹净、整理好桌面。两人分工合作，动作又快又好，没有让老师发现任何异样。',
            elaborationEn: 'One student accidentally spilled paint on the table while mixing colours and immediately looked flustered. Seeing the teacher about to walk in for inspection, the classmate beside him promptly set down his own work and quickly helped wipe up the paint and tidy the table. The two worked together with division of labour — efficiently and effectively — without the teacher noticing anything amiss.',
            example:       '例如，录像中那名帮忙的同学，虽然自己的作品还没完成，但见到同学遇到麻烦，毫不犹豫地出手相助。他的行为不仅解决了同学的燃眉之急，也展现了美术团队之间互相体谅、共同负责的精神。',
            exampleEn:      "For example, the student who helped in the video had not yet finished his own artwork, but seeing his classmate in trouble, he helped without any hesitation. His action not only resolved his classmate's urgent problem but also demonstrated the spirit of mutual consideration and shared responsibility within the art team.",
            link:          '这个小小的意外提醒我们，在团队活动中，互相帮助和理解是非常重要的。无论是在美术课还是其他场合，当同学遇到困难时，主动伸出援手，才能让整个团队更加团结和进步。',
            linkEn:        'This small accident reminds us that mutual help and understanding are very important in team activities. Whether in art class or any other setting, proactively reaching out to help when a classmate faces difficulty is what makes the entire team more united and enables everyone to grow.',
          },
        },
        q2: {
          cn: '在小组讨论或活动中，你会如何与同学沟通？',
          en: 'How do you communicate with classmates during group discussions or activities?',
          peelAnswer: {
            point:         '我认为，在小组讨论或活动中，良好的沟通需要做到倾听、尊重和主动表达，三者缺一不可。',
            pointEn:       'I believe that good communication in group discussions or activities requires three essential elements: listening, respect, and proactive expression — none of which can be missing.',
            elaboration:   '首先，我会认真倾听每一位组员的意见，不随意打断或否定他人的想法，因为每个人的观点都有其价值。其次，当我有不同意见时，我会用温和、礼貌的方式表达，比如先肯定对方的想法，再提出我的建议。此外，我也会主动承担自己的那份工作，不让其他组员感到压力。',
            elaborationEn:  "Firstly, I would listen carefully to every group member's opinion, without interrupting or dismissing anyone's ideas, because every perspective has its value. Secondly, when I have a different view, I would express it in a gentle and polite way — for example, by first acknowledging the other person's idea before offering my own suggestion. In addition, I would also proactively take on my share of the work, so as not to place extra pressure on the rest of the group.",
            example:       '记得有一次，班上进行华文小组讨论，组员对于故事的结局有很大分歧。我先请大家轮流说出自己的想法，然后把各个观点写在纸上，让大家一起比较，最后用投票的方式决定。这样的方式不仅避免了争吵，也让每个人都感到自己的意见被重视。',
            exampleEn:     'I recall during a Chinese group discussion in class, our group members had very different views about the ending of a story. I first invited everyone to take turns sharing their thoughts, then wrote each idea down on paper so the group could compare them, and finally used a vote to decide. This approach not only avoided arguments but also made everyone feel that their opinions were valued.',
            link:          '因此，我认为在小组活动中保持良好的沟通，不仅能让任务顺利完成，更能培养我们尊重他人、体谅他人的品格，这些都是我们在日后成长中非常宝贵的素质。',
            linkEn:        'Therefore, I believe that maintaining good communication in group activities not only helps tasks to be completed smoothly, but also cultivates our character of respecting and being considerate of others — qualities that are extremely valuable as we grow up.',
          },
        },
        q3: {
          cn: '你认为在学校里培养团队精神对未来有什么帮助？',
          en: 'How do you think fostering teamwork at school helps in the future?',
          peelAnswer: {
            point:         '我认为在学校里培养团队精神，对我们未来的学习、工作和生活都有着深远而重要的影响。',
            pointEn:       'I believe that fostering a spirit of teamwork at school has a far-reaching and important influence on our future learning, work, and life.',
            elaboration:   '在现实社会中，无论是在公司工作还是参与社区活动，几乎所有的事情都需要与他人合作才能完成。从小在学校里学会分工合作、互相体谅和共同承担责任，能让我们在长大后更容易融入团队，解决复杂的问题。此外，团队合作也能培养我们的领导力和沟通能力，这些都是职场上非常看重的能力。',
            elaborationEn: 'In the real world, whether working in a company or participating in community activities, almost everything requires cooperation with others to be accomplished. Learning from a young age in school how to divide tasks, be considerate of one another, and share responsibility will make it much easier for us to integrate into teams and solve complex problems when we grow up. Moreover, teamwork also cultivates leadership and communication skills — qualities that are highly valued in the workplace.',
            example:       '例如，在新加坡，许多大公司在招聘时都非常看重应聘者的团队合作能力。如果我们从小在学校里就通过各种小组项目和活动学会了与人合作，那么长大后进入职场，我们便能更快地适应环境，发挥自己的才能。',
            exampleEn:     'For example, in Singapore, many large companies place great importance on teamwork ability when recruiting. If we learn from young through various group projects and activities at school how to cooperate with others, then when we enter the working world as adults, we will be able to adapt to the environment more quickly and make the most of our talents.',
            link:          '因此，我认为学校通过团队活动培养同学们合作精神，不仅是为了完成眼前的任务，更是在为我们日后成为优秀的社会栋梁打下坚实的基础。这种从小培养的团队精神，将会是我们一生中最宝贵的财富之一。',
            linkEn:        'Therefore, I believe that schools fostering a spirit of cooperation through team activities is not merely about completing immediate tasks — it is also laying a solid foundation for us to become outstanding contributors to society in future. This team spirit cultivated from young will be one of the most precious assets of our lives.',
          },
        },
      },
      targetKeywords: ['不小心', '涂鸦', '收拾', '合作', '互相体谅'],
    },
  },
  {
    id: 's4', yearLabel: '2009', themeId: 'school',
    subThemeCn: '感恩老师', subThemeEn: 'Teacher Appreciation', focusSkill: 'Opinion',
    reading: {
      text: '今天是学校为陈老师举办的欢送会。礼堂里坐满了学生，大家都依依不舍地看着台上。陈老师教了我们六年，不仅教导我们各科知识，还告诉我们做人的道理。当几位代表上台献花时，全场响起了热烈的掌声，久久不停。我默默在心里许愿，一定要努力学习，不让陈老师失望。',
      targetWords: ['欢送会', '依依不舍', '教导', '道理', '献花', '掌声', '努力'],
    },
    conversation: {
      storyboardDesc: 'A farewell party for a teacher. Students are performing and giving handmade cards to the teacher.',
      questions: {
        q1: {
          cn: '描述欢送会上同学们表达感激之情的方式。',
          en: 'Describe how the students expressed their gratitude at the farewell party in the video.',
          peelAnswer: {
            point:         '录像中，同学们通过多种真挚的方式，向即将离开的老师表达了深深的感激和不舍之情。',
            pointEn:       'In the video, the students expressed their deep gratitude and reluctance to part with their departing teacher through several heartfelt gestures.',
            elaboration:   '首先，同学们精心准备了文艺表演，包括歌唱和舞蹈节目，以此回报老师多年的辛勤栽培。此外，他们还亲手制作了充满心意的感谢卡片，写下对老师的祝福和感谢。当代表们捧着鲜花上台献给老师时，礼堂里响起了经久不息的掌声，充分展现了同学们对老师的尊师重道之心。',
            elaborationEn:  "Firstly, the students carefully prepared cultural performances including songs and dances to repay their teacher's years of dedicated nurturing. In addition, they also hand-made heartfelt thank-you cards, inscribed with wishes and expressions of gratitude for the teacher. When the representatives went up on stage to present flowers, the hall echoed with sustained applause, fully reflecting the students' spirit of honouring and respecting their teacher.",
            example:       '例如，录像中一名同学在台上深情地朗读了一封亲笔信，信里提到了老师每次耐心为他讲解难题的情景，还有老师在他沮丧时给予鼓励的话语。这封信让老师感动得热泪盈眶，也让台下的同学们深深体会到，老师的付出是多么伟大。',
            exampleEn:      "For example, one student in the video read out a handwritten letter on stage with great emotion. The letter described scenes of the teacher patiently explaining difficult problems, as well as the encouraging words the teacher offered when the student felt discouraged. This letter moved the teacher to tears of emotion, and also made the students in the audience deeply appreciate just how tremendous their teacher's dedication had been.",
            link:          '这场欢送会让我感受到，感恩老师不应只停留在心里，更应该通过具体的行动来表达。无论是一张卡片、一束鲜花还是一首歌，都能让老师感受到我们的真诚与感激，这正是尊师重道精神的最好体现。',
            linkEn:        'This farewell party made me feel that gratitude towards our teachers should not remain just in our hearts — it should be expressed through concrete actions. Whether it is a card, a bouquet of flowers, or a song, these gestures allow teachers to feel our sincerity and appreciation, and this is the finest expression of the spirit of honouring and respecting our teachers.',
          },
        },
        q2: {
          cn: '分享一个你最喜欢的老师的故事。',
          en: 'Share a story about your favourite teacher.',
          peelAnswer: {
            point:         '在我的学习生涯中，有一位老师让我印象非常深刻，那就是我小学四年级的华文老师——林老师。',
            pointEn:       'In my years of learning, one teacher left a very deep impression on me — my Primary 4 Chinese teacher, Mdm Lin.',
            elaboration:   '林老师不只是一位传授知识的老师，更是一位真正关心学生成长的引导者。她上课时生动有趣，总能把复杂的语文知识讲得浅显易懂，让我们在欢笑中学习；课后，她也经常牺牲休息时间，为有困难的同学一对一辅导，从不抱怨。',
            elaborationEn:  "Mdm Lin was not merely a teacher who imparted knowledge — she was a true mentor who genuinely cared about her students' growth. Her lessons were lively and engaging, and she could always explain complex language concepts in a clear and accessible way, allowing us to learn amid laughter. After class, she also frequently gave up her rest time to provide one-on-one coaching for students with difficulties, never once complaining.",
            example:       '记得有一次，我在华文作文方面遇到了很大的困难，成绩一直没有起色。林老师发现后，主动找我谈话，不仅帮我分析了问题所在，还根据我的兴趣为我推荐了一些课外读物，鼓励我多阅读来提升语感。在她耐心的指导下，我的华文成绩慢慢进步了，也对华文产生了浓厚的兴趣。',
            exampleEn:     'I remember once I was experiencing great difficulty with Chinese composition and my results had not been improving. After noticing this, Mdm Lin proactively approached me for a chat — she not only helped me identify where the problems were, but also recommended some supplementary reading based on my interests, encouraging me to read more to develop my feel for the language. Under her patient guidance, my Chinese results gradually improved, and I also developed a deep interest in the subject.',
            link:          '林老师对学生无私的关爱让我明白，一位好老师不只是教会我们书本上的知识，更是在默默地塑造我们的品格和人生观。我会永远记得她的教诲，并在将来有机会时，也把这份关爱传递给身边的人。',
            linkEn:         "Mdm Lin's selfless care for her students made me understand that a great teacher does not merely teach us knowledge from textbooks — she is also quietly shaping our character and outlook on life. I will always remember her teachings, and when I have the opportunity in future, I hope to pass on this spirit of care to those around me.",
          },
        },
        q3: {
          cn: '你认为学生应该如何表现出对老师的尊重？',
          en: 'How do you think students should show respect to their teachers?',
          peelAnswer: {
            point:         '我认为学生对老师的尊重，应该体现在日常生活的每一个细节中，而不只是在特别的场合才表现出来。',
            pointEn:        "I believe that students' respect for their teachers should be reflected in every detail of daily life, not only on special occasions.",
            elaboration:   '首先，在课堂上，我们应该专心聆听老师的讲解，不做与课堂无关的事情，因为这是对老师劳动成果最基本的尊重。其次，在与老师交流时，我们应该使用礼貌的语言，虚心接受老师的批评和建议，而不是辩解或顶撞。此外，完成老师布置的作业，认真对待每一份功课，也是表达尊重的重要方式。',
            elaborationEn:  "Firstly, in the classroom, we should listen attentively to the teacher's explanations and not do anything unrelated to the lesson — as this is the most basic form of respect for the teacher's efforts. Secondly, when communicating with teachers, we should use polite language and humbly accept criticism and advice, rather than making excuses or talking back. In addition, completing the homework assigned by the teacher and taking every piece of work seriously is also an important way of showing respect.",
            example:       '例如，在新加坡，我们有一年一度的教师节。许多学生会亲手制作卡片，写下对老师的感谢与祝福；也有同学会在教师节当天帮老师拿东西或主动协助布置教室。这些看似微小的举动，却是表达对老师尊重和感激之情最真实的方式。',
            exampleEn:      "For example, in Singapore, we have an annual Teachers' Day. Many students hand-make cards inscribed with thanks and blessings for their teachers; some students also help teachers carry things or proactively assist with setting up the classroom on Teachers' Day. These seemingly small gestures are in fact the most genuine ways to express respect and gratitude towards teachers.",
            link:          '总而言之，尊师重道不仅是华人的传统美德，也是新加坡社会所推崇的核心价值观之一。作为学生，我们应该用实际行动表达对老师的感激，因为正是有了老师的辛勤付出，我们才能茁壮成长，成为更好的自己。',
            linkEn:        'In short, honouring and respecting teachers is not only a traditional virtue of the Chinese community, but also one of the core values upheld by Singaporean society. As students, we should express our gratitude to teachers through concrete actions, because it is precisely through their hard work and dedication that we are able to grow and become better versions of ourselves.',
          },
        },
      },
      targetKeywords: ['感激', '卡片', '尊师重道', '难舍难分', '礼物'],
    },
  },
  // ── Civic (c1–c4) ───────────────────────────────────────────
  {
    id: 'c1', yearLabel: '2023', themeId: 'civic',
    subThemeCn: '公共交通礼仪', subThemeEn: 'Public Transport Courtesy', focusSkill: 'Opinion',
    reading: {
      text: '晚餐后，爸爸建议全家去滨海湾散步。晚风阵阵，凉爽宜人。望着不远处灯光闪亮的夜景，我不禁赞叹新加坡的城市建设是多么壮观。路上，我们遇到几位游客正在问路，爸爸热情地带领他们找到了目的地。这次散步不仅让我放松了心情，也让我学会了待人处事的礼貌与热情。',
      targetWords: ['建议', '宜人', '赞叹', '壮观', '热情', '礼貌', '放松'],
    },
    conversation: {
      storyboardDesc: 'A bus stop where a student is talking loudly on the phone. Another person is giving up their seat to an elderly woman.',
      scenarioDescription:   '录像里，一群人正在巴士站候车。一名学生旁若无人地大声讲电话，引来旁人侧目；与此同时，一名乘客看到一位步履蹒跚的老奶奶站在旁边，便主动起身让座，轻声邀请她坐下。',
      scenarioDescriptionEn: 'In the video, a group of people are waiting at a bus stop. One student is talking loudly on the phone, drawing disapproving looks from those nearby; at the same time, a passenger notices an elderly woman who is unsteady on her feet standing beside him, and proactively stands up to offer his seat, quietly inviting her to sit down.',
      questions: {
        q1: {
          cn: '请描述录像中巴士站里人们的行为。',
          keywords:    ['有秩序', '依次', '耐心等候', '不插队', '公共礼仪', '互相尊重', '不仅……也……', '一方面……另一方面……', '自觉排队', '文明行为'],
          en: 'Please describe the behaviours of the people at the bus stop in the video.',
          peelAnswer: {
            point:       '录像中巴士站里，不同的人表现出截然不同的行为，体现了良好公德心与缺乏公德心的对比。',
            elaboration: '一方面，一名乘客主动让座给站在旁边的老奶奶，关心弱势群体，体现了体谅他人的精神；另一方面，一名学生却在候车时大声讲电话，完全忽视了周围人的感受，影响了公共环境的安宁。',
            example:     '例如，录像中那名主动让座的乘客，虽然自己也可能很疲惫，但看到老奶奶站立不稳，仍然毫不犹豫地站起来，轻声请老人坐下，这种举动令旁人都投以赞许的目光。',
            link:        '两种行为的对比提醒我们，在公共场所，我们的一言一行都会影响周围的人。只有每个人都学会体谅他人、自律守礼，才能共同维护和谐舒适的公共环境。',
          },
        },
        q2: {
          cn: '为什么在公共场所保持低声说话是一种公德心的表现？',
          keywords:    ['公德心', '体现', '素质', '低声交谈', '言行举止', '不仅……也……', '既……又……', '有助于', '社会和谐', '良好习惯', '尊重他人'],
          en: 'Why is speaking softly in public places an act of civic-mindedness?',
          peelAnswer: {
            point:       '在公共场所保持低声说话，是对他人感受的尊重，也是公德心的具体体现。',
            elaboration: '公共场所人来人往，大家有各自不同的需求：有些人在阅读或工作，需要安静的环境；有些老人或生病的人对噪音特别敏感；还有一些人只是希望在候车或休息时，享受片刻的宁静。若我们在公共场所大声喧哗，就会干扰到这些人，破坏公共空间的和谐气氛。',
            example:     '例如，在图书馆或地铁里，若有人讲电话声音洪亮，旁边试图阅读的人往往会感到烦躁，无法专心。相反，若大家都自觉地压低声音，整个环境就会令人感到舒适和平静。',
            link:        '因此，低声说话看似是一件小事，却能反映出一个人是否真正体谅他人、尊重公共空间。这种从小培养的习惯，正是新加坡公民素质和公德心的重要体现。',
          },
        },
        q3: {
          cn: '在公共交通工具上，你会如何照顾有需要的人？',
          keywords:    ['主动让座', '体贴', '关爱', '力所能及', '身体力行', '不仅……也……', '从小培养', '责任感', '爱心', '奉献精神'],
          en: 'How would you care for those in need on public transport?',
          peelAnswer: {
            point:       '在公共交通工具上，我会主动关注身边有需要的人，并尽力给予帮助。',
            pointEn:       'On public transport, I would proactively look out for those in need around me and do my best to help them.',
            elaboration: '例如，若我看到老人、孕妇、带着幼儿的家长或行动不便的乘客站立，我会主动让出座位；如果有人提着重物上下车，我会帮忙扶一把；若发现有人感到不适，我会通知地铁或巴士工作人员，请他们提供协助。',
            elaborationEn: 'For example, if I see elderly passengers, pregnant women, parents with young children, or passengers with mobility difficulties standing, I would proactively offer my seat; if someone is struggling with heavy bags while boarding or alighting, I would help steady them; and if I notice someone feeling unwell, I would inform the MRT or bus staff and request assistance on their behalf.',
            example:     '有一次，我乘地铁时看到一位老爷爷靠着柱子站着，神情疲倦。当时我刚好有座位，便立刻站起来对他说："爷爷，请坐。"他感激地笑了，那一刻让我感到非常满足，也明白了举手之劳对他人来说可以是莫大的帮助。',
            exampleEn:     'Once, while riding the MRT, I noticed an elderly gentleman leaning against a pole looking exhausted. I happened to have a seat, so I immediately stood up and said, "Grandfather, please sit down." He smiled gratefully, and that moment made me feel very fulfilled. It also made me realise that such a small act can mean so much to another person.',
            link:        '我认为，在公共交通工具上照顾有需要的人，不仅是礼貌的体现，更是我们作为社会一份子应有的责任感。这种关怀让社会变得更温暖，也让乘车的体验对每个人来说都更加愉快。',
            linkEn:        'I believe that caring for those in need on public transport is not only an expression of courtesy but also a responsibility we all have as members of society. This kind of consideration makes our community warmer and the experience of travelling more pleasant for everyone.',
          },
        },
      },
      targetKeywords: ['大声喧哗', '让位', '礼貌', '公德心', '体谅他人'],
    },
  },
  {
    id: 'c2', yearLabel: '2007', themeId: 'civic',
    subThemeCn: '熟食中心公德', subThemeEn: 'Hawker Centre Civics', focusSkill: 'Phonetic',
    reading: {
      text: '今天下午，天气晴朗。我和妈妈一起去邻里的熟食中心用餐。虽然正值午餐最忙的时候，但大家都能自觉地排队。我注意到一个小男孩在吃完饭后，主动把托盘收回回收架上。妈妈夸奖他是个懂事的孩子。如果我们每个人都能做到这一步，小贩中心的卫生环境就会得到很大的改善。',
      targetWords: ['熟食中心', '自觉', '托盘', '夸奖', '改善', '卫生', '懂事'],
    },
    conversation: {
      storyboardDesc: 'A crowded hawker centre. People are returning their trays. One family leaves their mess behind.',
      questions: {
        q1: {
          cn: '录像中人们在熟食中心用餐后的行为有什么不同？',
          en: 'How do the behaviours of people after dining in the hawker centre differ in the video?',
          peelAnswer: {
            point:         '录像中，熟食中心里的用餐者在饭后表现出截然不同的公德心，形成了鲜明的对比。',
            pointEn:       'In the video, diners at the hawker centre displayed starkly contrasting levels of civic-mindedness after their meals.',
            elaboration:   '一方面，许多用餐者在吃完饭后，自动自觉地把托盘连同碗碟一起送回回收架，保持桌面的整洁；另一方面，也有一个家庭用餐结束后，把餐桌弄得脏乱不堪，随手离去，把清理的工作完全留给了清洁阿姨，毫不顾及他人的感受。',
            elaborationEn: 'On one hand, many diners consciously returned their trays along with their bowls and dishes to the collection rack after eating, keeping the tables tidy; on the other hand, one family left their table in a complete mess after their meal and walked away, leaving all the cleaning work entirely to the cleaner without any regard for others.',
            example:       '例如，录像中有一位年迈的婆婆，她用餐完毕后，尽管行动不便，仍然坚持把托盘推到回收点放好。她的举动令旁边的年轻人都不好意思继续坐着不动，纷纷效仿，主动收拾好自己的桌面。这一幕让我深受感动。',
            exampleEn:     'For example, in the video there was an elderly woman who, despite having difficulty moving around, still insisted on pushing her tray to the return point after finishing her meal. Her actions made the young people nearby too embarrassed to remain seated, and they followed her lead by proactively tidying up their own tables. This scene moved me greatly.',
            link:          '录像中两种截然不同的行为提醒我们，在熟食中心保持卫生，是每一位用餐者的责任。只有大家都能自动自觉地收拾托盘、保持桌面整洁，才能为所有人创造一个舒适、愉快的用餐环境，这正是新加坡公德心的最好体现。',
            linkEn:         "The two contrasting behaviours in the video remind us that maintaining hygiene at the hawker centre is every diner's responsibility. Only when everyone consciously returns their trays and keeps the tables clean can we create a comfortable and pleasant dining environment for all — and this is the finest expression of civic-mindedness in Singapore.",
          },
        },
        q2: {
          cn: '你通常会自己收拾碗碟吗？为什么？',
          en: 'Do you usually clear your own dishes? Why?',
          peelAnswer: {
            point:         '是的，我通常都会自己收拾碗碟。我认为这是每一位用餐者应尽的本分，也是对清洁工作人员的基本尊重。',
            pointEn:        "Yes, I usually clear my own dishes. I believe this is every diner's duty and a basic form of respect for cleaning workers.",
            elaboration:   '熟食中心和小贩中心的清洁工叔叔阿姨每天要处理大量的碗碟和残留食物，工作十分辛苦。如果每位用餐者都能在离桌前把碗碟和托盘整理好，就能大大减轻他们的工作负担，让他们有更多时间维持整个环境的清洁。此外，收拾碗碟也是对下一位用餐者的体贴，让他们能在干净的桌面上舒适地用餐。',
            elaborationEn:  "The cleaners working at hawker centres handle large amounts of bowls, dishes and food leftovers every day, and their work is extremely tiring. If every diner tidies up their bowls and trays before leaving the table, it greatly reduces the cleaners' workload and allows them more time to maintain the overall cleanliness of the environment. Moreover, clearing the table is also an act of consideration for the next diner, allowing them to eat comfortably at a clean table.",
            example:       '记得有一次，我和家人在大牌坊熟食中心用餐。吃完后，我主动把托盘推到回收架，并把桌面的剩余食物清理好。就在这时，旁边的清洁婆婆对我竖起大拇指，说："这个孩子真懂事！"那一刻，我感到十分开心，也更加明白，一个小小的行动可以让别人感到非常温暖。',
            exampleEn:     'I remember once having a meal with my family at a hawker centre. After eating, I proactively pushed the tray to the return rack and cleared the leftover food from the table. Just then, the elderly cleaner nearby gave me a thumbs-up and said, "This child is so sensible!" In that moment, I felt very happy, and understood even more that a small action can make another person feel truly warm inside.',
            link:          '因此，我认为养成收拾碗碟的习惯，不仅是对环境的负责，更是展现个人良好品德的方式。在新加坡这样一个多元社会中，每个人都做好自己的本分，才能共同维护我们引以为傲的干净、整洁的公共环境。',
            linkEn:         "Therefore, I believe that cultivating the habit of clearing one's own dishes is not only responsible behaviour towards the environment, but also a way of demonstrating good personal character. In a diverse society like Singapore, only when everyone fulfils their own duty can we collectively maintain the clean and tidy public environment that we are proud of.",
          },
        },
        q3: {
          cn: '你认为政府强制执行回收托盘的计划是否有效？',
          en: "Do you think the government's mandatory tray return scheme is effective?",
          peelAnswer: {
            point:         '我认为政府强制执行回收托盘的计划是有效的，它能改善熟食中心的卫生状况，但也需要公众在心态上的转变。',
            pointEn:       "I believe the government's mandatory tray return scheme is effective in improving hygiene at hawker centres, though it also requires a shift in public mindset.",
            elaboration:   '自从新加坡于2021年开始推行强制回收托盘计划后，各大熟食中心的桌面卫生状况确实有了明显的改善，清洁人员的工作压力也有所减轻。强制性措施能让那些原本没有这个习惯的人建立起新的行为模式，长期坚持下去，就能逐渐内化为一种自然的习惯。然而，单靠强制也有其局限性——真正的改变需要公众从心底里认同这件事的意义，而不只是因为害怕罚款才去做。',
            elaborationEn: "Since Singapore began implementing the mandatory tray return scheme in 2021, the hygiene of tables at hawker centres has indeed improved noticeably, and the workload on cleaning staff has also been somewhat reduced. Mandatory measures can help those who did not previously have this habit to establish new behaviour patterns, and with sustained practice over time, it can gradually become a natural habit. However, compulsion alone has its limitations — real change requires the public to genuinely recognise the meaning of the action from the heart, rather than doing it merely out of fear of fines.",
            example:       '例如，在我家附近的小贩中心，自从推行强制回收计划后，我发现几乎每一张桌子在用餐者离开后都变得整齐许多，回收架旁边也不再堆满散乱的托盘。这让用餐的环境变得更加舒适，大家的体验也因此提升了不少。',
            exampleEn:     'For example, at the hawker centre near my home, ever since the mandatory return scheme was implemented, I have noticed that almost every table is left much tidier after diners leave, and there are no longer piles of scattered trays beside the return racks. This has made the dining environment much more comfortable, significantly improving the experience for everyone.',
            link:          '综上所述，我认为强制执行是一个有效的起点，但更重要的是通过教育让公众真正明白保持公共卫生的意义。只有当每一个新加坡人都发自内心地愿意收拾自己的托盘，熟食中心才能真正成为一个令人愉快的用餐胜地。',
            linkEn:        'In conclusion, I believe that mandatory enforcement is an effective starting point, but what is even more important is educating the public to truly understand the significance of maintaining public hygiene. Only when every Singaporean willingly returns their own tray from the heart can hawker centres truly become a genuinely enjoyable dining destination.',
          },
        },
      },
      targetKeywords: ['碗碟', '自动自觉', '保持卫生', '肮脏', '小贩中心'],
    },
  },
  {
    id: 'c3', yearLabel: '2004', themeId: 'civic',
    subThemeCn: '公园环保行为', subThemeEn: 'Park Environmental Conduct', focusSkill: 'Narrative',
    reading: {
      text: '每到周末，邻里的公园总是非常热闹。孩子们在游乐场里尽情地玩耍，乐龄人士则在树下下棋聊天。我看到草地上有一些被风吹散的垃圾，于是赶紧走过去把它们捡起来。保持公园的整洁是我们每个居民的责任。只有大家齐心协力，我们才能在这个美丽的绿色家园里享受轻松的时光。',
      targetWords: ['热闹', '尽情', '整洁', '齐心协力', '居民', '责任', '轻松'],
    },
    conversation: {
      storyboardDesc: 'A park scene. People are littering while others are using trash bins properly. A park ranger is giving a warning.',
      questions: {
        q1: {
          cn: '描述录像中公园里人们爱护环境和不爱护环境的行为。',
          en: 'Describe the behaviours of people caring for and not caring for the environment in the park in the video.',
          peelAnswer: {
            point:         '录像中，公园里的人们对待环境的态度截然不同，有人以身作则爱护公物，也有人漠视公共卫生、随意乱丢垃圾。',
            pointEn:       'In the video, people in the park had very different attitudes towards the environment — some led by example and cared for public property, while others disregarded public hygiene and littered carelessly.',
            elaboration:   '一方面，录像中有些游客和家长非常自律，用完饮料后会主动把空瓶放进垃圾桶，也有人看到草地上散落的垃圾，弯腰捡起来丢进最近的垃圾箱。另一方面，也有人在树荫下用餐后，把食物包装纸和饮料罐随手一扔，全然不顾对公园环境的影响，公园管理员看到后立刻上前发出警告。',
            elaborationEn: 'On one hand, some visitors and parents in the video were very self-disciplined — after finishing their drinks, they proactively placed the empty bottles in the rubbish bin; some even bent down to pick up scattered litter from the grass and threw it into the nearest bin. On the other hand, some people, after eating under the trees, carelessly threw their food wrappers and drink cans aside without any regard for the impact on the park environment, and a park ranger immediately stepped forward to issue a warning.',
            example:       '例如，录像中有一名小朋友，在爸爸的带领下，主动把地上的塑料袋捡起来放入垃圾桶。小朋友的爸爸还对他说："我们要爱护公园，让大家都能享受这个美好的地方。"这一幕让我深刻体会到，环保意识需要从家庭教育开始，以身作则是最有效的方式。',
            exampleEn:     'For example, in the video, a young child — guided by his father — proactively picked up a plastic bag from the ground and placed it in the rubbish bin. His father then said to him, "We must take care of the park so everyone can enjoy this beautiful place." This scene made me deeply appreciate that environmental awareness needs to begin with family education, and leading by example is the most effective approach.',
            link:          '录像中两种截然不同的行为提醒我们，公园是全体居民共同享有的公共空间。每一个人的行为，无论多么微小，都会对整体环境产生影响。只有大家都承担起爱护公共环境的责任，我们的公园才能永远保持美丽整洁。',
            linkEn:         "The two contrasting behaviours in the video remind us that parks are shared public spaces enjoyed by all residents. Every person's behaviour, no matter how small, has an impact on the overall environment. Only when everyone takes responsibility for caring for the public environment can our parks remain beautiful and clean forever.",
          },
        },
        q2: {
          cn: '如果你看到同学乱丢垃圾，你会如何提醒他？',
          en: 'If you see a classmate littering, how would you remind them?',
          peelAnswer: {
            point:         '如果我看到同学乱丢垃圾，我会以温和、友善的方式提醒他，而不是当众批评或指责。',
            pointEn:       'If I saw a classmate littering, I would remind them in a gentle and friendly manner, rather than criticising or scolding them publicly.',
            elaboration:   '直接的批评很容易让对方感到难堪，可能会引起反感，甚至影响同学之间的关系。因此，我会选择私下或用轻松的语气提醒，比如走到他身旁，微笑着说："不如我们一起去把它丢进垃圾桶吧？"这样既能达到提醒的效果，也能避免让他在众人面前感到尴尬。',
            elaborationEn: 'Direct criticism can easily embarrass the other person, potentially causing resentment and even affecting the relationship between classmates. Therefore, I would choose to remind them privately or in a relaxed tone — for example, walking up beside them and saying with a smile, "How about we go throw it in the rubbish bin together?" This achieves the purpose of reminding while avoiding making them feel embarrassed in front of others.',
            example:       '记得有一次在东海岸公园野餐，一个朋友随手把饮料罐扔在草地上。我没有大声指责他，而是蹲下来把罐子捡起来，对他说："我们把它丢好吧，不然公园会被弄脏的。"他愣了一下，然后笑着说谢谢我，之后一整天都很注意不乱扔垃圾。',
            exampleEn:       "I remember once during a picnic at East Coast Park, a friend casually tossed a drink can onto the grass. Instead of scolding him loudly, I bent down, picked up the can, and said to him, \"Let's throw it properly — otherwise the park will get dirty.\" He paused for a moment, then smiled and thanked me, and was careful not to litter at all for the rest of the day.",
            link:          '我认为，用友善的方式提醒他人，不仅更容易被接受，也能在无形中感染身边的人，让大家都逐渐养成爱护环境的好习惯。这种以身作则、温和引导的方式，才是真正有效地维护我们公共环境的做法。',
            linkEn:        'I believe that reminding others in a kind and friendly way is not only more likely to be accepted, but also subtly influences those around us, gradually helping everyone develop the good habit of caring for the environment. This approach of leading by example and offering gentle guidance is the truly effective way to maintain our public environment.',
          },
        },
        q3: {
          cn: '你认为加强环保教育对保护新加坡的绿化环境有什么作用？',
          en: "What role do you think strengthening environmental education plays in protecting Singapore's greenery?",
          peelAnswer: {
            point:         '我认为加强环保教育，是保护新加坡绿化环境最根本、最持久的方式，因为它能从思想上改变人们的行为。',
            pointEn:       "I believe that strengthening environmental education is the most fundamental and lasting way to protect Singapore's greenery, because it can bring about behavioural change at the level of mindset.",
            elaboration:   '相比起罚款等强制措施，教育能够让人们从内心真正明白爱护环境的重要性，进而主动采取行动。当孩子从小就学会不乱丢垃圾、节约资源和保护自然，这些意识便会伴随他们一生，并在成年后影响家人和身边的人，形成良性的循环。此外，学校通过环保活动，如清洁公园、废物分类，也能让学生在实践中加深体会，不仅仅停留在课本上的知识。',
            elaborationEn:  "Compared to compulsory measures such as fines, education can help people genuinely understand the importance of caring for the environment from within, thereby motivating them to take action proactively. When children learn from young not to litter, to conserve resources, and to protect nature, these values will accompany them throughout their lives, and as adults they will influence their families and those around them, creating a positive cycle. In addition, schools can deepen students' understanding through environmental activities such as park clean-ups and waste sorting — going beyond mere textbook knowledge.",
            example:       '例如，新加坡学校推行的"生态花园计划"让同学们在校园里种植植物，亲身体会植物生长的不易和大自然的珍贵。参与过这个活动的同学，普遍都变得更加爱护校园内的花草树木，不再随意践踏或折断树枝。',
            exampleEn:     "For example, Singapore schools' Eco Garden Programme allows students to grow plants on the school grounds, personally experiencing how difficult it is for plants to grow and how precious nature is. Students who have participated in this activity generally become much more careful about caring for the flowers, grass and trees on campus, no longer casually trampling them or breaking off branches.",
            link:          '综上所述，环保教育不仅能保护新加坡的绿化环境，更能培养出一代有责任感、有公德心的公民。从小培养这种意识，新加坡才能真正实现"花园城市"的美好愿景，让绿色成为这座城市永恒的底色。',
            linkEn:          "In conclusion, environmental education not only protects Singapore's green environment, but also nurtures a generation of citizens with a sense of responsibility and civic-mindedness. By cultivating this awareness from young, Singapore can truly realise the beautiful vision of a \"Garden City\", allowing green to become the enduring backdrop of this nation.",
          },
        },
      },
      targetKeywords: ['乱丢垃圾', '提醒', '爱护公物', '垃圾桶', '以身作则'],
    },
  },
  {
    id: 'c4', yearLabel: '2018', themeId: 'civic',
    subThemeCn: '图书馆守则', subThemeEn: 'Library Conduct', focusSkill: 'Vocab',
    reading: {
      text: '图书馆是一个求知的好地方。在那里，我们不仅能阅读到各类有趣的书本，还能体会到浓浓的学习气氛。但是，在图书馆里必须遵守规章制度，特别是要保持绝对的安静。如果不小心大声说话，会严重影响其他读者的专注力。学会体谅他人，是我们作为社会一份子应有的基本修养。',
      targetWords: ['求知', '气氛', '遵守', '规章制度', '严重', '专注力', '修养'],
    },
    conversation: {
      storyboardDesc: 'Library scene. A student is playing mobile games with loud sound on. Another person is trying to study and looks frustrated.',
      questions: {
        q1: {
          cn: '录像中在图书馆里发生了什么干扰他人的行为？',
          en: 'What disruptive behaviour occurred in the library in the video?',
          peelAnswer: {
            point:         '录像中，图书馆里发生了一起严重影响他人专注力的干扰行为，让正在用功的读者感到十分困扰。',
            pointEn:       'In the video, a seriously disruptive behaviour occurred in the library that greatly disturbed the concentration of readers who were studying hard.',
            elaboration:   '一名同学在图书馆内公然拿出手机，旁若无人地玩起了游戏，手机里传出的游戏音效声音响亮，完全打破了图书馆里安静的气氛。坐在他旁边正在温习功课的同学，多次侧目示意，却得不到任何回应，只能无奈地皱起眉头，难以专心阅读。',
            elaborationEn: 'A student openly took out his phone and began playing mobile games in the library without any regard for those around him. The loud game sound effects from his phone completely shattered the quiet atmosphere of the library. The student sitting beside him who was revising could only give repeated sidelong glances as a hint, receiving no response, and was left with no choice but to frown helplessly, unable to concentrate on reading.',
            example:       '例如，录像中那名玩游戏的同学，不仅没有把手机调成静音，还不时发出笑声，引起周围许多读者的不满。图书馆的管理员在收到投诉后，才走过去请他把手机收起来。这说明，在公共场所缺乏自律，不仅会打扰他人，还会让自己在众人面前显得非常没有修养。',
            exampleEn:     'For example, the student playing games in the video not only failed to put his phone on silent, but also laughed out loud from time to time, causing displeasure among many nearby readers. The librarian only went over to ask him to put away his phone after receiving complaints. This shows that lacking self-discipline in public places not only disturbs others, but also makes oneself appear very ill-mannered in front of everyone.',
            link:          '录像中这一幕提醒我们，图书馆是一个供大家学习和阅读的公共空间，每一位使用者都有责任维护这里的安静。遵守图书馆规则，不仅是对他人的尊重，更是个人修养的体现。在新加坡，我们应该共同珍惜这些宝贵的公共学习资源。',
            linkEn:        'This scene in the video reminds us that the library is a shared public space for everyone to learn and read, and every user has a responsibility to maintain its quietness. Observing library rules is not only a sign of respect for others but also a reflection of personal cultivation. In Singapore, we should all cherish these precious public learning resources together.',
          },
        },
        q2: {
          cn: '在图书馆或电影院等需要安静的场所，你会注意什么？',
          en: 'In quiet places like libraries or cinemas, what would you pay attention to?',
          peelAnswer: {
            point:         '在图书馆或电影院等需要安静的场所，我会特别注意控制自己的音量、举止和电子设备的使用，以免打扰到他人。',
            pointEn:       'In quiet places such as libraries or cinemas, I would pay special attention to controlling my volume, my conduct, and the use of electronic devices, so as not to disturb others.',
            elaboration:   '首先，进入图书馆前，我会先把手机调成静音或振动模式，避免铃声突然响起吓到旁人。其次，与同伴交谈时，我会刻意压低声音，甚至选择用文字传递信息。此外，在电影院入场前，我也会提醒同行的家人或朋友关掉手机铃声，在影片放映期间不要大声评论或接听电话。',
            elaborationEn: 'Firstly, before entering a library, I would switch my phone to silent or vibrate mode to avoid a sudden ringtone startling those nearby. Secondly, when chatting with companions, I would consciously lower my voice, or even opt to communicate via text messages. In addition, before entering a cinema, I would also remind family members or friends accompanying me to turn off their phone ringtones and to refrain from making loud comments or taking calls during the film.',
            example:       '记得有一次，我在国家图书馆温习华文，旁边坐着一位正在备考的大哥哥。我全程都保持安静，没有发出任何声音。临走前，他主动道谢，说："谢谢你，你让我能够专心复习。"那一刻，我深刻体会到，安静守礼不只是规定，更是对他人最好的礼物。',
            exampleEn:     'I remember once revising Chinese at the National Library, sitting next to a older student who was preparing for an important exam. I remained completely quiet throughout, not making a single sound. As I was leaving, he proactively thanked me, saying, "Thank you — you allowed me to concentrate on my revision." In that moment, I deeply appreciated that being quiet and well-mannered is not just a rule, but the finest gift we can give to others.',
            link:          '因此，我认为在需要安静的公共场所自律守礼，是每一位新加坡公民应有的基本素质。这种体谅他人的精神，不仅能让公共空间更加和谐，也能体现出我们作为一个文明社会的整体素养。',
            linkEn:        'Therefore, I believe that being self-disciplined and well-mannered in public places requiring quietness is a basic quality every Singaporean citizen should possess. This spirit of consideration for others not only makes public spaces more harmonious, but also reflects the overall civility of us as a civilised society.',
          },
        },
        q3: {
          cn: '为什么学会控制自己的音量是尊重他人的表现？',
          en: 'Why is learning to control your volume a sign of respect for others?',
          peelAnswer: {
            point:         '我认为，学会控制自己的音量，是尊重他人感受的一种具体表现，也反映了一个人是否真正具备公德心。',
            pointEn:        "I believe that learning to control one's volume is a concrete expression of respect for others' feelings, and also reflects whether a person truly possesses civic-mindedness.",
            elaboration:   '公共场所里有各种各样的人，他们来自不同的背景，有着不同的需求。有些人需要安静的环境专心学习或工作；有些人身体状况较差，对噪音特别敏感；还有婴儿或老人，更容易受到大声噪音的干扰。当我们学会控制自己的音量，其实是在主动考虑这些人的感受，而不是只顾自己的方便。',
            elaborationEn: 'In public places, there are all kinds of people from different backgrounds with different needs. Some need a quiet environment to concentrate on studying or working; some have weaker health and are particularly sensitive to noise; there are also babies and elderly people who are more easily disturbed by loud sounds. When we learn to control our volume, we are actively considering the feelings of these people, rather than thinking only of our own convenience.',
            example:       '例如，在新加坡地铁上，我们经常能看到贴有"请勿大声说话"的提示牌，这正是因为许多乘客需要一个安静的乘车环境。如果有人在车厢内大声喧哗，不仅会引来旁人的侧目，也会让乘车体验变差，影响整个车厢内的和谐气氛。',
            exampleEn:     'For example, on the Singapore MRT, we often see signs reminding passengers "Please do not speak loudly" — precisely because many commuters need a quiet travelling environment. If someone is talking loudly in the carriage, it not only draws disapproving glances from those nearby but also worsens the travel experience and disrupts the harmonious atmosphere of the entire carriage.',
            link:          '总而言之，控制音量看似是一件微不足道的小事，但它却能深刻地体现一个人的言行举止和社会素质。在新加坡这样一个多元共处的社会中，从小培养控制音量的习惯，是我们对彼此最基本也最真实的尊重。',
            linkEn:         "In short, controlling one's volume may seem like a trivial matter, but it profoundly reflects a person's conduct and social standards. In a diverse society like Singapore where people of different backgrounds live together, cultivating the habit of controlling our volume from young is the most basic and genuine respect we can show for one another.",
          },
        },
      },
      targetKeywords: ['安静', '自私', '干扰', '专注', '道歉'],
    },
  },
  // ── Community (n1–n4) ────────────────────────────────────────
  {
    id: 'n1', yearLabel: '2025 Day 1', themeId: 'community',
    subThemeCn: '邻里互助', subThemeEn: 'Neighbourly Kindness', focusSkill: 'Narrative',
    reading: {
      text: '住在组屋区，邻居之间的关系非常重要。上个周末，我看到邻居李奶奶正费力地提着两袋沉重的东西。我见状赶紧跑上前去，主动提出帮忙。李奶奶露出了开心的笑容，连声向我道谢。通过这次经历，我意识到邻里之间应该互相体谅、互相关怀。哪怕是一个小小的行为，也能让我们的社区变得更加美好和和谐。',
      targetWords: ['组屋区', '沉重', '体谅', '关怀', '行为', '美好', '和谐'],
    },
    conversation: {
      storyboardDesc: 'A student holding the lift door open for an elderly neighbour carrying groceries at an HDB void deck.',
      questions: {
        q1: {
          cn: '描述录像中邻里之间互相帮助的情景。',
          en: 'Describe the scene of mutual help between neighbours in the video.',
          peelAnswer: {
            point:         '录像中，一名学生在组屋走廊主动帮助了一位行动不便的年迈邻居，温馨地展现了邻里之间互相关怀的精神。',
            pointEn:       'In the video, a student in an HDB block proactively helped an elderly neighbour who had difficulty moving, warmly demonstrating the spirit of mutual care between neighbours.',
            elaboration:   '那名学生看到老奶奶拎着两大袋沉重的杂货，在等候电梯，便立刻上前，为她按住电梯门，还主动提出帮忙拎袋子。老奶奶脸上露出了感激的笑容。短短一分钟的举手之劳，却让两人之间的距离拉近了许多，也让走廊里的气氛顿时变得温馨。',
            elaborationEn: 'The student noticed the elderly woman waiting for the lift with two large, heavy bags of groceries, and immediately stepped forward to hold the lift door open for her, proactively offering to carry the bags. The elderly woman broke into a grateful smile. This small act of kindness took only a minute, yet it brought the two of them much closer and instantly made the corridor feel warm and cosy.',
            example:       '例如，录像中那名学生虽然背着书包，看起来也很疲惫，但他依然选择停下脚步，主动帮助有需要的邻居。这种"举手之劳"的精神，正是新加坡提倡的甘榜精神的体现——邻里之间不只是住在同一栋楼里的陌生人，而是可以相互依靠的伙伴。',
            exampleEn:     'For example, the student in the video was carrying a school bag and appeared tired, yet he still chose to stop and proactively help his neighbour in need. This spirit of "lending a helping hand" is precisely the expression of the kampong spirit that Singapore promotes — neighbours are not merely strangers living in the same block, but companions who can rely on each other.',
            link:          '这一幕让我深刻体会到，邻里关系的温暖，往往来自于这些看似微不足道的小行动。在组屋密集的新加坡，若每个人都能多一分关心、多一点主动，我们的社区便能成为一个充满人情味的温暖家园，远亲不如近邻这句话也将得到最好的诠释。',
            linkEn:          "This scene made me deeply appreciate that the warmth of neighbourly relations often comes from these seemingly insignificant small actions. In Singapore's densely-populated HDB estates, if everyone shows a little more care and takes a little more initiative, our community can become a warm home full of human warmth — giving the saying \"a close neighbour is better than a distant relative\" its finest meaning.",
          },
        },
        q2: {
          cn: '你曾有过帮助邻居的经历吗？分享你的感受。',
          en: 'Have you ever had an experience of helping a neighbour? Share your feelings.',
          peelAnswer: {
            point:         '有的，我曾经帮助过邻居，那次经历让我深深体会到，助人不只是帮了别人，更是让自己感到快乐和满足。',
            pointEn:       'Yes, I have helped a neighbour before, and that experience made me deeply appreciate that helping others does not just benefit them — it also brings joy and fulfilment to oneself.',
            elaboration:   '在新加坡的组屋社区里，邻居之间有时候会需要彼此的帮忙。可能是帮忙收一收被雨淋湿的衣物，也可能是在邻居外出时替他们收取包裹。这些小小的帮忙，虽然不需要花太多时间，却能让邻居感受到温暖和被关心，也能增进双方的情谊。',
            elaborationEn:  "In Singapore's HDB communities, neighbours sometimes need each other's help — perhaps bringing in laundry that has been caught in the rain, or receiving parcels for a neighbour who is out. These small acts of help, though they do not take much time, allow neighbours to feel warmth and care, and also strengthen the bond between both parties.",
            example:       '记得有一次，我们楼上的林爷爷突然感到身体不舒服，行动不便，无法下楼买菜。妈妈得知后，立刻多买了一些食材，煮好了一锅粥，让我送到林爷爷家门口。林爷爷感动得连声道谢，说这碗粥比他平日吃过的任何东西都香。那一刻，我感到十分温暖，也明白了邻里之间的关怀是多么珍贵。',
            exampleEn:     'I remember once, Grandpa Lin from the floor above us suddenly felt unwell and could not go downstairs to buy groceries. Upon learning this, my mother bought extra ingredients, cooked a pot of porridge, and asked me to bring it to his door. Grandpa Lin was so moved that he thanked us repeatedly, saying the porridge tasted better than anything he had eaten in a long time. In that moment, I felt very warm inside, and understood how precious the care between neighbours truly is.',
            link:          '我认为，在快节奏的现代新加坡，邻里之间的关怀和互助尤为珍贵。正是这些平凡的善举，让我们的组屋社区充满了人情味，让住在同一栋楼里的陌生人，慢慢变成了彼此关心的好邻居。',
            linkEn:        'I believe that in fast-paced modern Singapore, the care and mutual help between neighbours is especially precious. It is precisely these ordinary acts of kindness that fill our HDB communities with human warmth, gradually transforming strangers living in the same block into good neighbours who genuinely care for each other.',
          },
        },
        q3: {
          cn: '为什么"远亲不如近邻"这句话在现代社会依然重要？',
          en: 'Why is the saying "a close neighbour is better than a distant relative" still important today?',
          peelAnswer: {
            point:         '我认为"远亲不如近邻"这句话在现代社会依然非常重要，因为好邻居是我们在日常生活中最直接、最及时的支援。',
            pointEn:         "I believe the saying \"a close neighbour is better than a distant relative\" remains very important in today's society, because good neighbours are our most direct and timely support in everyday life.",
            elaboration:   '在新加坡，许多家庭的亲戚可能住在远处，甚至身处海外。在遇到突发状况时，如家中长辈晕倒、孩子放学无人接送，住在附近的邻居往往能够比远方的亲戚更快地伸出援手。邻居的即时帮助，有时候可以在关键时刻挽救生命、解决危机。因此，与邻居建立良好的关系，不仅让生活更加便利，更是一种重要的安全保障。',
            elaborationEn:  "In Singapore, many families' relatives may live far away, or even overseas. In emergencies — such as an elderly family member fainting at home, or a child having no one to pick them up after school — a neighbour living nearby can reach out to help far more quickly than a distant relative. A neighbour's immediate help can sometimes save lives or resolve crises at critical moments. Therefore, building good relationships with neighbours not only makes life more convenient, but is also an important form of safety assurance.",
            example:       '例如，新加坡曾经发生过这样的新闻：一位独居老人在家中晕倒，幸好邻居注意到他几天没有出现，主动敲门探望，才及时发现并呼叫救护车，让老人得救。这个真实的故事充分说明了好邻居的价值——他们的关心，可以是一条生命的保障。',
            exampleEn:      "For example, Singapore has had news reports of an elderly person living alone who fainted at home, fortunately a neighbour who noticed he had not appeared for a few days proactively knocked on his door to check on him, discovered the situation in time, and called an ambulance, saving his life. This true story fully illustrates the value of good neighbours — their care can be a guarantee of someone's life.",
            link:          '因此，无论社会如何现代化，"远亲不如近邻"的道理永远不会过时。我们应该主动与邻居建立友好的关系，共同维护一个互相关爱、守望相助的社区，让新加坡的甘榜精神在高楼大厦之间代代流传。',
            linkEn:        'Therefore, no matter how modernised society becomes, the wisdom of "a close neighbour is better than a distant relative" will never be outdated. We should proactively build friendly relationships with our neighbours and together maintain a community of mutual care and support, allowing the kampong spirit of Singapore to be passed down from generation to generation among the high-rise blocks.',
          },
        },
      },
      targetKeywords: ['远亲不如近邻', '互相照顾', '温馨', '举手之劳', '人情味'],
    },
  },
  {
    id: 'n2', yearLabel: '2012', themeId: 'community',
    subThemeCn: '乐龄义工服务', subThemeEn: 'Senior Volunteer Work', focusSkill: 'Opinion',
    reading: {
      text: '学校假期期间，许多学生会选择去社区中心参加义工活动。在那里，我们不仅能认识来自不同背景的人士，还能培养关爱他人的心和责任感。昨天，我帮乐龄中心的爷爷奶奶们整理房间，并陪他们聊天。看着他们开心的样子，我也觉得非常充实。这种助人为乐的行为，不仅帮助了他人，也丰富了我们自己的人生经历。',
      targetWords: ['期间', '义工', '责任感', '整理', '充实', '助人为乐', '经历'],
    },
    conversation: {
      storyboardDesc: 'Students volunteering at an elderly home. One student is performing a song while others are chatting with the seniors.',
      questions: {
        q1: {
          cn: '录像中同学们在乐龄中心做了哪些活动？',
          en: 'What activities did the students do at the senior centre in the video?',
          peelAnswer: {
            point:         '录像中，同学们在乐龄中心开展了多种充满爱心的活动，用实际行动表达了对乐龄人士的关怀与尊重。',
            pointEn:       'In the video, the students organised a variety of compassionate activities at the senior centre, expressing their care and respect for the elderly through concrete actions.',
            elaboration:   '同学们的活动丰富多彩：有的在台上表演歌唱和舞蹈节目，让爷爷奶奶们开怀大笑；有的则坐在长辈身边，陪伴他们聊天，耐心地倾听他们讲述年轻时的故事；还有一些同学为长辈们端茶倒水，帮忙整理房间，让整个乐龄中心的气氛变得非常温馨、热闹。',
            elaborationEn:  "The students' activities were rich and varied: some performed songs and dances on stage, making the grandmothers and grandfathers laugh heartily; others sat beside the elderly, accompanying them in conversation and patiently listening to their stories from their younger days; yet others brought tea for the seniors and helped tidy up the rooms, making the atmosphere of the entire senior centre very warm and lively.",
            example:       '例如，录像中有一名同学在台上演唱了一首经典的粤语老歌，台下的爷爷奶奶们立刻露出了会心的笑容，有几位甚至跟着轻声哼唱。这名同学在表演后，走到台下，握住一位老奶奶的手，亲切地聊了起来。那一幕让在场所有人都深受感动。',
            exampleEn:     'For example, one student in the video sang a classic Cantonese song on stage, and the grandmothers and grandfathers below immediately broke into knowing smiles, with several softly humming along. After the performance, the student walked off the stage, took the hand of one elderly woman, and began chatting warmly with her. That scene deeply moved everyone present.',
            link:          '录像中同学们的义工活动，不仅给乐龄人士带来了欢乐和陪伴，更让同学们自己从中学到了尊老爱幼的美德和关爱社会弱势群体的责任感。这种从小培养的爱心，将成为他们一生中宝贵的精神财富。',
            linkEn:         "The students' volunteer activities in the video not only brought joy and companionship to the elderly, but also taught the students themselves the virtues of respecting and cherishing the elderly, as well as a sense of responsibility for caring for society's vulnerable groups. This compassion cultivated from young will become a precious spiritual asset in their lives.",
          },
        },
        q2: {
          cn: '如果你有空，你会选择什么样的义工服务？为什么？',
          en: 'If you had time, what kind of volunteer service would you choose? Why?',
          peelAnswer: {
            point:         '如果我有空，我会选择到乐龄中心或社区医院参与义工服务，陪伴那些独居或行动不便的老人。',
            pointEn:       'If I had time, I would choose to volunteer at a senior centre or community hospital, accompanying elderly people who live alone or have difficulty moving around.',
            elaboration:   '在新加坡，随着社会老龄化的加剧，有不少乐龄人士因为子女工作繁忙或居住在外地，而长期独处，缺乏陪伴和关爱。对他们来说，有人愿意抽出时间来陪他们聊天、一起做手工或者参与轻松的活动，是非常珍贵的精神支持。我认为，陪伴比物质上的给予更加重要，因为孤独感才是许多乐龄人士面对的最大挑战。',
            elaborationEn: 'In Singapore, as society ages, many elderly people find themselves living alone for extended periods with insufficient companionship and care, due to their children being busy with work or living elsewhere. For them, having someone willing to spend time chatting with them, doing crafts together, or participating in light activities is extremely precious emotional support. I believe that companionship is more important than material giving, because loneliness is the greatest challenge many elderly people face.',
            example:       '记得有一次，学校组织我们到一家乐龄护理中心探访。我和一位八十多岁的爷爷聊了将近一个小时，他分享了很多年轻时在新加坡生活的故事，讲得眉飞色舞。临走前，他握着我的手说："你们来，是我最开心的事。"那一刻，我非常感动，也暗下决心，以后要常来探访。',
            exampleEn:     'I remember once our school organised a visit to an elderly care centre. I chatted with a gentleman in his eighties for nearly an hour; he shared many animated stories of his life in Singapore when he was young, his face lighting up as he spoke. As I was leaving, he held my hand and said, "Your visit is the thing that makes me happiest." In that moment, I was very moved, and silently vowed to come back to visit often.',
            link:          '因此，我认为参与乐龄义工服务，不仅能为社会作出贡献，更是一次让自己成长的机会。在陪伴长辈的过程中，我们不仅给予了他们爱和关怀，也在他们的人生智慧中受益匪浅，这是一种双向的温暖和成长。',
            linkEn:        'Therefore, I believe that participating in elderly volunteer service not only contributes to society, but is also an opportunity for personal growth. In the process of accompanying our elders, we not only give them love and care, but also benefit greatly from their life wisdom — it is a two-way exchange of warmth and growth.',
          },
        },
        q3: {
          cn: '你认为现在的年轻人应该如何关怀社会中的弱势群体？',
          en: 'How do you think young people today should care for vulnerable groups in society?',
          peelAnswer: {
            point:         '我认为年轻人应该从日常生活中的点滴小事做起，用实际行动表达对社会弱势群体的关怀与尊重。',
            pointEn:        "I believe young people should start with small everyday actions, expressing care and respect for society's vulnerable groups through concrete deeds.",
            elaboration:   '关怀弱势群体并不一定需要做轰轰烈烈的大事，有时候，一声问候、一次探访，或是在公共交通上主动让座，都能让有需要的人感受到被关心和被重视。年轻人可以通过参与义工活动、捐款捐物，或者只是留意身边需要帮助的人，来将这种关爱落实到生活的每一个角落。此外，在社交媒体上传播正能量，提高公众对弱势群体困境的关注，也是年轻人能够发挥影响力的方式。',
            elaborationEn:  "Caring for vulnerable groups does not necessarily require grand gestures — sometimes a word of greeting, a visit, or proactively giving up one's seat on public transport can make those in need feel cared for and valued. Young people can put this care into every corner of life by participating in volunteer activities, making donations, or simply noticing those around them who need help. In addition, spreading positivity on social media to raise public awareness of the plight of vulnerable groups is another way young people can exert their influence.",
            example:       '例如，在新加坡，许多中学和小学都会定期组织义工活动，让学生前往老人院、儿童之家或残障中心探访。参与这些活动的同学，往往会更加珍惜自己所拥有的，也会对他人的处境产生更多的同理心，成为更有爱心、更负责任的社会公民。',
            exampleEn:      "For example, in Singapore, many secondary and primary schools regularly organise volunteer activities, sending students to visit homes for the elderly, children's homes, or centres for the disabled. Students who participate in these activities often come to appreciate more what they have, and develop greater empathy for others' circumstances, growing into more compassionate and responsible members of society.",
            link:          '我相信，只要每一位年轻人都愿意付出一点点时间和心力去关怀身边的弱势群体，新加坡就能成为一个更加温暖、更具包容性的社会。这种从小培养的关爱精神，将会是我们这一代年轻人对国家最有意义的贡献。',
            linkEn:        'I believe that as long as every young person is willing to invest a little time and effort in caring for the vulnerable groups around them, Singapore can become a warmer and more inclusive society. This spirit of compassion cultivated from young will be the most meaningful contribution our generation of young people can make to the nation.',
          },
        },
      },
      targetKeywords: ['义工', '关怀', '乐龄人士', '温暖', '爱心'],
    },
  },
  {
    id: 'n3', yearLabel: '2005', themeId: 'community',
    subThemeCn: '邻里情谊', subThemeEn: 'Neighbourhood Bonds', focusSkill: 'Vocab',
    reading: {
      text: '每到傍晚时分，组屋楼下的小广场总是聚满了居民。孩子们在骑自行车，年轻人则在打球锻炼，场面十分热闹。我注意到几个邻居正围坐在长椅上，一边喝着咖啡，一边分享生活中的点滴。这种亲切的分享，增进了彼此的友情，也让邻里关系变得更加紧密。我们应该珍惜这些平凡而美好的邻里时光。',
      targetWords: ['傍晚', '锻炼', '热闹', '点滴', '亲切', '感情', '紧密'],
    },
    conversation: {
      storyboardDesc: 'A community party at the void deck. People of different races are sharing food and laughing together.',
      questions: {
        q1: {
          cn: '描述录像中邻居们在一起庆祝的情景。',
          en: 'Describe the scene of neighbours celebrating together in the video.',
          peelAnswer: {
            point:         '录像中，不同种族的邻居们聚集在组屋楼下的架空层，共同欢庆，现场充满了欢乐与温馨的气氛。',
            pointEn:       'In the video, neighbours of different races gathered at the void deck of an HDB block to celebrate together, creating an atmosphere filled with joy and warmth.',
            elaboration:   '架空层里摆满了各族的传统食物——有马来族的沙爹、华族的年糕、印度族的扁豆咖喱，大家你来我往地分享着各自的美食，笑声不断。孩子们在旁边嬉笑玩耍，老人们围坐在一起聊天，整个场面热闹而温馨，充分体现了新加坡多元种族和谐共处的美好景象。',
            elaborationEn:  "The void deck was filled with traditional foods from different ethnic groups — Malay satay, Chinese New Year cakes, and Indian dhal curry — as everyone came and went, sharing each other's food amid endless laughter. Children played and laughed nearby, while the elderly sat together chatting — the whole scene was lively and warm, fully embodying the beautiful picture of Singapore's multi-racial communities living in harmony.",
            example:       '例如，录像中一名华族的婆婆，把自己亲手包的粽子分给旁边的马来族邻居；那位邻居开心地接过来，还特地把自家的椰浆饭递了过去，两人相视而笑。这种跨越种族的分享与温情，正是新加坡社会最令人感动的地方。',
            exampleEn:     'For example, in the video, a Chinese grandmother shared her homemade rice dumplings with her Malay neighbours beside her; they happily accepted and in turn offered their own nasi lemak. The two looked at each other and smiled. This cross-racial sharing and warmth is precisely what is most heartening about Singaporean society.',
            link:          '录像中这场充满人情味的邻里庆祝活动，让我深刻体会到，无论种族、语言或宗教，邻里之间的情谊是超越一切隔阂的。在新加坡，这种多元共处、相互尊重的精神，正是我们最宝贵的社会财富之一。',
            linkEn:        'This neighbourly celebration filled with human warmth in the video made me deeply appreciate that regardless of race, language or religion, the bond between neighbours transcends all barriers. In Singapore, this spirit of living together in diversity and mutual respect is one of our most precious social assets.',
          },
        },
        q2: {
          cn: '你参加过邻里举办的活动吗？描述一下那个活动。',
          en: 'Have you participated in any neighbourhood events? Describe that event.',
          peelAnswer: {
            point:         '是的，我曾经参加过社区中心举办的邻里庆典，那次活动让我印象非常深刻，也让我更加热爱自己所居住的社区。',
            pointEn:       'Yes, I have participated in a neighbourhood celebration organised by the community centre, and that event left a very deep impression on me, making me appreciate my community even more.',
            elaboration:   '那是一次在国庆日前后举办的邻里联欢活动。社区中心在组屋的架空层搭起了舞台，各个年龄层的居民都踊跃参与。活动包括歌唱比赛、传统游戏、美食展览等，还有专为孩子准备的彩绘和手工环节。不同种族的家庭一起分享美食，一起欢笑，气氛非常融洽。',
            elaborationEn: 'It was a neighbourhood get-together held around National Day. The community centre set up a stage at the void deck of an HDB block, and residents of all ages participated enthusiastically. Activities included a singing competition, traditional games, food exhibitions, and art and craft sessions specially prepared for children. Families of different ethnicities shared food and laughed together — the atmosphere was wonderfully harmonious.',
            example:       '记得那天，我和妈妈一起参加了一个叫"猜灯谜"的传统游戏活动。旁边的印度族邻居也好奇地加入进来，虽然他们不太懂华文，但大家还是用手势和笑声一起玩得很开心。最后，我们还互相交换了节日食品，成为了好朋友。那次经历让我深深感受到，邻里活动是拉近不同种族之间距离最好的方式。',
            exampleEn:     'I remember that day, my mother and I joined a traditional game called "Lantern Riddle Guessing". Our Indian neighbours nearby joined in curiously as well — even though they did not understand much Chinese, everyone still had a wonderful time together through gestures and laughter. Afterwards, we exchanged festival foods with each other and became good friends. That experience made me feel deeply that neighbourhood events are the best way to bring different races closer together.',
            link:          '我认为，社区活动不仅仅是一种娱乐方式，更是建立邻里情谊、促进种族和谐的重要平台。在新加坡这个多元社会里，这类活动让居民有机会走出家门，认识彼此，共同创造美好的社区记忆。',
            linkEn:         "I believe that community activities are not merely a form of entertainment, but also an important platform for building neighbourly bonds and promoting racial harmony. In Singapore's diverse society, such activities give residents the opportunity to step out of their homes, get to know each other, and together create beautiful community memories.",
          },
        },
        q3: {
          cn: '举办邻里联欢活动对促进种族和谐有什么帮助？',
          en: 'How do neighbourhood parties help promote racial harmony?',
          peelAnswer: {
            point:         '我认为举办邻里联欢活动，是促进新加坡种族和谐最直接、最有效的方式之一，因为它能让不同种族的人在轻松愉快的气氛中增进了解和信任。',
            pointEn:       'I believe that organising neighbourhood get-together events is one of the most direct and effective ways to promote racial harmony in Singapore, as it allows people of different races to deepen mutual understanding and trust in a relaxed and enjoyable atmosphere.',
            elaboration:   '在日常生活中，尽管不同种族的居民住在同一栋组屋里，但因为工作繁忙、生活习惯不同，大家可能很少真正交流。邻里联欢活动创造了一个共同的空间和时间，让大家放下日常的隔阂，通过分享食物、参与游戏和节目，自然而然地拉近彼此的距离，减少误解，增进理解。',
            elaborationEn: 'In everyday life, although residents of different races live in the same HDB block, they may rarely truly interact due to busy work schedules and different lifestyles. Neighbourhood get-together events create a shared space and time for everyone to set aside everyday barriers, and through sharing food, participating in games and performances, naturally draw closer to each other, reducing misunderstandings and deepening understanding.',
            example:       '例如，新加坡每年的"邻里精神节"就是一个很好的例子。在这个节日里，各社区都会举办各种联欢活动，华族、马来族、印度族和欧亚裔居民一起参与，共同庆祝。许多参与者都表示，正是在这类活动中，他们才真正认识了住在隔壁的邻居，建立了长久的友谊。',
            exampleEn:      "For example, Singapore's annual Community Spirit Festival is a great example. During this festival, various communities hold get-together events, with Chinese, Malay, Indian and Eurasian residents participating together and celebrating jointly. Many participants have said that it was precisely at these events that they truly got to know the neighbours living next door, building lasting friendships.",
            link:          '因此，我认为邻里联欢活动是维护新加坡种族和谐最重要的基石之一。当不同种族的人彼此了解、彼此尊重，我们的社会才能真正实现多元共融，成为一个让每一个新加坡人都引以为傲的美好家园。',
            linkEn:        'Therefore, I believe that neighbourhood get-together events are one of the most important cornerstones for maintaining racial harmony in Singapore. When people of different races understand and respect each other, our society can truly achieve inclusive diversity, becoming a wonderful home that every Singaporean can be proud of.',
          },
        },
      },
      targetKeywords: ['和谐', '分享美食', '各族同胞', '凝聚力', '庆祝'],
    },
  },
  {
    id: 'n4', yearLabel: '2020', themeId: 'community',
    subThemeCn: '社区清洁日', subThemeEn: 'Community Clean-Up Day', focusSkill: 'Phonetic',
    reading: {
      text: '为了增强社区的团结，社区领导经常举办各种有意义的活动。上周，我们全家参加了社区清洁日。大家拿起工具，分头清理邻里小路和游乐场的垃圾。虽然满头大汗，但看着干净整洁的社区，大家都非常满足。通过参与这类活动，我深刻体会到保护家园是每个居民的本分，我们需要共同努力。',
      targetWords: ['团结', '工具', '满头大汗', '成就感', '保护', '本分', '共同努力'],
    },
    conversation: {
      storyboardDesc: 'A neighbourhood garden. Residents are planting vegetables together and sharing the harvest with others.',
      questions: {
        q1: {
          cn: '录像中居民们在邻里花园里做了什么？',
          en: 'What did the residents do in the neighbourhood garden in the video?',
          peelAnswer: {
            point:         '录像中，来自同一个社区的居民们一起在邻里花园里耕种、劳作，展现出团结合作、守望相助的甘榜精神。',
            pointEn:       'In the video, residents from the same community came together to farm and work in the neighbourhood garden, displaying the kampong spirit of unity, cooperation and mutual support.',
            elaboration:   '居民们分工合作：有的负责松土浇水，有的负责播种施肥，老人和孩子们也各尽其力，一起参与其中。虽然大家在烈日下劳作，汗流浃背，但脸上都挂着开心的笑容。当蔬菜和果实丰收时，大家更是喜悦地将收成分享给邻里，没有多要一份，体现了平等分享的精神。',
            elaborationEn: 'The residents worked with division of labour: some were in charge of loosening the soil and watering, others planted and fertilised; elderly residents and children each contributed their part and participated together. Although everyone worked under the scorching sun and sweated profusely, all their faces wore happy smiles. When the vegetables and fruits were harvested, everyone joyfully shared the produce with the neighbourhood — not keeping an extra share for themselves, embodying the spirit of equal sharing.',
            example:       '例如，录像中一名年约七十岁的老奶奶，虽然动作缓慢，但她坚持蹲下来为植物拔草，旁边的小朋友立刻跑来帮她，两人一老一少，配合得非常默契。这一幕让在场的居民都感到非常温馨，也让人不禁想起了新加坡早年的甘榜生活——那种邻里之间互相扶持的精神，至今依然值得我们传承。',
            exampleEn:      "For example, in the video, an elderly woman of about seventy, though slow in movement, persisted in crouching down to weed around the plants, and a child immediately ran over to help her. The two — one old, one young — worked together in perfect harmony. This scene made all the residents present feel very warm, and could not help but evoke memories of Singapore's early kampong life — that spirit of neighbours supporting each other is still worth passing down today.",
            link:          '录像中居民们共同耕种、分享收成的画面，生动地体现了新加坡甘榜精神的核心——齐心协力、互相照顾、共同建设美好社区。这种精神在高楼林立的现代新加坡，仍然是凝聚社区、增强邻里情谊最重要的力量。',
            linkEn:         "The scene of residents farming together and sharing their harvest in the video vividly embodies the core of Singapore's kampong spirit — working together with one heart, caring for each other, and collectively building a wonderful community. This spirit, even in modern Singapore surrounded by high-rise buildings, remains the most important force for bringing communities together and strengthening neighbourly bonds.",
          },
        },
        q2: {
          cn: '你对"甘榜精神"有什么理解？',
          en: 'What is your understanding of the "Kampong Spirit"?',
          peelAnswer: {
            point:         '我认为，"甘榜精神"是一种邻里之间互相关怀、守望相助、团结一致的传统精神，即使在现代的新加坡，它依然具有深刻的意义和价值。',
            pointEn:       'I believe that the "kampong spirit" is a traditional spirit of mutual care, support and solidarity between neighbours, and even in modern Singapore, it retains deep meaning and value.',
            elaboration:   '过去，新加坡的先辈们居住在甘榜（村落）里，大家共用井水、共同照顾孩子、在邻居有困难时主动出手相助。虽然今天的新加坡已是高度城市化的社会，居民住进了高楼组屋，生活方式也改变了许多，但甘榜精神的核心——对邻居的关心和对社区的责任感——却是永恒不变的。真正的甘榜精神，不需要我们住在同一条村，只需要我们愿意在别人有需要时，主动付出一点关心和帮助。',
            elaborationEn:  "In the past, Singapore's forebears lived in kampongs (villages), sharing well water, collectively looking after children, and proactively helping neighbours in difficulty. Although Singapore today is a highly urbanised society — with residents living in high-rise HDB flats and lifestyles having changed greatly — the core of the kampong spirit remains eternally unchanged: care for neighbours and a sense of responsibility towards the community. True kampong spirit does not require us to live in the same village — it only requires that we are willing to proactively offer a little care and help when others are in need.",
            example:       '例如，在新冠疫情期间，许多新加坡居民自发地帮助隔离在家的邻居购买日常用品，或是为独居老人送上热腾腾的饭菜。这些素不相识的邻居，因为一份守望相助的心，而成为了彼此生命中的温暖。这，正是甘榜精神在现代新加坡的最好体现。',
            exampleEn:      "For example, during the COVID-19 pandemic, many Singapore residents spontaneously helped neighbours who were quarantined at home by buying their daily necessities, or delivering hot meals to elderly people living alone. These neighbours, who might not have known each other before, became sources of warmth in each other's lives through a heart of mutual support. This is precisely the finest expression of the kampong spirit in modern Singapore.",
            link:          '我认为，甘榜精神不是一个遥远的历史概念，而是我们每天都可以实践的生活态度。只要每一个新加坡人都愿意多关心身边的邻居，主动伸出援手，我们就能在这座城市里，重现那份温暖而紧密的社区情谊。',
            linkEn:        'I believe that the kampong spirit is not a distant historical concept, but a life attitude that we can practise every single day. As long as every Singaporean is willing to pay more attention to their neighbours and proactively reach out to help, we can recreate that warm and close-knit community bond in this city.',
          },
        },
        q3: {
          cn: '你认为邻里之间互相分享食物或资源有什么好处？',
          en: 'What are the benefits of neighbours sharing food or resources?',
          peelAnswer: {
            point:         '我认为邻里之间互相分享食物或资源，不仅能在物质上给予彼此帮助，更能在精神上拉近大家的距离，增强社区的凝聚力。',
            pointEn:       'I believe that neighbours sharing food or resources not only provides each other with material help, but also brings people closer spiritually and strengthens the cohesion of the community.',
            elaboration:   '首先，从实际的角度来看，分享食物和资源能够减少浪费。比如，当某家人做了过多的食物，分给邻居享用，不仅避免了浪费，也让邻居省去了做饭的麻烦。其次，从社交的角度来看，分享是建立信任和情谊的桥梁。当邻居愿意把自家的食物或资源分享出来，这个举动本身就传递了一种"我们是一家人"的信号，让彼此之间的关系更加亲密。',
            elaborationEn: 'Firstly, from a practical perspective, sharing food and resources can reduce waste. For example, when a family has cooked more food than they need, sharing it with neighbours not only avoids waste but also saves the neighbours the trouble of cooking. Secondly, from a social perspective, sharing is a bridge for building trust and friendship. When neighbours are willing to share their food or resources, this act itself sends a signal of "we are all one family", making the relationship between everyone more intimate.',
            example:       '例如，在新加坡，每逢佳节，邻居之间互送传统食品是非常普遍的习俗——华族人家会送年饼，马来族家庭会送开斋节饼干，印度族家庭会送各式甜点。这种互赠食物的传统，不仅让每个家庭都能品尝到不同文化的美味，也让种族之间的情谊更加深厚，体现了新加坡多元文化和谐共处的美好精神。',
            exampleEn:      "For example, in Singapore, during festive seasons, it is very common for neighbours to exchange traditional foods — Chinese families give out New Year biscuits, Malay families share Hari Raya cookies, and Indian families give out various sweets. This tradition of exchanging food not only allows every family to taste the delicacies of different cultures, but also deepens the friendship between ethnic groups, embodying the beautiful spirit of Singapore's multicultural harmony.",
            link:          '因此，我认为鼓励邻里之间互相分享食物和资源，是构建温馨、和谐社区最简单也最有效的方式之一。一份食物、一份心意，就能在邻居之间播下一颗友谊的种子，让整个社区充满温暖与爱。',
            linkEn:        'Therefore, I believe that encouraging neighbours to share food and resources with each other is one of the simplest and most effective ways to build a warm and harmonious community. A portion of food, a gesture of goodwill, can plant a seed of friendship between neighbours and fill the entire community with warmth and love.',
          },
        },
      },
      targetKeywords: ['甘榜精神', '分享', '收成', '邻里关系', '耕种'],
    },
  },
  // ── Environment (e1–e4) ──────────────────────────────────────
  {
    id: 'e1', yearLabel: '2019', themeId: 'environment',
    subThemeCn: '废物回收行动', subThemeEn: 'Recycling at School', focusSkill: 'Vocab',
    reading: {
      text: '气候变化是全球面临的严重挑战。作为地球的一分子，我们每个人都应该从小事做起，积极保护环境。在日常生活中，我们可以养成节约用电、减少使用一次性塑料制品的好习惯。比如，出门时自带购物袋，或者随手关灯。这些小小的行为，如果积累起来，就会对地球的自然环境产生巨大的积极影响。',
      targetWords: ['严重', '挑战', '积极', '塑料制品', '养成', '自然环境', '影响'],
    },
    conversation: {
      storyboardDesc: 'A primary school sorting recycling items like plastic bottles, paper, and cans into blue bins.',
      questions: {
        q1: {
          cn: '录像中同学们在学校里如何进行废物利用和回收？',
          en: 'How did the students carry out waste reuse and recycling at school in the video?',
          peelAnswer: {
            point:         '录像中，同学们积极地在学校里推行废物分类和回收活动，展现出对环保的高度意识和责任感。',
            pointEn:       'In the video, students actively carried out waste sorting and recycling activities at school, demonstrating a high level of environmental awareness and sense of responsibility.',
            elaboration:   '同学们把收集到的废纸、塑料瓶和空罐子，仔细分门别类地放入蓝色回收箱。有的同学还把可以再利用的旧书本和文具整理好，准备捐给有需要的人。老师在一旁讲解每种废物应该如何分类，鼓励同学们养成随手回收的好习惯。整个活动井然有序，同学们都积极参与，气氛非常热烈。',
            elaborationEn: 'The students carefully sorted the waste paper, plastic bottles and empty cans they had collected into the blue recycling bins, placing each item in the correct category. Some students also tidied up old textbooks and stationery that could be reused, preparing to donate them to those in need. The teacher stood nearby explaining how each type of waste should be sorted, encouraging students to develop the habit of recycling as they go. The entire activity was well-organised, everyone participated enthusiastically, and the atmosphere was very lively.',
            example:       '例如，录像中有一名同学把一个用过的塑料瓶放进了普通垃圾桶，旁边的同学立刻友善地提醒他："这个应该放进蓝色回收箱！"那名同学立刻改正，还向大家道谢。这一幕让我看到，良好的环保习惯不只靠个人，更需要大家互相提醒和监督，共同守护我们的环境。',
            exampleEn:     'For example, in the video, one student placed a used plastic bottle in the regular rubbish bin, and a classmate beside him immediately reminded him kindly, "This should go into the blue recycling bin!" The student promptly corrected himself and thanked everyone. This scene showed me that good environmental habits are not only a personal effort — they also require everyone to remind and supervise each other, collectively protecting our environment.',
            link:          '录像中同学们的废物回收活动，生动地体现了新加坡推行的"减少、重用、回收"（3R）精神。从学校做起，培养环保意识，才能让这份责任感延伸到家庭和社区，让新加坡的绿色环境得到更好的保护。',
            linkEn:          "The waste recycling activities of the students in the video vividly embody Singapore's promoted spirit of \"Reduce, Reuse, Recycle\" (3R). Starting from school and cultivating environmental awareness allows this sense of responsibility to extend to the family and community, enabling Singapore's green environment to be better protected.",
          },
        },
        q2: {
          cn: '在家里，你和家人是如何实践"环保三字诀"（减少、重用、回收）的？',
          en: 'At home, how do you and your family practise the "3Rs" (Reduce, Reuse, Recycle)?',
          peelAnswer: {
            point:         '在家里，我们全家都很注重实践"减少、重用、回收"的环保原则，把这些习惯融入了日常生活的每一个细节。',
            pointEn:       'At home, our whole family pays close attention to practising the environmental principles of "Reduce, Reuse, Recycle", incorporating these habits into every detail of our daily lives.',
            elaboration:   '在"减少"方面，我们购物时会自带购物袋，尽量不要商店的塑料袋；用餐时，我们会适量点菜，不浪费食物。在"重用"方面，妈妈会把用过的塑料盒洗干净再利用来储存食物，爸爸也会把旧报纸叠好，留着包东西或垫桌脚。在"回收"方面，我们在厨房旁边专门放了一个回收箱，把可回收的纸张、金属和塑料分开收集，定期送到楼下的蓝色回收桶。',
            elaborationEn: 'In terms of "Reduce", we bring our own shopping bags when grocery shopping and try to avoid taking plastic bags from stores; when having meals, we order in appropriate quantities and do not waste food. In terms of "Reuse", Mum washes used plastic containers and repurposes them to store food; Dad also folds up old newspapers and saves them for wrapping things or stabilising table legs. In terms of "Recycle", we have a dedicated recycling box next to the kitchen where we separately collect recyclable paper, metal and plastic, and regularly bring them down to the blue recycling bins downstairs.',
            example:       '记得有一次，我把一个用完的厕纸卷心纸筒留了下来，在美术课上用它做成了一个笔筒。老师非常欣赏，还在班上展示了我的作品，鼓励其他同学也学习重用废旧材料。那次经历让我明白，创意加上环保，能让废物变成宝。',
            exampleEn:     'I remember once I kept an empty toilet paper roll and used it in art class to make a pencil holder. The teacher was very impressed and displayed my work to the class, encouraging other students to also learn to reuse waste materials. That experience made me understand that creativity combined with environmental care can turn waste into treasure.',
            link:          '我相信，环保从家庭做起，影响最为深远。当每个家庭都能身体力行地实践"减少、重用、回收"，我们的社区和整个新加坡，都将因此变得更加绿色和可持续。',
            linkEn:        'I believe that when environmental care begins at home, the impact is most far-reaching. When every family practises "Reduce, Reuse, Recycle" through action, our community and all of Singapore will become greener and more sustainable as a result.',
          },
        },
        q3: {
          cn: '你认为政府应该采取什么措施来鼓励更多国人参与环保？',
          en: 'What measures do you think the government should take to encourage more Singaporeans to participate in environmental protection?',
          peelAnswer: {
            point:         '我认为政府应该从教育、激励和基础设施三个方面入手，多管齐下，鼓励更多新加坡人积极参与环保。',
            pointEn:       'I believe the government should take a multi-pronged approach involving education, incentives and infrastructure to encourage more Singaporeans to actively participate in environmental protection.',
            elaboration:   '首先，在教育方面，政府可以从小学开始，将环保知识更深入地纳入课程，让孩子们在学校就养成良好的环保习惯；同时，通过社区讲座和媒体宣传，提高成人的环保意识。其次，在激励方面，政府可以为积极回收的家庭或个人提供奖励，例如积分兑换或消费优惠，让环保行为与实际利益挂钩，激发更多人参与的动力。此外，在基础设施方面，增加便民的回收设施，比如在每个组屋楼下都设置分类回收站，能有效降低居民参与回收的门槛。',
            elaborationEn:  "Firstly, in terms of education, the government can incorporate environmental knowledge more deeply into the curriculum from primary school, allowing children to develop good environmental habits in school; simultaneously, raising adults' environmental awareness through community talks and media campaigns. Secondly, in terms of incentives, the government can provide rewards for families or individuals who actively recycle — such as points for redemption or consumer discounts — linking environmental behaviour with tangible benefits to motivate more people to participate. Furthermore, in terms of infrastructure, increasing convenient recycling facilities, such as setting up sorting recycling stations at the foot of every HDB block, can effectively lower the barrier for residents to participate in recycling.",
            example:       '例如，新加坡推行的"换废品换奖励"计划，让居民把旧电器和废品送到指定地点，换取购物优惠券。这个计划推出后，参与率明显提高，也有效减少了电子废物的不当处理。这证明，将激励机制与环保行动挂钩，是鼓励公众参与的有效方式。',
            exampleEn:       "For example, Singapore's \"Recycle for Rewards\" scheme allows residents to bring old appliances and waste items to designated locations in exchange for shopping vouchers. After this scheme was launched, participation rates increased noticeably and also effectively reduced improper disposal of electronic waste. This demonstrates that linking incentive mechanisms with environmental actions is an effective way to encourage public participation.",
            link:          '综上所述，要让更多新加坡人参与环保，需要政府、学校和社区三方共同努力。只有当环保成为每个人的生活习惯，而不只是口号，我们才能真正实现可持续发展，为子孙后代留下一个更美好的地球。',
            linkEn:         "In conclusion, to encourage more Singaporeans to participate in environmental protection requires the joint efforts of the government, schools and the community. Only when environmental care becomes a part of everyone's lifestyle — rather than merely a slogan — can we truly achieve sustainable development and leave a better planet for future generations.",
          },
        },
      },
      targetKeywords: ['再循环', '蓝色回收箱', '分类', '节约', '环保意识'],
    },
  },
  {
    id: 'e2', yearLabel: '2021', themeId: 'environment',
    subThemeCn: '节约用水', subThemeEn: 'Water Conservation', focusSkill: 'Opinion',
    reading: {
      text: '水是生命的源泉，我们必须学会珍惜水资源。在新加坡，虽然我们的供水系统非常先进，但由于雨水有时不足，我们仍需时刻保持节水意识。洗手时，我们不应该让水龙头一直流，而应在涂抹肥皂时把它关掉。只有每个人都意识到节约的道理，我们才能确保后代子孙依然拥有充足且干净的饮用水。',
      targetWords: ['源泉', '珍惜', '意识', '充足', '节约', '供水', '后代'],
    },
    conversation: {
      storyboardDesc: 'A campaign poster in the school toilet showing a child wasting water and another child correcting them.',
      questions: {
        q1: {
          cn: '描述录像中海报展示的正确和错误用水行为。',
          en: 'Describe the correct and incorrect water usage behaviours shown in the poster in the video.',
          peelAnswer: {
            point:         '录像中的海报清晰地展示了正确和错误两种截然不同的用水行为，让同学们直观地了解到如何节约用水。',
            pointEn:       'The poster in the video clearly illustrated two distinctly different water usage behaviours — correct and incorrect — allowing students to understand intuitively how to conserve water.',
            elaboration:   '在错误用水行为方面，海报展示了一名孩子在涂抹洗手液时，任由水龙头一直流淌，大量的水白白浪费掉；另一张图则显示有人用整浴缸的水洗澡，却只用了一小部分。相反，在正确用水行为方面，海报展示了关掉水龙头涂肥皂的正确做法，以及使用淋浴代替泡澡、收集洗菜水来浇花等节水妙招。',
            elaborationEn: 'In terms of incorrect water usage, the poster showed a child letting the tap run continuously while applying hand soap, with large amounts of water going to waste; another image showed someone filling an entire bathtub to bathe but using only a small amount of it. In contrast, for correct water usage, the poster showed the right approach of turning off the tap when applying soap, as well as water-saving tips such as using a shower instead of a bath, and collecting vegetable-washing water to water plants.',
            example:       '例如，录像中海报上的那张"正确"图画让我印象特别深刻——一名小朋友在刷牙时，主动把水杯装满水后再关上龙头，而不是让水一直流着。旁边的文字写道："一次刷牙，省下六公升水！"这个数字让我大吃一惊，也让我意识到，节约用水，真的可以从刷牙这样的小事做起。',
            exampleEn:     'For example, the "correct" image on the poster in the video left a particularly deep impression on me — a child proactively filled a cup with water and turned off the tap before brushing their teeth, rather than letting the water run throughout. The text beside it read: "One tooth-brushing session saves six litres of water!" This figure surprised me greatly, and made me realise that water conservation can truly start from something as simple as brushing your teeth.',
            link:          '这张海报生动地提醒我们，节约用水不需要做大事，只需要在日常生活的每一个小细节上多加注意。在新加坡这个水资源相对匮乏的国家，每一滴水都是宝贵的，我们每个人都有责任珍惜和保护它。',
            linkEn:        'This poster vividly reminds us that water conservation does not require grand gestures — it simply requires paying more attention to every small detail of daily life. In Singapore, a country with relatively scarce water resources, every drop of water is precious, and every one of us has a responsibility to cherish and protect it.',
          },
        },
        q2: {
          cn: '除了节约用水，你在日常生活中还通过哪些方式保护自然资源？',
          en: 'Besides saving water, what other ways do you protect natural resources in your daily life?',
          peelAnswer: {
            point:         '除了节约用水，我在日常生活中还会通过节约用电、减少塑料使用和珍惜食物等多种方式来保护自然资源。',
            pointEn:       'Besides saving water, I also protect natural resources in my daily life through various means such as conserving electricity, reducing plastic use and cherishing food.',
            elaboration:   '在节约用电方面，我养成了离开房间时随手关灯的习惯，也会在不需要充电时拔掉充电器，避免待机耗电。在减少塑料使用方面，我出门购物时会自带布袋，买饮料时会自带水壶，拒绝一次性塑料杯和吸管。在珍惜食物方面，我每次点餐都会适量，把碗里的食物吃干净，不随意浪费。',
            elaborationEn: 'In terms of conserving electricity, I have cultivated the habit of switching off lights when leaving a room, and also unplugging chargers when charging is not needed to avoid standby power consumption. In terms of reducing plastic use, I bring my own reusable bag when shopping and carry my own water bottle when going out to buy drinks, refusing single-use plastic cups and straws. In terms of cherishing food, I always order in appropriate quantities and finish everything in my bowl, not wasting food carelessly.',
            example:       '记得有一次，我在麦当劳点饮料时，服务员问我要不要吸管，我主动说不用，因为我随身带了一根可重复使用的不锈钢吸管。旁边的同学看到后觉得很新奇，问我在哪里买的，还说要回家也学着做。那一刻，我意识到，自己的小小行动，也可以影响身边的人。',
            exampleEn:      "I remember once when I ordered a drink at McDonald's, the staff asked if I wanted a straw — I proactively said no, as I had brought along a reusable stainless steel straw. The classmate beside me found this novel and asked where I bought it, saying they wanted to do the same at home. In that moment, I realised that my own small actions can influence those around me.",
            link:          '我相信，保护自然资源不只是政府或大企业的责任，也是我们每一个普通人应该承担的日常责任。只要每个人都在生活中做出一点点改变，汇聚起来就是巨大的力量，足以让我们的地球变得更加美好。',
            linkEn:        'I believe that protecting natural resources is not only the responsibility of the government or large corporations — it is also a daily responsibility that every ordinary person should assume. As long as each person makes even a small change in their life, the collective force of these changes is tremendous enough to make our planet a better place.',
          },
        },
        q3: {
          cn: '为什么从小培养孩子的环保习惯对社会的可持续发展很重要？',
          en: "Why is fostering environmental habits in children important for the sustainable development of society?",
          peelAnswer: {
            point:         '我认为从小培养孩子的环保习惯，对社会的可持续发展至关重要，因为儿童阶段是形成价值观和行为模式的关键时期。',
            pointEn:       'I believe that fostering environmental habits in children from young is crucial for the sustainable development of society, because childhood is a critical period for forming values and behavioural patterns.',
            elaboration:   '在幼儿和小学阶段养成的习惯，往往会伴随一个人终生。如果孩子从小就学会节约用水、减少垃圾、爱护自然，这些行为将成为他们成年后的自然反应，而不是需要刻意提醒的规则。此外，孩子的环保行为也会对家庭产生"感染效应"——许多父母正是因为看到孩子认真地把垃圾分类、提醒家长关灯，才自己也开始更加注重环保。',
            elaborationEn:   "Habits formed during the preschool and primary school years often accompany a person for life. If children learn from young to conserve water, reduce waste and care for nature, these behaviours will become their natural responses as adults, rather than rules that need deliberate reminding. Moreover, children's environmental behaviours also have an \"infection effect\" on the family — many parents begin to pay more attention to environmental care precisely because they see their children carefully sorting rubbish and reminding them to switch off the lights.",
            example:       '例如，新加坡的"3R基金计划"支持学校推行环保项目，让学生参与设计节能海报、组织回收活动等。参与这些项目的学生，往往会把在学校学到的环保知识带回家，与父母和兄弟姐妹分享，形成良好的家庭环保氛围，影响深远。',
            exampleEn:       "For example, Singapore's \"3R Fund Scheme\" supports schools in implementing environmental projects, allowing students to participate in designing energy-saving posters and organising recycling activities. Students who participate in these projects often bring the environmental knowledge they have learned at school back home, sharing it with parents and siblings, creating a positive family environmental atmosphere with far-reaching influence.",
            link:          '因此，投资于对儿童的环保教育，就是在为未来的可持续社会打下基础。当这一代孩子长大成为新加坡社会的中坚力量，他们所带来的绿色生活方式和环保意识，将是最宝贵的社会财富，让我们的子孙后代都能享有一个清洁、美丽的家园。',
            linkEn:         "Therefore, investing in environmental education for children is laying the foundation for a sustainable society in the future. When this generation of children grows up to become the backbone of Singapore's society, the green lifestyles and environmental awareness they bring will be the most precious social asset, allowing our descendants to enjoy a clean and beautiful home.",
          },
        },
      },
      targetKeywords: ['节约用水', '水龙头', '浪费', '珍惜', '后代'],
    },
  },
  {
    id: 'e3', yearLabel: '2011', themeId: 'environment',
    subThemeCn: '海边清洁活动', subThemeEn: 'Coastal Clean-Up', focusSkill: 'Narrative',
    reading: {
      text: '最近，我们班举行了一次海边清洁活动。虽然烈日当空，但同学们干劲十足，大家都希望能为保护海洋环境尽一分力。我们在沙滩上捡到了许多烟头、塑料瓶和废弃的鱼网。看到原本脏乱的沙滩变得干净整洁，我十分开心。这次活动让我明白，如果我们不爱护自然，最终受害的将是我们人类自己。',
      targetWords: ['干劲十足', '沙滩', '废弃', '整洁', '保护', '受害', '爱护'],
    },
    conversation: {
      storyboardDesc: 'Families participating in a coastal cleanup at East Coast Park. They are picking up microplastics and litter.',
      questions: {
        q1: {
          cn: '描述录像中人们在海边进行清洁活动的情景。',
          en: 'Describe the scene of people carrying out a cleanup activity at the beach in the video.',
          peelAnswer: {
            point:         '录像中，一群来自不同家庭的热心居民聚集在海边，共同参与一场意义深远的海滩清洁活动。',
            pointEn:       'In the video, a group of enthusiastic residents from different families gathered at the beach to participate together in a deeply meaningful coastal clean-up activity.',
            elaboration:   '大人和孩子们各自戴上手套，提着垃圾袋，弯腰在沙滩上仔细地捡拾各种垃圾，包括饮料瓶、烟蒂、废弃渔网，甚至是肉眼难以察觉的微塑料颗粒。虽然天气炎热，大家都汗流浃背，但没有人叫苦叫累，反而干劲十足，互相鼓励。不到两个小时，原本布满垃圾的沙滩变得焕然一新，令人心旷神怡。',
            elaborationEn: 'Adults and children each put on gloves, carried rubbish bags, and bent down to carefully pick up all kinds of litter from the sand, including drink bottles, cigarette butts, discarded fishing nets, and even microplastic particles that were difficult to spot with the naked eye. Although the weather was hot and everyone was sweating profusely, no one complained — on the contrary, everyone was full of energy and encouraging each other. In less than two hours, the beach that had been strewn with rubbish was completely transformed, leaving the heart refreshed.',
            example:       '例如，录像中有一名大约八岁的小女孩，她仔细地把沙滩上的每一个瓶盖都捡起来，放入分类垃圾袋。她的爸爸在一旁微笑着说："做得好！每个瓶盖如果流入海里，都可能被海龟误食。"那名小女孩听了，更加认真地低头捡垃圾。这一幕让我深受感动，也让我明白，保护海洋，是从每一个小小的行动开始的。',
            exampleEn:     'For example, in the video there was a girl of about eight years old who carefully picked up every bottle cap from the sand and placed it into a sorted rubbish bag. Her father smiled beside her and said, "Well done! Every bottle cap that enters the ocean could be mistakenly eaten by a sea turtle." Upon hearing this, the girl bent down even more diligently to pick up litter. This scene deeply moved me, and made me understand that protecting the ocean begins with every small individual action.',
            link:          '录像中这场海滩清洁活动，不仅让海边恢复了整洁，更让参与者深刻体会到保护自然环境的意义和责任感。在新加坡，东海岸公园是许多家庭喜爱的休闲胜地，只有我们共同爱护这片海滩，才能让它继续成为大家享受自然的美好场所。',
            linkEn:        'The coastal clean-up activity in the video not only restored the beach to cleanliness, but also allowed participants to deeply appreciate the meaning and responsibility of protecting the natural environment. In Singapore, East Coast Park is a favourite leisure destination for many families — only by collectively caring for this beach can we ensure it continues to be a wonderful place for everyone to enjoy nature.',
          },
        },
        q2: {
          cn: '你去过海边吗？你在那里通常会做些什么来保护环境？',
          en: 'Have you been to the beach? What do you usually do there to protect the environment?',
          peelAnswer: {
            point:         '是的，我常常和家人去东海岸公园的海边游玩，每次去，我都会注意自己的行为，尽力保护那里的环境。',
            pointEn:       'Yes, I often go to the beach at East Coast Park with my family, and each time I go, I am mindful of my behaviour and do my best to protect the environment there.',
            elaboration:   '首先，我们家有一个不成文的规定：去海边时，必须自带垃圾袋，把所有产生的垃圾都带走，不留下任何东西。其次，我也会注意不踩踏珊瑚或破坏沙滩上的贝壳，因为这些都是海洋生态系统的一部分。此外，若我在沙滩上看到他人遗留的垃圾，我也会顺手捡起来丢进最近的垃圾桶。',
            elaborationEn: 'Firstly, our family has an unwritten rule: when going to the beach, we must bring our own rubbish bags and take all our waste away with us, leaving nothing behind. Secondly, I also make sure not to trample on coral or damage shells on the beach, as these are all part of the marine ecosystem. In addition, if I see litter left behind by others on the beach, I will pick it up and throw it into the nearest rubbish bin.',
            example:       '记得有一次，我们去圣淘沙的海滩游玩，我发现一个废弃的塑料袋漂浮在浅水处。我立刻蹲下来把它取出，拿到岸上丢进垃圾桶。妈妈看到后，竖起大拇指说："做得好！塑料袋如果留在海里，小鱼和海龟很容易把它误认为食物吃下去，会非常危险。"那次经历让我更加坚定地认为，保护海洋从我做起，每一个举动都很重要。',
            exampleEn:     'I remember once when we went to the beach at Sentosa, I spotted an abandoned plastic bag floating in the shallow water. I immediately crouched down to take it out and brought it to shore to throw into a rubbish bin. Mum saw this and gave me a thumbs-up, saying, "Well done! If plastic bags remain in the sea, small fish and sea turtles can easily mistake them for food and swallow them — very dangerous." That experience made me even more firmly believe that protecting the ocean starts with me, and every action matters.',
            link:          '我认为，在享受海边美景的同时，我们每个人都有责任爱护这片大自然的馈赠。只要每一位游客都能做到自律守礼，不乱丢垃圾，我们的海滩就能永远保持它的美丽，让更多人和更多代人都能享受到这份珍贵的自然财富。',
            linkEn:        'I believe that while enjoying the beauty of the beach, every one of us has a responsibility to cherish this gift of nature. As long as every visitor can be self-disciplined and not litter, our beaches can remain beautiful forever, allowing more people and more generations to enjoy this precious natural treasure.',
          },
        },
        q3: {
          cn: '你认为这类社区清洁活动对提高公众的环保意识有帮助吗？为什么？',
          en: 'Do you think these community cleanup activities help raise public environmental awareness? Why?',
          peelAnswer: {
            point:         '我认为社区清洁活动非常有助于提高公众的环保意识，因为它让参与者从亲身行动中体会到保护环境的重要性。',
            pointEn:       'I believe community cleanup activities are very effective in raising public environmental awareness, because they allow participants to appreciate the importance of environmental protection through personal action.',
            elaboration:   '单靠课本或宣传海报来传播环保意识，效果往往有限；但当人们亲自弯腰捡起沙滩上的垃圾，亲眼看见一袋袋被捡起的塑料瓶和废弃物，心中受到的触动和产生的责任感，是无法通过文字或图片传递的。这种切身的体验，能让人对环境污染的严重性有更深刻的认识，也更能激发他们在日常生活中主动采取行动的意愿。',
            elaborationEn: 'Relying solely on textbooks or promotional posters to spread environmental awareness often has limited effect; but when people personally bend down to pick up litter from the beach and see with their own eyes bag after bag of collected plastic bottles and waste items, the sense of being moved and the feeling of responsibility that arises in their hearts cannot be transmitted through words or images. This first-hand experience allows people to develop a deeper understanding of the seriousness of environmental pollution, and is more effective at inspiring their willingness to proactively take action in their daily lives.',
            example:       '例如，新加坡每年举办的"国际海岸清洁日"都吸引了数以千计的志愿者参与，包括许多学生和家庭。根据主办方的调查，许多参与者表示，在亲手清理海滩后，他们在日常生活中更加注意不使用一次性塑料、减少垃圾产生。这说明，实践出真知，社区清洁活动确实能有效地转化为长期的环保行为改变。',
            exampleEn:       "For example, Singapore's annual \"International Coastal Cleanup Day\" attracts thousands of volunteers to participate, including many students and families. According to surveys by the organisers, many participants reported that after personally cleaning up the beach, they became more mindful in their daily lives about not using single-use plastics and reducing waste generation. This shows that practice breeds true understanding, and community cleanup activities can indeed effectively translate into long-term behavioural changes in environmental care.",
            link:          '因此，我认为政府和学校应该积极推广更多这类社区清洁活动，让更多新加坡人有机会亲身参与。只有当环保不再只是一个口号，而是成为每一个人亲身体验过的承诺，我们才能真正共同守护新加坡这片美丽的土地和海洋。',
            linkEn:         "Therefore, I believe the government and schools should actively promote more of these community cleanup activities, giving more Singaporeans the opportunity to participate personally. Only when environmental care is no longer merely a slogan but becomes a commitment that every person has personally experienced can we truly collectively protect Singapore's beautiful land and ocean.",
          },
        },
      },
      targetKeywords: ['捡垃圾', '海洋生物', '污染', '保护环境', '参与'],
    },
  },
  {
    id: 'e4', yearLabel: '2023', themeId: 'environment',
    subThemeCn: '减少食物浪费', subThemeEn: 'Reducing Food Waste', focusSkill: 'Phonetic',
    reading: {
      text: '食物浪费是一个不容忽视的社会问题。在新加坡，每天都有大量的剩余食物被丢弃，这不仅造成了资源的巨大浪费，也加重了垃圾处理的负担。我们应该学会适量点餐，不要因为一时的贪心而造成浪费。如果每个人都能做到不剩饭菜，不仅能节省开销，还能为减少温室气体排放做出贡献，让地球变得更加健康。',
      targetWords: ['浪费', '忽视', '剩余', '适量', '贪心', '贡献', '排放'],
    },
    conversation: {
      storyboardDesc: 'A school canteen where students are leaving unfinished food. A teacher is explaining food waste to them.',
      questions: {
        q1: {
          cn: '描述录像中食堂里发生的食物浪费现象。',
          en: 'Describe the food waste occurring in the canteen in the video.',
          peelAnswer: {
            point:         '录像中，学校食堂里出现了令人痛心的食物浪费现象，许多同学将大量未吃完的食物随意丢弃，引起了在场老师的注意。',
            pointEn:       'In the video, a heartbreaking scene of food waste occurred in the school canteen, where many students carelessly discarded large amounts of uneaten food, drawing the attention of a teacher who was present.',
            elaboration:   '好几名同学在购买了丰盛的午餐后，只吃了几口便将其余的食物全部倒进垃圾桶。有的同学嫌米饭太多，有的觉得某道菜不合口味，便连同未动的食物一起丢弃。桌面上剩余的食物堆积如山，令人触目惊心。一位老师走过来，先是沉默地看着那些浪费掉的食物，然后温和地把同学们聚集起来，开始讲解食物浪费的严重后果。',
            elaborationEn: 'Several students, after purchasing a substantial lunch, ate only a few bites before dumping the rest entirely into the rubbish bin. Some students found the rice portion too large; others disliked the taste of a dish and threw it away along with untouched food. The table surfaces were piled high with leftover food — a jarring and distressing sight. A teacher walked over, silently observed the wasted food for a moment, then gently gathered the students together and began explaining the serious consequences of food waste.',
            example:       '例如，录像中一名同学把几乎整份炒饭都扔掉了，只因为里面有他不喜欢的青豆。老师看到后，耐心地对他说："这份炒饭需要农民种稻、工人加工、厨师烹饪，才能摆上你的桌子，浪费它就是不尊重这么多人的辛苦付出。"那名同学听了，低下头，若有所思。这一幕深刻地提醒了我，每一粒米饭的背后，都凝聚着无数人的辛勤劳动。',
            exampleEn:     'For example, in the video, one student threw away an almost entire serving of fried rice simply because it contained green peas he did not like. The teacher saw this and patiently said to him, "This fried rice required farmers to grow rice, workers to process it, and a chef to cook it before it arrived on your table — wasting it means not respecting the hard work of so many people." The student bowed his head upon hearing this, deep in thought. This scene profoundly reminded me that behind every grain of rice is the hard labour of countless people.',
            link:          '录像中的食物浪费现象让我深感痛心，也让我意识到，"光盘行动"在学校推广的必要性。在新加坡这个小小的岛国，食物安全是非常重要的议题。每一个同学都应该从自身做起，适量点餐，认真把碗里的食物吃干净，共同减少食物浪费。',
            linkEn:        'The food waste seen in the video filled me with deep distress and made me appreciate the necessity of promoting the "Clean Plate" campaign in schools. In Singapore, this small island nation, food security is a very important issue. Every student should start with themselves — ordering in appropriate quantities and conscientiously finishing everything in their bowl — to collectively reduce food waste.',
          },
        },
        q2: {
          cn: '你在用餐时会如何确保不浪费食物？',
          en: "How do you ensure you don't waste food when dining?",
          peelAnswer: {
            point:         '在用餐时，我会通过适量点餐、吃完碗里的食物，以及打包剩余食物等方式，尽量确保不浪费任何食物。',
            pointEn:       'When dining, I try to ensure I do not waste any food by ordering in appropriate quantities, finishing everything in my bowl, and packing up any remaining food to take away.',
            elaboration:   '首先，在点餐时，我会根据自己的食量来决定分量，不因贪心而点过多。如果不确定某道菜的分量，我会先点少一些，觉得不够再加，而不是一次过点太多。其次，在用餐时，我会提醒自己，碗里的每一粒米饭和每一道菜都要吃干净。最后，如果真的吃不完，我会请服务员帮忙打包，带回家下一餐继续享用，而不是浪费掉。',
            elaborationEn:  "Firstly, when ordering food, I decide on the portion based on my own appetite and do not order too much out of greed. If I am unsure of a dish's serving size, I will order a smaller amount first and add more if not enough, rather than ordering too much at once. Secondly, while eating, I remind myself to finish every grain of rice and every dish in my bowl. Finally, if I genuinely cannot finish, I will ask the staff to help pack it up to take home and enjoy at the next meal, rather than letting it go to waste.",
            example:       '记得有一次，我和家人去一家餐厅庆祝生日，爸爸一时兴致勃勃点了很多菜，结果最后吃不完。我提议把剩下的食物打包带回家，爸爸起初有点不好意思，但妈妈支持了我。第二天，我们把那些打包的食物加热当早餐，味道依然很美味。爸爸笑着说："你说得对，下次我们要适量点菜。"那次经历让我明白，珍惜食物是每个家庭成员都应该实践的美德。',
            exampleEn:     'I remember once going to a restaurant with my family to celebrate a birthday, and Dad got carried away and ordered a lot of food — in the end we could not finish it all. I suggested packing up the remaining food to take home; Dad was initially a little embarrassed, but Mum supported my suggestion. The next day, we heated up the packed food and had it for breakfast — it was still delicious. Dad smiled and said, "You were right — next time we should order the right amount." That experience taught me that cherishing food is a virtue that every family member should practise.',
            link:          '我认为，养成不浪费食物的好习惯，是每一个新加坡人应该具备的素质。在全球粮食紧缺日益严峻的今天，珍惜食物不只是个人的美德，更是我们作为地球公民对世界作出的贡献。粒粒皆辛苦，每一口食物都值得我们细心对待。',
            linkEn:         "I believe that cultivating the good habit of not wasting food is a quality that every Singaporean should possess. In today's world of increasingly severe global food scarcity, cherishing food is not only a personal virtue — it is also a contribution we make to the world as global citizens. Every grain of food comes from hard work, and every mouthful deserves our careful attention.",
          },
        },
        q3: {
          cn: '你认为"光盘行动"在学校里推广有什么意义？',
          en: 'What is the significance of promoting the "Clear Your Plate" campaign in schools?',
          peelAnswer: {
            point:         '我认为在学校推广"光盘行动"具有非常重要的意义，它不仅能有效减少校园内的食物浪费，更能从小培养学生珍惜食物、感恩付出的良好品德。',
            pointEn:       'I believe that promoting the "Clear Your Plate" campaign in schools is of great significance — it not only effectively reduces food waste on campus but also cultivates from young the good character of cherishing food and appreciating the efforts of others.',
            elaboration:   '首先，在实际层面，"光盘行动"能直接减少食堂的食物浪费量，降低垃圾处理的负担，也能为学校节省一定的资源。其次，在教育层面，这个活动让同学们了解到食物的来之不易——从农田到餐桌，每一份食物的背后都有无数人的辛勤付出。当学生们从小就养成了"光盘"的习惯，这种珍惜食物的意识将伴随他们进入社会，成为一种终生的好习惯。此外，"光盘行动"也是环保教育的一部分，因为减少食物浪费能够降低有机废物的产生，对环境保护有着积极的作用。',
            elaborationEn: 'Firstly, on a practical level, the "Clear Your Plate" campaign can directly reduce the amount of food waste in the canteen, lightening the burden of waste disposal and saving certain resources for the school. Secondly, on an educational level, this campaign helps students understand that food is not easily obtained — from the farm to the table, every portion of food involves the hard work of countless people. When students develop the habit of "clearing their plates" from young, this awareness of cherishing food will accompany them into society, becoming a lifelong good habit. In addition, the "Clear Your Plate" campaign is also part of environmental education, because reducing food waste decreases the generation of organic waste, which has a positive impact on environmental protection.',
            example:       '例如，我们学校推行"光盘达人"计划时，每个班级都会记录当月食堂的食物浪费情况。浪费最少的班级会在公告栏上受到表扬，还会获得额外的课外活动时间作为奖励。这个计划推出后，我们班的同学都互相监督，认真把饭菜吃完，食物浪费明显减少了，大家的环保意识也大大提高了。',
            exampleEn:       "For example, when our school implemented the \"Clear Plate Champion\" programme, each class recorded the amount of food waste in the canteen that month. The class with the least waste was praised on the notice board and also received additional co-curricular activity time as a reward. After this programme was introduced, our classmates monitored each other and conscientiously finished their food — food waste decreased noticeably and everyone's environmental awareness increased greatly.",
            link:          '综上所述，"光盘行动"在学校的推广，是培养学生品德和环保意识的有效途径。让学生从小学会珍惜食物、感恩农夫和厨师的辛勤付出，不仅是对个人的教育，更是对整个社会文明素质的提升，值得每一所新加坡学校积极推行。',
            linkEn:          "In conclusion, promoting the \"Clear Your Plate\" campaign in schools is an effective way to cultivate students' character and environmental awareness. Teaching students from young to cherish food and appreciate the hard work of farmers and cooks is not only education for the individual — it is also an elevation of the overall civilised standards of society as a whole, and is well worth active promotion by every school in Singapore.",
          },
        },
      },
      targetKeywords: ['光盘行动', '粒粒皆辛苦', '适量', '珍惜食物', '环保'],
    },
  },
  // ── Personal (p1–p4) ─────────────────────────────────────────
  {
    id: 'p1', yearLabel: '2025 Day 2', themeId: 'personal',
    subThemeCn: '家庭旅游经历', subThemeEn: 'Family Travel Experience', focusSkill: 'Narrative',
    reading: {
      text: '这次学校假期，爸爸建议全家去国外旅游。虽然行程安排得很紧，但我却觉得十分兴奋。在旅途中，我们不仅参观了许多著名的历史景点，还品尝了当地的特色美食。不仅如此，我还主动承担了照顾弟弟的责任。这次旅游让我大开眼界，也让我明白，无论去哪里，最重要的是能与家人共度美好的时光，增强彼此之间的情谊。',
      targetWords: ['建议', '兴奋', '景点', '特色美食', '大开眼界', '情谊', '共度'],
    },
    conversation: {
      storyboardDesc: 'A family planning a holiday trip together. They are looking at travel brochures and packing their suitcases.',
      questions: {
        q1: {
          cn: '根据录像，描述这家人在计划旅游时的过程和心情。',
          en: "Based on the video, describe the family's process and mood while planning their trip.",
          peelAnswer: {
            point:         '录像中，这家人正兴奋地围在一起，翻阅旅游手册和地图，共同规划即将到来的家庭旅游，气氛温馨而充满期待。',
            pointEn:       'In the video, the family was excitedly gathered together, browsing through travel brochures and maps, jointly planning their upcoming family trip in a warm and anticipation-filled atmosphere.',
            elaboration:   '爸爸把几本旅游小册子摊开在桌上，指着不同的景点向家人介绍；妈妈则拿着一张地图，仔细地规划路线；孩子们则眼睛发亮，不时插嘴提出自己想去的地方，还主动帮忙把要带的东西整理成一张清单。整个家庭充满了团结合作的精神，大家都为这次旅行感到兴奋不已。',
            elaborationEn:  "Dad spread several travel brochures on the table, pointing to different attractions and introducing them to the family; Mum held a map and carefully planned the route; the children's eyes lit up as they chimed in from time to time with places they wanted to visit, proactively helping to compile a list of things to bring. The whole family was filled with a spirit of unity and cooperation, everyone tremendously excited about this trip.",
            example:       '例如，录像中有一幕，孩子翻到了一张关于当地美食的介绍页，立刻兴奋地叫道："爸爸！我们一定要去试试这个！"爸爸笑着答应，妈妈也在旅游计划上记了下来。这一幕让我感受到，旅游最美好的部分，有时候不只是旅途本身，而是一家人坐在一起，满怀期待地计划未来的那份幸福时光。',
            exampleEn:     'For example, in one scene in the video, the child turned to a page about local food and excitedly called out, "Dad! We must try this!" Dad smiled and agreed, and Mum noted it down in the travel plan. This scene made me feel that the most beautiful part of travelling is sometimes not just the journey itself, but the happy time spent as a family sitting together and planning the future with full anticipation.',
            link:          '录像中这家人共同规划旅游的画面，让我深刻体会到，家庭旅游不只是去不同的地方游览，更是一个增进亲子关系、共同创造美好回忆的珍贵机会。在快节奏的新加坡，能有这样的家庭时光，是非常宝贵的。',
            linkEn:        'The scene of this family planning their trip together in the video made me deeply appreciate that family travel is not just about visiting different places — it is a precious opportunity to strengthen the parent-child relationship and create wonderful memories together. In fast-paced Singapore, having this kind of family time together is truly very precious.',
          },
        },
        q2: {
          cn: '分享一个你和家人一起进行过的难忘活动。',
          en: 'Share a memorable activity you did with your family.',
          peelAnswer: {
            point:         '在我和家人一起进行过的活动中，令我最难忘的，是去年学校假期时，全家一起到新加坡植物园进行的一次大自然探索之旅。',
            pointEn:       'Among all the activities I have done with my family, the most unforgettable was a nature exploration trip that our whole family made to the Singapore Botanic Gardens during the school holidays last year.',
            elaboration:   '那天，我们带了自制的三明治和饮料，在植物园里的草地上野餐。爸爸给我们介绍各种奇特的植物，妈妈拿着相机为我们拍照留念，弟弟则兴奋地追着蝴蝶跑。我们还一起参观了胡姬花园，被各种颜色鲜艳的兰花深深吸引。整个下午，我们没有看手机，只是专心地享受彼此的陪伴和大自然的美好。',
            elaborationEn:  "That day, we brought homemade sandwiches and drinks, and had a picnic on the grass in the Botanic Gardens. Dad introduced us to various exotic plants, Mum took photos of us to preserve the memories, and my younger brother excitedly chased after butterflies. We also visited the orchid garden together and were deeply captivated by the many brightly-coloured orchids. Throughout the entire afternoon, none of us looked at our phones — we simply focused on enjoying each other's company and the beauty of nature.",
            example:       '令我印象最深刻的是，爸爸找到了一棵非常高大、树根暴露在地面上的雨树，他带着我和弟弟坐在树根上，讲述了这棵树已经生长了超过一百年的故事。那一刻，我第一次感受到了大自然的壮阔与神奇，也感受到了在家人身边的幸福与安心。那次出游成了我们家至今还会提起的美好回忆。',
            exampleEn:     'The moment that left the deepest impression on me was when Dad found a very tall rain tree with roots exposed above the ground. He sat with me and my younger brother on the roots and told us the story of how this tree had been growing for over a hundred years. In that moment, I felt for the first time the grandeur and wonder of nature, and also felt the happiness and security of being with my family. That outing became a wonderful memory that our family still talks about to this day.',
            link:          '这次家庭活动让我深刻体会到，最珍贵的家庭时光，往往不需要花费太多金钱，只需要大家放下手机和忙碌，真心地陪伴彼此。这种其乐融融的天伦之乐，正是我们在高度都市化的新加坡中，最需要珍惜和保护的东西。',
            linkEn:        'This family activity made me deeply appreciate that the most precious family time often does not require a great deal of money — it simply requires everyone to put down their phones and busyness, and wholeheartedly accompany each other. This joyful family happiness is precisely what we most need to cherish and protect in highly urbanised Singapore.',
          },
        },
        q3: {
          cn: '在快节奏的新加坡，你认为家庭团聚对孩子的成长有什么重要性？',
          en: "In fast-paced Singapore, what importance do you think family gatherings have for a child's growth?",
          peelAnswer: {
            point:         '我认为在快节奏的新加坡，家庭团聚对孩子的成长至关重要，因为它能给孩子提供爱、安全感和正确的价值观引导。',
            pointEn:        "I believe that in fast-paced Singapore, family gatherings are crucial for a child's growth, as they provide children with love, a sense of security, and proper guidance in values.",
            elaboration:   '许多新加坡的父母工作繁忙，孩子放学后可能在补习中心或托儿所度过大部分时间。如果家庭之间缺乏共同的活动和交流，孩子可能会感到孤独、缺乏归属感，在成长过程中也可能因为缺乏父母的引导而走弯路。相反，定期的家庭团聚——无论是一起用餐、看电影还是出游——都能让孩子感受到被爱和被重视，也能让父母了解孩子的想法，及时给予正确的引导。',
            elaborationEn:  "Many Singapore parents are busy with work, and children may spend most of their time after school at tuition centres or childcare facilities. If families lack shared activities and communication, children may feel lonely and lack a sense of belonging, and may also go astray during their growth due to insufficient parental guidance. In contrast, regular family gatherings — whether eating together, watching a movie, or going on outings — allow children to feel loved and valued, and also allow parents to understand their children's thoughts and provide timely and proper guidance.",
            example:       '例如，研究表明，与家人一起吃晚饭的孩子，往往在学业上表现更好，情绪也更加稳定，因为家庭用餐时间不仅是吃饭，更是家人交流、分享一天经历的重要时刻。在新加坡，许多学校也鼓励家长参与孩子的学习，举办家长日和亲子活动，正是为了加强这种亲子纽带。',
            exampleEn:      "For example, research shows that children who have dinner with their families tend to perform better academically and are emotionally more stable, because family mealtimes are not merely about eating — they are an important opportunity for family members to communicate and share the experiences of their day. In Singapore, many schools also encourage parents to participate in their children's learning by holding Parent-Teacher Days and parent-child activities, precisely to strengthen this parent-child bond.",
            link:          '因此，我认为即使在忙碌的新加坡生活中，父母也应该有意识地为家庭团聚留出时间。这不只是家庭幸福的源泉，更是孩子健康成长、建立正确价值观最重要的基础。家人的陪伴，是任何金钱或物质都无法取代的宝贵礼物。',
            linkEn:         "Therefore, I believe that even amidst the busy lifestyle of Singapore, parents should consciously set aside time for family gatherings. This is not only the source of family happiness, but also the most important foundation for a child's healthy growth and development of correct values. Family companionship is a precious gift that no amount of money or material possessions can replace.",
          },
        },
      },
      targetKeywords: ['亲子关系', '沟通', '其乐融融', '天伦之乐', '美好回忆'],
    },
  },
  {
    id: 'p2', yearLabel: '2024 Day 1', themeId: 'personal',
    subThemeCn: '阅读好习惯', subThemeEn: 'Good Reading Habits', focusSkill: 'Opinion',
    reading: {
      text: '良好的阅读习惯是获取知识的好方法。通过书本，我们可以足不出户就了解到世界的奇妙。无论是十分有趣的小说，还是充满道理的散文，都能丰富我们的精神世界。我每天都会留出半小时来静心阅读。这不仅让我的华文水平进步了，还让我学会了独立思考。我希望每个同学都能爱上阅读，在书海中寻找自己心爱的宝藏。',
      targetWords: ['良好', '习惯', '奇妙', '道理', '独立思考', '宝藏', '精神世界'],
    },
    conversation: {
      storyboardDesc: 'A child reading a book under a blanket with a flashlight. His parents enter and encourage him to read in better lighting.',
      questions: {
        q1: {
          cn: '描述录像中关于阅读习惯的正确与错误做法。',
          en: 'Describe the correct and incorrect practices regarding reading habits in the video.',
          peelAnswer: {
            point:         '录像中展示了截然不同的阅读习惯——一种正确、对眼睛和学习都有益；另一种则存在明显的问题，可能损害视力和健康。',
            pointEn:       'The video depicted two starkly different reading habits — one correct and beneficial for the eyes and learning; the other with obvious problems that could damage eyesight and health.',
            elaboration:   '录像中，一名孩子在光线不足的房间里，躲在被窝里用手电筒看书，姿势弯曲，眼睛距离书本极近，这些都是非常不好的阅读习惯，长期如此容易导致近视或眼睛疲劳。当父母进房后，他们温柔地引导孩子坐到书桌旁，开亮台灯，保持正确的阅读姿势——坐直、书本与眼睛保持适当距离，并提醒孩子每隔一段时间就要让眼睛休息。',
            elaborationEn: 'In the video, a child was reading under a duvet in a dimly-lit room using a torchlight — hunched over with eyes very close to the book. These are very poor reading habits that can easily lead to myopia or eye strain over time. When the parents entered the room, they gently guided the child to sit at the desk, turned on the study lamp, and adopted the correct reading posture — sitting upright with the book at an appropriate distance from the eyes — while reminding the child to let their eyes rest at regular intervals.',
            example:       '例如，录像中爸爸告诉孩子："每读二十分钟，就要抬头看看窗外二十秒，让眼睛休息一下，这是保护视力的好方法。"孩子点点头，认真地记住了这个建议。这一幕让我联想到新加坡推行的"20-20-20护眼法则"，也让我反思自己平时的阅读习惯是否足够健康。',
            exampleEn:       "For example, in the video, Dad told the child, \"Every twenty minutes of reading, lift your head and look out the window for twenty seconds to let your eyes rest — this is a good way to protect your eyesight.\" The child nodded and carefully memorised this advice. This scene reminded me of Singapore's promoted \"20-20-20 Eye Care Rule\", and also made me reflect on whether my own reading habits are sufficiently healthy.",
            link:          '录像中父母的正确引导，让我明白，良好的阅读习惯不只关乎学业成绩，更关乎我们的身体健康。在新加坡，青少年近视率居高不下，因此从小培养正确的阅读姿势和用眼卫生习惯，是每一个学生和家长都应该重视的事情。',
            linkEn:        'The correct guidance from the parents in the video made me understand that good reading habits are not only about academic performance — they are also about our physical health. In Singapore, the rate of myopia among young people remains high, so cultivating correct reading posture and eye care habits from young is something that every student and parent should take seriously.',
          },
        },
        q2: {
          cn: '你喜欢阅读吗？你最喜欢哪一类的书籍？为什么？',
          en: 'Do you like reading? What kind of books do you like most? Why?',
          peelAnswer: {
            point:         '是的，我非常喜欢阅读，其中我最喜欢的是科学探索类和历史故事类的书籍，因为它们能拓展我的视野，让我了解世界的奥秘。',
            pointEn:       'Yes, I love reading very much. Among all types, I enjoy science exploration and historical story books most, because they broaden my horizons and allow me to understand the mysteries of the world.',
            elaboration:   '科学探索类书籍让我对宇宙、生物和自然界的奇妙现象充满了好奇和探究的欲望。每次读到关于宇宙的知识，我都觉得自己变得更加渺小，同时也对大自然的伟大更加敬畏。历史故事书则让我了解到不同时代的人物和事件，帮助我从历史中汲取智慧，更好地理解现在的世界。这两类书籍，都让我在阅读中感受到知识的力量，也培养了我独立思考的能力。',
            elaborationEn: 'Science exploration books fill me with curiosity and a desire to explore the wonderful phenomena of the universe, living things, and the natural world. Every time I read about the cosmos, I feel myself becoming smaller, while also developing a deeper awe for the greatness of nature. Historical story books allow me to understand characters and events from different eras, helping me draw wisdom from history and better understand the present world. Both types of books allow me to experience the power of knowledge through reading, and have also cultivated my ability to think independently.',
            example:       '记得有一次，我读了一本关于新加坡建国历史的书，书中详细描述了我们的先辈如何在资源匮乏的情况下，凭借坚韧不拔的精神，将一个小岛发展成为繁荣的现代国家。读完后，我对新加坡产生了更深的情感，也更加珍惜现在来之不易的幸福生活。那本书让我明白，阅读不只是学知识，更是在与历史对话，感受先人的智慧和勇气。',
            exampleEn:      "I remember once reading a book about Singapore's founding history. It described in detail how our forebears, despite scarce resources, developed a small island into a prosperous modern nation through indomitable spirit. After finishing the book, I developed a deeper emotional connection with Singapore and came to cherish even more the hard-won happiness of our present lives. That book made me understand that reading is not only about acquiring knowledge — it is also a conversation with history, experiencing the wisdom and courage of our predecessors.",
            link:          '我认为，无论是哪一类书籍，阅读的最大价值在于它能开阔我们的精神世界，让我们在有限的人生中，体验无限的可能。在数字化时代，让更多新加坡的孩子重拾对阅读的热爱，是非常值得鼓励的事情。',
            linkEn:        'I believe that regardless of the type of book, the greatest value of reading lies in its ability to broaden our inner world, allowing us to experience unlimited possibilities within the finite span of our lives. In the digital age, encouraging more Singapore children to rediscover their love of reading is something very much worth promoting.',
          },
        },
        q3: {
          cn: '由于电子产品的普及，你认为如何能让更多青少年重拾阅读纸质书的兴趣？',
          en: 'Given the prevalence of electronic devices, how can we make more teenagers regain interest in reading physical books?',
          peelAnswer: {
            point:         '我认为，要让更多青少年重拾阅读纸质书的兴趣，需要学校、家庭和社会三方共同努力，创造有利于阅读的环境和氛围。',
            pointEn:       'I believe that to encourage more teenagers to regain interest in reading physical books requires the joint efforts of schools, families and society to create an environment and atmosphere conducive to reading.',
            elaboration:   '首先，学校可以定期组织读书分享会，让同学们介绍自己读过的好书，通过同龄人的推荐来激发阅读兴趣；也可以设立班级图书角，让书籍随手可取。其次，家长可以以身作则，在家里保持阅读的习惯，与孩子一起阅读，营造良好的家庭阅读氛围。此外，新加坡公共图书馆也定期举办各种读书活动和故事会，是鼓励青少年接触书籍的好平台。',
            elaborationEn:  "Firstly, schools can regularly organise book-sharing sessions where students introduce good books they have read, sparking reading interest through peer recommendations; class reading corners can also be set up so that books are always within easy reach. Secondly, parents can lead by example by maintaining their own reading habits at home, reading together with their children and creating a positive family reading atmosphere. Furthermore, Singapore's public libraries regularly hold various reading activities and storytelling sessions, providing an excellent platform for encouraging teenagers to engage with books.",
            example:       '例如，新加坡国家图书馆管理局每年都会举办"阅读节"，通过有趣的活动、亲子阅读工作坊和读书挑战赛来推广阅读文化。许多参与过这类活动的孩子，都表示因此爱上了阅读，开始主动向父母要求去图书馆借书。这说明，有趣的体验式活动是引导青少年爱上阅读的有效途径。',
            exampleEn:       "For example, Singapore's National Library Board holds an annual \"Read! Festival\", promoting reading culture through interesting activities, parent-child reading workshops, and reading challenge competitions. Many children who have participated in these activities have said they fell in love with reading as a result and began proactively asking their parents to take them to the library to borrow books. This shows that engaging, experiential activities are an effective way to guide teenagers to fall in love with reading.",
            link:          '我相信，在这个数字化的时代，纸质书阅读所带来的专注感、想象力和深度思考，是任何电子屏幕都无法取代的。只要我们共同创造一个鼓励阅读的环境，让书籍重新成为青少年生活中的好伙伴，阅读的力量就一定能在新加坡的下一代中延续下去。',
            linkEn:         "I believe that in this digital age, the sense of focus, imagination, and depth of thinking that physical book reading brings is something no electronic screen can replace. As long as we collectively create an environment that encourages reading and allows books to once again become a good companion in teenagers' lives, the power of reading will surely continue on in the next generation of Singapore.",
          },
        },
      },
      targetKeywords: ['博览群书', '保护视力', '知识就是力量', '安静', '习惯'],
    },
  },
  {
    id: 'p3', yearLabel: '2021 Day 2', themeId: 'personal',
    subThemeCn: '周末休闲活动', subThemeEn: 'Weekend Leisure', focusSkill: 'Phonetic',
    reading: {
      text: '经过一周的紧张学习，我总是期待周末的到来。周六上午，我通常会跟好友一起去篮球场打球，享受运动的快乐。下午，我会帮妈妈做家务，也会花时间看自己喜爱的书。晚上，我喜欢和家人一起看电视节目，大家说说笑笑，非常温馨。这种有规律的休息方式，让我在新的一周里精神充沛。',
      targetWords: ['紧张', '期待', '篮球场', '家务', '温馨', '有规律', '精神充沛'],
    },
    conversation: {
      storyboardDesc: 'A school tuckshop stall serving healthy meals with brown rice and fruit. A group of students is choosing these options.',
      questions: {
        q1: {
          cn: '描述录像中同学们在食堂里选择健康饮食的情景。',
          en: 'Describe the scene of students choosing healthy food in the canteen in the video.',
          peelAnswer: {
            point:         '录像中，同学们在学校食堂里积极地选择健康均衡的饮食，展现出良好的饮食意识和自律精神。',
            pointEn:       'In the video, students at the school canteen actively made healthy and balanced food choices, demonstrating good dietary awareness and self-discipline.',
            elaboration:   '食堂里，一个提供糙米饭和蔬果的健康饮食档口前排起了长龙。同学们有序地排队，认真地挑选自己喜欢的蔬菜和瘦肉菜肴，而不是选择油炸食品或高糖饮料。有几名同学还拒绝了档主额外提供的薯条，说要保持均衡饮食。这种自律的行为，让食堂的阿姨和在旁观察的老师都露出了赞许的笑容。',
            elaborationEn: 'In the canteen, a long queue had formed in front of a healthy eating stall serving brown rice and fresh vegetables and fruit. Students queued in an orderly manner, carefully selecting their preferred vegetables and lean meat dishes rather than choosing fried foods or sugary drinks. Several students even declined additional fries offered by the stall, saying they wanted to maintain a balanced diet. This self-disciplined behaviour drew approving smiles from the canteen auntie and the teacher observing nearby.',
            example:       '例如，录像中有一名同学在选菜时，特意挑了三种不同颜色的蔬菜——绿色的菠菜、橙色的胡萝卜和红色的番茄——旁边的同学好奇地问他为什么，他笑着说："妈妈告诉我，饭盘里颜色越多，营养就越均衡！"这一幕让我既觉得有趣，又深受启发，明白了健康饮食原来可以这么简单地理解和实践。',
            exampleEn:     'For example, in the video, one student deliberately chose three different-coloured vegetables when selecting dishes — green spinach, orange carrot, and red tomato. The classmate beside him asked curiously why, and the student smiled and replied, "Mum told me, the more colours on your plate, the more balanced the nutrition!" This scene both amused me and greatly inspired me, showing me that healthy eating can be understood and practised in such a simple way.',
            link:          '录像中同学们的健康饮食选择，体现了新加坡推广的"我的健康餐盘"理念。从小养成均衡饮食的习惯，不仅能让我们精神充沛、专注学习，更是维持一生健康的基础。学校食堂提供健康选择，同学们也要主动做出正确的饮食决定，才能共同建设一个更健康的校园环境。',
            linkEn:          "The healthy food choices made by students in the video embody Singapore's promoted \"My Healthy Plate\" concept. Developing the habit of balanced eating from young not only keeps us full of energy and focused on our studies, but is also the foundation of lifelong health. With the school canteen providing healthy options, students must also proactively make the right dietary choices to collectively build a healthier school environment.",
          },
        },
        q2: {
          cn: '在日常生活中，你和家人是如何保持均衡饮食的？',
          en: 'In your daily life, how do you and your family maintain a balanced diet?',
          peelAnswer: {
            point:         '在日常生活中，我和家人通过合理搭配食物、减少外食次数和鼓励多喝水等方式，共同努力保持均衡健康的饮食习惯。',
            pointEn:       'In our daily lives, my family and I collectively strive to maintain balanced and healthy eating habits by carefully combining food types, reducing how often we eat out, and encouraging more water intake.',
            elaboration:   '妈妈通常会在每周末提前规划一周的餐单，确保每天的饮食包含适量的碳水化合物、蛋白质、蔬菜和水果。在家里用餐时，我们的饭桌上至少会有两到三道蔬菜和一道肉类。妈妈也尽量少用油盐，多采用蒸煮的方式烹饪，以减少不必要的脂肪摄入。此外，我们也会注意减少含糖饮料的摄取，以白开水或无糖豆浆代替。',
            elaborationEn:  "Mum usually plans the weekly menu in advance each weekend, ensuring that each day's meals include appropriate amounts of carbohydrates, protein, vegetables and fruit. When eating at home, our table always has at least two to three vegetable dishes and one meat dish. Mum also uses minimal oil and salt, preferring steaming and boiling methods to reduce unnecessary fat intake. In addition, we also make a point of reducing our consumption of sugary drinks, substituting plain water or unsweetened soy milk.",
            example:       '记得有一次，我们全家去美食广场吃饭，我本来很想点炸鸡套餐，但妈妈建议我改点蒸鱼饭，并解释说炸鸡的脂肪含量太高，会影响身体健康。起初我有些不情愿，但妈妈说："今天吃得健康，就能有精神打球、做你喜欢的事。"那句话说服了我。后来我发现蒸鱼饭其实也很美味，而且那天下午打篮球时，我真的感觉比平时更有精力。',
            exampleEn:       "I remember once we went to a food court for dinner, and I really wanted to order a fried chicken set, but Mum suggested I switch to steamed fish rice, explaining that fried chicken has too high a fat content and would affect my health. I was a little reluctant at first, but Mum said, \"Eating healthily today means you'll have the energy to play ball and do the things you enjoy.\" Those words convinced me. I later found that the steamed fish rice was actually very delicious, and that afternoon when I played basketball, I genuinely felt more energetic than usual.",
            link:          '我认为，均衡饮食是保持健康的基础，也是我们作为新加坡学生应该从小学会的生活技能。只有吃得健康，我们才能有充足的体力和精力去学习和成长，迎接未来的各种挑战。',
            linkEn:        'I believe that a balanced diet is the foundation of good health, and is also a life skill that Singapore students should learn from young. Only by eating healthily can we have sufficient physical and mental energy to learn and grow, and face the various challenges of the future.',
          },
        },
        q3: {
          cn: '你认为学校应该如何通过活动来提高学生的健康意识？',
          en: "How do you think schools should raise students' health awareness through activities?",
          peelAnswer: {
            point:         '我认为学校应该通过多样化、有趣的实践活动，而不只是课堂讲授，来切实提高学生的健康意识，让健康理念真正融入学生的日常生活。',
            pointEn:        "I believe schools should raise students' health awareness through diverse and engaging practical activities — not just classroom teaching — so that healthy concepts truly become integrated into students' daily lives.",
            elaboration:   '首先，学校可以定期举办健康饮食节，邀请营养师来为学生和家长讲解均衡饮食的知识，还可以让学生亲手制作健康小食，增加趣味性。其次，学校可以增加体育课和课外活动的多样性，让学生接触不同类型的运动，找到自己真正喜欢和愿意长期坚持的体育项目。此外，学校还可以在课程中加入冥想或正念练习，帮助学生学会管理压力，照顾心理健康。',
            elaborationEn: 'Firstly, schools can regularly hold healthy eating festivals, inviting nutritionists to teach students and parents about the knowledge of balanced diet, and also letting students make healthy snacks with their own hands to add an element of fun. Secondly, schools can increase the variety of PE lessons and co-curricular activities, exposing students to different types of exercise so they can find physical activities they genuinely enjoy and are willing to sustain long-term. In addition, schools can also incorporate meditation or mindfulness practices into the curriculum to help students learn to manage stress and care for their mental health.',
            example:       '例如，我们学校每年都会举办"健康生活周"，在这一周里，食堂只供应健康食品，体育馆会开放给所有同学免费使用，还会有各种运动体验活动，如弓箭射击、攀岩和跳绳比赛。许多平时不爱运动的同学，在这一周里都找到了自己喜欢的运动，之后也开始主动参加课外活动。这说明，有趣的活动是激发学生健康意识最有效的方式。',
            exampleEn:       "For example, our school holds an annual \"Healthy Lifestyle Week\". During this week, the canteen only serves healthy food, the sports hall is open free of charge to all students, and there are various sports experience activities such as archery, rock climbing and skipping rope competitions. Many students who usually did not enjoy sports found activities they liked during this week and subsequently began proactively joining co-curricular activities. This shows that engaging activities are the most effective way to spark students' health awareness.",
            link:          '总而言之，学校在学生健康教育中扮演着举足轻重的角色。通过实践性强、参与度高的健康活动，学校不仅能让学生掌握健康知识，更能帮助他们养成终生受益的健康生活方式，为国家培养出一代充满活力、身心健康的新加坡公民。',
            linkEn:         "In conclusion, schools play a pivotal role in students' health education. Through highly practical and engaging health activities, schools can not only help students acquire health knowledge, but also help them develop lifelong healthy lifestyles, nurturing for the nation a generation of vibrant, physically and mentally healthy Singapore citizens.",
          },
        },
      },
      targetKeywords: ['有规律', '精神充沛', '温馨', '家务', '放松'],
    },
  },
  {
    id: 'p4', yearLabel: '2015 Day 1', themeId: 'personal',
    subThemeCn: '写日记的习惯', subThemeEn: 'Diary Writing Habit', focusSkill: 'Vocabulary',
    reading: {
      text: '每天睡觉前，我都会花五分钟写下当天的感受和经历。这个小习惯是老师建议我养成的，它让我有机会反省自己。通过这些记录，我发现自己逐渐变得更加成熟和懂事。日记不仅是字迹的积累，更是我成长路上珍贵的回忆。我希望能一直坚持下去，记录生活的美好瞬间。',
      targetWords: ['感受', '经历', '反省', '成熟', '懂事', '珍贵', '瞬间'],
    },
    conversation: {
      storyboardDesc: 'A child tidying their own room without being told. The parents look happy and give a thumbs up.',
      questions: {
        q1: {
          cn: '录像中描述了小孩如何管理自己的房间和私人物品？',
          en: 'How does the child in the video manage their room and personal belongings?',
          peelAnswer: {
            point:         '录像中，那名孩子展现出了超乎年龄的自律和整洁习惯，主动管理好自己的房间和私人物品，令父母感到十分欣慰。',
            pointEn:       'In the video, the child displayed a level of self-discipline and tidiness beyond their years, proactively managing their room and personal belongings in a way that made their parents very proud.',
            elaboration:   '录像中的孩子，在没有父母提醒的情况下，主动将书包里的课本和作业本整齐地放回书架，把散乱在地上的玩具一一归位，还把书桌上的文具理得整整齐齐。做完这一切后，他打开日记本，认真地写下了当天的感受和计划。父母悄悄推开房门，看到这一切，相视而笑，竖起大拇指表示赞许。',
            elaborationEn:  "The child in the video, without any reminders from their parents, proactively placed the textbooks and exercise books from their school bag neatly back onto the shelf, tidied up the toys scattered on the floor one by one, and arranged the stationery on the desk neatly. After completing all this, they opened their diary and carefully wrote down the day's feelings and plans. The parents quietly pushed open the bedroom door, and seeing all this, looked at each other with a smile and gave a thumbs-up of approval.",
            example:       '例如，录像中那个孩子在整理完房间后，还特意把第二天需要用的课本提前放进书包，并在书桌上贴了一张小便条，提醒自己明天要交的作业。这种有条不紊的安排方式，不仅体现了他的自理能力，也展示了他认真负责的学习态度，是非常值得我们学习的好习惯。',
            exampleEn:      "For example, the child in the video, after tidying their room, also proactively placed the next day's textbooks into the school bag in advance, and stuck a small note on the desk to remind themselves about the homework to be submitted the next day. This well-organised approach not only demonstrates their ability to take care of themselves, but also shows their conscientious and responsible attitude towards learning — a very admirable habit worth learning from.",
            link:          '录像中孩子的自律行为提醒我们，管理好自己的空间和物品，是一种非常重要的生活能力。从小学会整理和规划，不只能让我们的学习更有效率，更能培养出面对未来挑战时所需要的责任感和条理性。',
            linkEn:         "The child's self-disciplined behaviour in the video reminds us that managing one's space and belongings is a very important life skill. Learning to tidy up and plan from young not only makes our learning more efficient, but also cultivates the sense of responsibility and organisation we will need when facing future challenges.",
          },
        },
        q2: {
          cn: '除了收拾房间，你还会做哪些家务来分担父母的压力？',
          en: "Besides tidying your room, what other chores do you do to ease your parents' stress?",
          peelAnswer: {
            point:         '除了收拾房间，我还会主动帮忙洗碗、拖地、晾衣服，以及照顾弟弟，这些都是我在家里分担家务的方式。',
            pointEn:       "Besides tidying my room, I also proactively help with washing dishes, mopping the floor, hanging out laundry, and looking after my younger brother — these are the ways I share the household chores at home.",
            elaboration:   '爸爸妈妈每天上班很辛苦，回到家还要照顾孩子和处理家务，着实不易。我认为，作为家庭的一份子，帮忙分担家务是理所当然的事。不仅如此，做家务也能让我学会自理能力，了解生活的不易，从而更加感恩父母的辛勤付出。我会在放学后先完成作业，再主动帮忙做力所能及的家务，而不是等父母吩咐。',
            elaborationEn: "Mum and Dad work hard every day, and returning home to still have to look after the children and deal with household chores is truly not easy. I believe that as a member of the family, helping to share the household chores is a matter of course. Moreover, doing chores also allows me to learn self-care skills, understand the hardships of life, and thereby appreciate my parents' hard work all the more. After school, I complete my homework first and then proactively help with whatever chores I can, rather than waiting to be asked.",
            example:       '记得有一次，妈妈因为感冒不舒服，躺在床上休息。我和弟弟商量好，一起把家里的地板拖了一遍，还把当天的碗碟洗干净。妈妈起来看到干净的家，感动地说："你们真的长大了，妈妈很骄傲。"那一刻，我感到无比满足，也更加明白，家务是全家人共同的责任，不只是爸妈的事。',
            exampleEn:       "I remember once Mum was feeling unwell with a cold and was lying in bed resting. My younger brother and I discussed it and together mopped all the floors in the house, and also washed the day's dishes clean. When Mum got up and saw the clean house, she was moved and said, \"You have truly grown up — Mum is very proud.\" In that moment, I felt immensely satisfied, and understood even more that household chores are the shared responsibility of the whole family, not just Mum and Dad's job.",
            link:          '我认为，从小学会帮忙做家务，不只是减轻父母的负担，更是培养责任感、感恩心和自理能力的重要方式。这些生活技能，将在我们长大后，成为面对独立生活时最宝贵的基础。',
            linkEn:        'I believe that learning to help with household chores from young is not only about reducing the burden on our parents — it is also an important way to cultivate a sense of responsibility, gratitude, and self-care ability. These life skills will become the most valuable foundation when we grow up and face independent living.',
          },
        },
        q3: {
          cn: '你认为从小培养自理能力对孩子的未来有什么好处？',
          en: 'What are the benefits of fostering self-care skills in children from a young age?',
          peelAnswer: {
            point:         '我认为从小培养自理能力，对孩子的未来有着深远的好处，因为它能帮助孩子发展出独立、负责任和有条理的良好品格。',
            pointEn:        "I believe that fostering self-care skills from a young age has far-reaching benefits for a child's future, as it helps children develop the good character of being independent, responsible, and organised.",
            elaboration:   '在现代社会，越来越多的孩子因为父母过度保护而缺乏基本的自理能力，导致在离家求学或工作时手足无措。相反，从小学会整理物品、管理时间、处理基本生活事务的孩子，在面对新环境时往往能更快地适应和独立生活。此外，自理能力也能培养孩子的责任感——当孩子习惯为自己的空间和物品负责时，他们也更容易学会为自己的行为和决定负责。',
            elaborationEn:  "In modern society, an increasing number of children lack basic self-care skills due to overprotective parenting, leaving them helpless when they leave home to study or work. In contrast, children who learn from young to tidy their belongings, manage their time, and handle basic daily matters tend to adapt and live independently much more quickly when facing new environments. In addition, self-care skills also cultivate a child's sense of responsibility — when children are in the habit of taking responsibility for their own space and belongings, they also more readily learn to take responsibility for their own behaviour and decisions.",
            example:       '例如，在新加坡，许多小学会在生活教育课中教导学生基本的家务技能，如折叠衣物、简单的烹饪和整理书包。研究表明，参与这类课程的学生，在专注力、时间管理和解决问题的能力上，都有明显的进步。这充分证明了，自理能力的培养，不只是生活上的训练，更是全面发展的重要一环。',
            exampleEn:     'For example, in Singapore, many primary schools teach students basic household skills in life education lessons, such as folding clothes, simple cooking, and organising their school bags. Research shows that students who participate in such programmes make noticeable improvements in concentration, time management, and problem-solving ability. This fully demonstrates that cultivating self-care skills is not merely practical training for life, but an important component of holistic development.',
            link:          '总而言之，从小培养自理能力，是给孩子最好的礼物之一。这种能力将伴随孩子一生，让他们在成长的每一个阶段，都能自信地面对挑战，以坚强、独立和负责任的姿态走向未来。',
            linkEn:        'In conclusion, cultivating self-care skills from a young age is one of the finest gifts we can give a child. This ability will accompany them throughout their lives, allowing them at every stage of growth to face challenges with confidence, moving towards the future with strength, independence and responsibility.',
          },
        },
      },
      targetKeywords: ['自动自觉', '分担家务', '自理能力', '整洁', '懂事'],
    },
  },
  // ── Safety (a1–a4) ───────────────────────────────────────────
  {
    id: 'a1', yearLabel: '2020 Day 2', themeId: 'safety',
    subThemeCn: '交通安全意识', subThemeEn: 'Road Safety Awareness', focusSkill: 'Narrative',
    reading: {
      text: '上周末，妈妈带我去超市购物。到了交通灯处，虚线亮起，大家都停下来耐心等待。突然，一辆摩托车闯红灯飞快地冲过十字路口，几乎撞倒一位正在过马路的老人。幸好这位老人反应迅速，才逃过一劫。这件事让我明白，遵守交通规则不仅是保护自己，也是尊重他人生命的表现。',
      targetWords: ['交通灯', '虚线', '闯红灯', '十字路口', '逃过一劫', '遵守', '交通规则'],
    },
    conversation: {
      storyboardDesc: 'A student crossing the road while wearing headphones and looking at their phone. A car is approaching and the driver is honking.',
      questions: {
        q1: {
          cn: '描述录像中发生的危险马路行为。',
          en: 'Describe the dangerous road behaviour shown in the video.',
          peelAnswer: {
            point:         '录像中，一名小学生在过马路时表现出令人担忧的危险行为，引发了一场有可能造成严重伤亡的险情。',
            pointEn:       'In the video, a primary school student displayed worrying and dangerous behaviour while crossing the road, triggering a situation that could have resulted in serious casualties.',
            elaboration:   '只见那名同学戴着耳机，低着头专心盯着手中的手机，完全没有留意四周的环境，径直走上了斑马线。与此同时，一辆迎面驶来的轿车见状立刻紧急刹车，并大声鸣笛警示，险些酿成意外。那名同学被响亮的喇叭声吓得猛地抬起头来，才意识到自己置身于多么危险的处境，脸上顿时露出惊慌失措的神情。',
            elaborationEn: 'The student was wearing earphones and looking down intently at the phone in his hand, completely unaware of his surroundings as he stepped directly onto the zebra crossing. At the same time, an oncoming car immediately braked hard and sounded its horn loudly to warn him — narrowly avoiding an accident. The student was startled by the loud honk and suddenly lifted his head, only then realising the extremely dangerous situation he had placed himself in, his face instantly showing a look of panic and alarm.',
            example:       '例如，录像中那名同学戴着耳机，即便汽车已经鸣笛示警，他最初也完全没有察觉。这正说明了在过马路时使用手机或耳机的致命危险——一旦我们的注意力被分散，就会大大降低对周围环境的感知能力，后果不堪设想。在新加坡交通繁忙的路段，这种疏忽大意的行为随时可能酿成无法挽回的悲剧。',
            exampleEn:      "For example, the student in the video was wearing earphones, and even when the car had already sounded its horn to warn him, he initially did not notice at all. This perfectly illustrates the deadly danger of using a phone or wearing earphones while crossing the road — once our attention is distracted, our awareness of the surrounding environment is greatly diminished, with potentially devastating consequences. On Singapore's busy roads, such careless behaviour can at any moment lead to an irreversible tragedy.",
            link:          '这段录像深刻地提醒我们，过马路时手机和耳机是最大的隐患。遵守交通规则、保持专注，不只是对自己生命的负责，更是对司机和其他行人的尊重。我们每一个人都应该养成"停、看、听"的好习惯，确保安全穿越马路。',
            linkEn:        'This video profoundly reminds us that phones and earphones are the greatest hazards when crossing the road. Obeying traffic rules and remaining alert is not only a responsibility to our own lives, but also a form of respect for drivers and other pedestrians. Each one of us should cultivate the good habit of "Stop, Look and Listen" to ensure safe road crossing.',
          },
        },
        q2: {
          cn: '如果你看到同学在过马路时玩手机，你会怎么做？',
          en: 'What would you do if you saw a classmate playing with their phone while crossing the road?',
          peelAnswer: {
            point:         '如果我看到同学在过马路时玩手机，我会立刻上前劝阻，因为朋友之间有责任互相关心和保护彼此的安全。',
            pointEn:        "If I saw a classmate playing with their phone while crossing the road, I would immediately step forward to dissuade them, because friends have a responsibility to care for each other and protect one another's safety.",
            elaboration:   '马路是危险的地方，司机有时候反应时间非常有限，即使一秒钟的疏忽也可能造成无法挽回的意外。如果我保持沉默，任由同学继续这个危险的行为，万一他因此受伤，我也会深感内疚。因此，我会选择以友善、关心的方式提醒他，而不是袖手旁观，因为真正的朋友应该敢于说出对的话。',
            elaborationEn: 'Roads are dangerous places, and drivers sometimes have very limited reaction time — even one second of carelessness can result in an irreversible accident. If I remained silent and allowed my classmate to continue this dangerous behaviour, and he were to be injured as a result, I would feel deeply guilty. Therefore, I would choose to remind him in a friendly and caring manner rather than standing by and doing nothing, because true friends should have the courage to say what is right.',
            example:       '例如，我会轻拍那名同学的肩膀，微笑着说："嘿，等过了马路再看手机吧，这样比较安全。"如果他觉得无所谓，我会更认真地告诉他，新加坡每年都有不少行人因为过马路时分心而受伤，希望他不要成为其中的一个。我相信，用真诚和关心的态度来劝告，比责怪更容易让人接受和改变。',
            exampleEn:       "For example, I would gently tap the classmate on the shoulder and say with a smile, \"Hey, let's wait until we've crossed the road before looking at the phone — it's much safer.\" If he seemed indifferent, I would speak to him more seriously, telling him that every year in Singapore, a good number of pedestrians are injured because they were distracted while crossing the road, and I hope he does not become one of them. I believe that advising someone with sincerity and care is more readily accepted and more likely to lead to change than scolding.",
            link:          '我认为，身边的同伴对于我们的行为习惯有着深远的影响力。只要我们每个人都敢于善意地提醒身边的朋友，共同遵守交通规则，我们就能共同营造一个更安全的上学和放学环境，让每一个新加坡学生都能平安地走到学校、回到家中。',
            linkEn:        'I believe that peers around us have a profound influence on our behavioural habits. As long as each of us has the courage to kindly remind friends around us and collectively observe traffic rules, we can together create a safer environment for travelling to and from school, ensuring every Singapore student arrives at school and returns home safely.',
          },
        },
        q3: {
          cn: '除了马路安全，你认为学校还应该加强哪些方面的安全教育？',
          en: 'Besides road safety, what other aspects of safety education should the school strengthen?',
          peelAnswer: {
            point:         '我认为除了马路安全，学校还应该加强网络安全、防火安全和防范陌生人这三个方面的安全教育，以帮助学生全面保护自己。',
            pointEn:       'I believe that besides road safety, schools should also strengthen safety education in three areas: internet safety, fire safety, and stranger awareness, to help students protect themselves comprehensively.',
            elaboration:   '首先，随着网络的普及，网络安全已成为小学生不可忽视的议题。学校应教导学生如何识别网络骗局、保护个人隐私，以及如何负责任地使用社交媒体。其次，防火安全同样至关重要——学生应该了解如何在发生火灾时冷静疏散、如何使用灭火器，以及不能在家中玩火的重要性。此外，学校也应加强"防范陌生人"的教育，让学生懂得拒绝陌生人的邀请、遇到危险时如何求助，以及绝对不能透露个人信息给陌生人。',
            elaborationEn: 'Firstly, with the widespread use of the internet, internet safety has become a topic that primary school students cannot afford to ignore. Schools should teach students how to identify online scams, protect personal privacy, and use social media responsibly. Secondly, fire safety is equally vital — students should understand how to calmly evacuate during a fire, how to use a fire extinguisher, and the importance of never playing with fire at home. Furthermore, schools should also strengthen education on "stranger awareness", teaching students to decline invitations from strangers, how to seek help when in danger, and never to reveal personal information to strangers.',
            example:       '例如，我们学校每个学期都会举行防火演习，让同学们在模拟情况下练习有序疏散。此外，学校也曾邀请新加坡警察部队的警察叔叔来讲解防范网络骗局的知识，让我们了解到如何辨别可疑的网上链接和信息。这些活动不仅传授了知识，也让安全意识真正深入人心。',
            exampleEn:     'For example, our school holds fire drills every semester, allowing students to practise orderly evacuation in a simulated situation. In addition, our school once invited officers from the Singapore Police Force to explain how to guard against online scams, helping us understand how to identify suspicious links and messages online. These activities not only imparted knowledge but also truly instilled safety awareness in our hearts.',
            link:          '综上所述，安全教育绝不应该只停留在课堂上，而是需要通过真实的演练和互动活动，让学生将安全知识内化为本能的反应。只有全面的安全教育，才能真正保障每一位新加坡学生在各种环境中的人身安全。',
            linkEn:         "In conclusion, safety education should not remain only in the classroom — it needs to be internalised into students' instinctive responses through real drills and interactive activities. Only comprehensive safety education can truly safeguard the physical safety of every Singapore student across all types of environments.",
          },
        },
      },
      targetKeywords: ['交通规则', '斑马线', '疏忽大意', '后果不堪设想', '过马路'],
    },
  },
  {
    id: 'a2', yearLabel: '2012 Day 1', themeId: 'safety',
    subThemeCn: '家居用电安全', subThemeEn: 'Home Electrical Safety', focusSkill: 'Vocabulary',
    reading: {
      text: '在家中，电器用品给我们的生活带来了很大的方便，但如果使用不当，却会引发火灾等危险。爸爸经常提醒我，不要同时在同一插座使用过多电器，因为过载可能导致短路甚至起火。此外，离家前，我们必须关掉所有电源开关，确保安全。这些预防措施虽然简单，但对保障家人的平安十分重要。',
      targetWords: ['电器用品', '火灾', '插座', '过载', '短路', '预防措施', '保障'],
    },
    conversation: {
      storyboardDesc: 'A child receiving a suspicious friend request online. The child decides to ask their father about it.',
      questions: {
        q1: {
          cn: '描述录像中孩子在面对网络社交时的反应。',
          en: "Describe the child's reaction when facing online social networking in the video.",
          peelAnswer: {
            point:         '录像中，一名小学生在收到网络陌生人的好友申请时，展现出了谨慎明智的态度，立刻向父亲寻求指引。',
            pointEn:       'In the video, a primary school student displayed a cautious and sensible attitude upon receiving a friend request from an online stranger, immediately turning to their father for guidance.',
            elaboration:   '录像里，那名孩子在浏览社交媒体时，突然收到一个来自陌生人的好友申请。那个陌生人的个人资料显示他是一名"同龄的同学"，但孩子没有认识这个人。尽管对方的请求看起来无害，孩子却没有轻率地接受，而是立刻关上了平板电脑，跑去找爸爸，把这件事如实告诉了他，请求爸爸的帮助和建议。爸爸听后，欣慰地点了点头，认真地帮孩子检查了那个账号，发现对方的资料存在很多可疑之处，于是父子俩一起决定拒绝这个申请。',
            elaborationEn:   "In the video, while the child was browsing social media, they suddenly received a friend request from a stranger. The stranger's profile indicated they were \"a classmate of the same age\", but the child did not know this person. Although the request appeared harmless, the child did not recklessly accept it — instead, they immediately closed the tablet and ran to find their father, honestly telling him what had happened and asking for his help and advice. The father listened and nodded approvingly, then seriously helped the child check the account, discovering that the profile contained many suspicious elements. Father and child then decided together to decline the request.",
            example:       '例如，录像中爸爸告诉孩子："在网络上，有些人会假装成小孩，目的是骗取你的信任，然后套出你的个人资料，甚至约你出来见面，这是非常危险的。"孩子听了，若有所思地点点头。这一幕让我深刻地体会到，网络世界虽然方便，但也充满了无法预知的风险，尤其是对心思单纯的小学生来说，父母的引导和孩子的警觉性同样重要。',
            exampleEn:       "For example, in the video, the father told the child, \"On the internet, some people pretend to be children in order to gain your trust, then extract your personal information and even arrange to meet you in person — this is very dangerous.\" The child nodded thoughtfully upon hearing this. This scene made me deeply appreciate that while the internet world is convenient, it is also full of unforeseeable risks — especially for primary school students with trusting and straightforward minds, both parental guidance and the child's own vigilance are equally important.",
            link:          '录像中那名孩子处理陌生好友申请的正确做法，值得每一位同学学习。在网络安全意识日益重要的今天，我们必须时刻保持警觉，保护好自己的个人隐私，遇到可疑情况立刻告知父母或老师，绝不单独作出决定。',
            linkEn:         "The correct way the child in the video handled the stranger friend request is worth learning from for every student. In today's world where internet safety awareness is increasingly important, we must always remain vigilant, protect our personal privacy, and immediately inform parents or teachers when encountering suspicious situations, never making decisions alone.",
          },
        },
        q2: {
          cn: '你平时是如何管理自己的上网时间并确保安全的？',
          en: 'How do you usually manage your internet time and ensure safety?',
          peelAnswer: {
            point:         '我认为管理上网时间和确保网络安全，需要同时做到自律、谨慎和与父母保持坦诚的沟通，三者缺一不可。',
            pointEn:       'I believe that managing internet time and ensuring online safety requires three things simultaneously: self-discipline, caution, and maintaining open communication with parents — none of which can be missing.',
            elaboration:   '在管理上网时间方面，我和父母商量好，平日完成功课后，只能上网最多三十分钟；周末则可以延长至一小时，但上网内容必须是有益的，如阅读新闻、查阅学习资料或与家人视频通话。在确保网络安全方面，我会避免在网上透露自己的真实姓名、学校名称、家庭住址或家人的照片，也绝对不会与网上认识的陌生人私下见面。遇到任何让我感到不舒服的信息或账号，我都会立刻告知父母。',
            elaborationEn: 'In terms of managing internet time, I have discussed and agreed with my parents that on weekdays I can only go online for a maximum of thirty minutes after completing homework; on weekends this can be extended to one hour, but the online content must be beneficial, such as reading news, looking up study materials, or video-calling family members. In terms of ensuring online safety, I avoid revealing my real name, school name, home address, or family photos online, and absolutely would not meet privately with strangers I have only met online. If I encounter any message or account that makes me feel uncomfortable, I would immediately tell my parents.',
            example:       '记得有一次，我在一个学习网站上看到一则弹出广告，声称我"赢得了一份大奖"，要求我填写个人资料才能领取。我立刻感到可疑，没有点击任何链接，而是截图后把屏幕拿给爸爸看。爸爸说那是一个网络钓鱼诈骗，表扬了我的谨慎做法，并帮我把那个网站添加到黑名单。那次经历让我明白，面对网络上的诱惑，保持谨慎永远是第一步。',
            exampleEn:     'I remember once seeing a pop-up advertisement on a study website claiming I had "won a big prize", requiring me to fill in my personal details to claim it. I immediately felt suspicious, did not click on any link, but instead took a screenshot and showed the screen to Dad. Dad said it was a phishing scam, praised me for my cautious approach, and helped me add that website to the blacklist. That experience taught me that when facing temptations on the internet, remaining cautious is always the first step.',
            link:          '我认为，良好的网络使用习惯需要从小培养，而家庭的支持和引导是不可缺少的。只要我们做到自律管理时间，谨慎保护个人信息，遇事及时向父母报告，就能在享受网络便利的同时，有效避开各种网络陷阱，安全地使用互联网。',
            linkEn:        'I believe that good internet usage habits need to be cultivated from a young age, and family support and guidance are indispensable. As long as we exercise self-discipline in managing our time, carefully protect personal information, and promptly report matters to our parents, we can enjoy the conveniences of the internet while effectively avoiding all kinds of online traps, using the internet safely.',
          },
        },
        q3: {
          cn: '你认为家长在引导孩子正确使用网络方面应该扮演什么角色？',
          en: 'What role do you think parents should play in guiding children to use the internet correctly?',
          peelAnswer: {
            point:         '我认为家长在引导孩子正确使用网络方面，应该同时扮演教育者、监督者和倾听者三种角色，以全面保障孩子的网络安全。',
            pointEn:        "I believe that parents should simultaneously play three roles in guiding children to use the internet correctly: educator, supervisor, and listener, to comprehensively safeguard their child's online safety.",
            elaboration:   '首先，作为教育者，家长应该主动与孩子分享网络安全知识，包括如何识别诈骗、保护个人隐私，以及理解哪些内容是不适合浏览的。其次，作为监督者，家长可以与孩子共同制定上网规则，并使用家长控制软件来筛选不适当的内容，确保孩子在安全的网络环境中活动。然而最重要的，家长也要成为一个善于倾听的倾听者——建立开放、无批判的亲子对话氛围，让孩子在遇到网上不舒服的情况时，愿意主动向父母寻求帮助，而不是因为害怕责怪而选择隐瞒。',
            elaborationEn:  "Firstly, as educators, parents should proactively share internet safety knowledge with their children, including how to identify scams, protect personal privacy, and understand what types of content are inappropriate to browse. Secondly, as supervisors, parents can work together with their children to establish internet usage rules, and use parental control software to filter inappropriate content, ensuring children operate in a safe online environment. Most importantly, however, parents must also become good listeners — establishing an open, non-judgmental parent-child dialogue atmosphere so that when children encounter uncomfortable situations online, they are willing to proactively seek their parents' help rather than hiding things out of fear of being scolded.",
            example:       '例如，新加坡媒体素养理事会（MLC）鼓励家长与孩子一起参加"家庭媒体协议"计划，让家庭共同制定网络使用的规则，包括上网时间、可以浏览的内容类型，以及遇到不舒服内容时该如何处理。参与了这个计划的家庭表示，亲子之间的沟通更加顺畅，孩子也更愿意与父母分享网上的经历。',
            exampleEn:       "For example, Singapore's Media Literacy Council (MLC) encourages parents to participate together with their children in the \"Family Media Agreement\" programme, allowing families to jointly establish rules for internet use, including screen time, types of content that can be browsed, and what to do when encountering uncomfortable content. Families who have participated in this programme report that parent-child communication has become much smoother, and children are more willing to share their online experiences with their parents.",
            link:          '综上所述，家长在孩子的网络生活中扮演着不可替代的重要角色。只有当家长与孩子携手合作，建立互信、开放的亲子关系，才能真正帮助孩子在享受网络带来的便利的同时，懂得自我保护，成为一个聪明、负责任的数字公民。',
            linkEn:         "In conclusion, parents play an irreplaceable and important role in their children's online lives. Only when parents and children work hand in hand, building a trusting and open parent-child relationship, can we truly help children enjoy the conveniences of the internet while knowing how to protect themselves, becoming smart and responsible digital citizens.",
          },
        },
      },
      targetKeywords: ['个人隐私', '网络安全', '谨慎', '陌生人', '提高警惕'],
    },
  },
  {
    id: 'a3', yearLabel: '2014 Day 2', themeId: 'safety',
    subThemeCn: '防火演习', subThemeEn: 'Fire Drill', focusSkill: 'Phonetic',
    reading: {
      text: '上个月，我们学校举办了一场防火演习。警铃一响，同学们立刻停下手中的一切活动，有秩序地按照老师的指示迅速疏散到操场。在这次活动中，消防员叔叔还为我们示范了如何使用灭火器。虽然我希望永远不会遇到真正的火灾，但掌握这些应对技能，能让我在关键时刻保护自己和他人。',
      targetWords: ['演习', '警铃', '疏散', '操场', '消防员', '灭火器', '应对技能'],
    },
    conversation: {
      storyboardDesc: 'A child trying to reach a high cabinet in the kitchen by climbing on a shaky chair. An adult walks in and stops them.',
      questions: {
        q1: {
          cn: '描述录像中发生的居家不安全行为。',
          en: 'Describe the unsafe home behaviour occurring in the video.',
          peelAnswer: {
            point:         '录像中，一名孩子做出了一个极其危险的居家行为，险些酿成严重的意外，令人捏一把冷汗。',
            pointEn:       'In the video, a child performed an extremely dangerous home behaviour that nearly led to a serious accident, causing onlookers to break out in a cold sweat.',
            elaboration:   '录像里，那名孩子想从厨房的高柜子上取一样东西，便搬来一张摇摇晃晃的椅子，踩上去垫脚攀爬。椅子明显不够稳固，孩子一站上去便前后晃动，随时有倒塌的风险。就在这千钧一发之际，一名家长推开厨房门走了进来，见状大惊失色，立刻大声喝止，及时阻止了可能发生的跌倒意外。',
            elaborationEn: 'In the video, the child wanted to retrieve something from a high kitchen cabinet and brought over an unstable chair, stepping on it to reach up and climb. The chair was clearly not sturdy enough, and the moment the child stood on it, it began to wobble back and forth, at risk of collapsing at any moment. At this critical juncture, a parent pushed open the kitchen door and walked in, was shocked at the sight, and immediately called out loudly to stop the child, preventing what could have been a serious fall.',
            example:       '例如，录像中那把晃动的椅子，远远不足以承受一名孩子站在上面攀爬时产生的重量和动作。一旦椅子倒塌，孩子可能从高处重重地跌落，头部撞上坚硬的厨房地板或橱柜，后果不堪设想。这个录像生动地说明了，家中的高柜子对孩子而言是一个潜藏着巨大风险的危险区域。',
            exampleEn:     'For example, the wobbling chair in the video was far from adequate to support the weight and movement of a child standing on it to climb. If the chair had collapsed, the child could have fallen heavily from a height, striking their head on the hard kitchen floor or cupboard, with potentially devastating consequences. This video vividly illustrates that high cabinets at home represent a zone of enormous hidden danger for children.',
            link:          '这段录像深刻地提醒我们，家中看似平常的日常用品，在使用不当的情况下都可能成为危险的隐患。无论是攀爬高处还是使用电器，我们都应该时刻谨记安全第一，遇到需要帮助的情况，应该请大人协助，而不是贸然自行解决。',
            linkEn:        'This video profoundly reminds us that seemingly ordinary household items can become dangerous hazards when used improperly. Whether climbing to high places or using electrical appliances, we should always remember that safety comes first. When we need help, we should ask an adult to assist rather than rashly attempting to handle it ourselves.',
          },
        },
        q2: {
          cn: '当你在家独自一人时，你会注意哪些安全事项？',
          en: 'When you are home alone, what safety matters do you pay attention to?' ,
          peelAnswer: {
            point:         '当我在家独自一人时，我会特别注意用电安全、不开门给陌生人以及保持与父母的联络，确保自己的人身安全。',
            pointEn:       'When I am home alone, I pay special attention to electrical safety, not opening the door to strangers, and maintaining contact with my parents, to ensure my own personal safety.',
            elaboration:   '在用电安全方面，我会避免同时使用过多电器，离开房间前会关掉所有不需要的电器和电源。在家庭安全方面，我绝对不会开门给陌生人，即使对方声称是快递员或维修人员，我也会先打电话给父母确认，再决定是否开门。此外，每次父母不在家，我都会在他们出发前互换联系电话，以便随时沟通，遇到紧急情况能立刻联络到他们。',
            elaborationEn: 'In terms of electrical safety, I avoid using too many appliances simultaneously and switch off all unnecessary appliances and power points before leaving a room. In terms of home safety, I absolutely do not open the door to strangers — even if someone claims to be a delivery person or repairman, I would first call my parents to confirm before deciding whether to open the door. In addition, every time my parents are not at home, we exchange contact numbers before they leave so we can communicate at any time, and I can reach them immediately in an emergency.',
            example:       '记得有一次，我独自在家时，突然闻到一股奇怪的焦糊味道，我立刻检查了每个房间，发现是一个插座有点发热。我没有轻举妄动，而是立刻拨打了爸爸的手机告诉他情况，爸爸指导我先把那个插座的电源开关关掉，之后他尽快赶回家处理。那次经历让我明白，遇到紧急情况时，冷静应对和及时联络大人是最正确的做法。',
            exampleEn:     'I remember once when I was home alone, I suddenly smelled a strange burning odour. I immediately checked every room and discovered that an electrical socket was getting rather warm. I did not act rashly but instead immediately called Dad on his mobile to tell him the situation. Dad guided me to first switch off the power switch for that socket, then returned home as quickly as possible to deal with it. That experience taught me that when facing an emergency, staying calm and contacting an adult promptly is the correct approach.',
            link:          '我认为，学会在独自在家时照顾好自己的安全，是每个小学生都必须掌握的重要生活技能。这不只是对自己负责，更是让父母能放心上班、不需要时时担心的重要保证。从小养成安全意识，才能成为一个真正独立、有能力面对挑战的人。',
            linkEn:         "I believe that learning to take care of one's own safety when home alone is an important life skill that every primary school student must master. This is not only a matter of personal responsibility but also an important assurance that allows parents to work with peace of mind without constantly worrying. Developing safety awareness from young is what allows us to become truly independent and capable of facing challenges.",
          },
        },
        q3: {
          cn: '为什么通过角色扮演来学习安全知识对小学生很有效？',
          en: 'Why is learning safety knowledge through role-playing effective for primary students?',
          peelAnswer: {
            point:         '我认为通过角色扮演来学习安全知识，对小学生非常有效，因为这种方式能让孩子在身临其境的体验中，将安全知识转化为真正能派上用场的实际能力。',
            pointEn:       'I believe that learning safety knowledge through role-playing is very effective for primary school students, because this approach allows children to transform safety knowledge into practical skills that can truly be applied in real situations, through an immersive and experiential learning process.',
            elaboration:   '小学生的注意力容量有限，单纯的课堂讲授或书本知识往往难以让他们留下深刻的印象，更难以在真正遇到危险时冷静地回想和运用。然而，角色扮演创造了一个安全的模拟环境，让孩子们在游戏化的情境中，亲身体验如何应对危险——无论是模拟火灾疏散、拒绝陌生人的邀请，还是处理家居危险情况，这种"做中学"的方式能让安全知识更深刻地植入孩子的记忆，形成本能的条件反射。',
            elaborationEn:   "Primary school students have limited attention capacity, and purely classroom-based teaching or book knowledge often fails to leave a deep impression on them, making it even harder for them to calmly recall and apply this knowledge when they actually encounter danger. However, role-playing creates a safe simulated environment where children personally experience how to respond to dangers in a gamified setting — whether it is simulating fire evacuation, refusing a stranger's invitation, or handling household hazards. This \"learning by doing\" approach allows safety knowledge to be more deeply embedded in children's memory, forming an instinctive conditioned response.",
            example:       '例如，我们学校曾经举办过一次"居家安全角色扮演"活动，同学们分组演练不同的居家危险情景，包括有陌生人敲门时该如何应对，以及发现煤气泄漏时该怎么办。通过这次活动，许多同学表示，他们不仅记住了正确的应对步骤，而且回家后也真的把学到的知识告诉了父母，甚至和家人一起检查了家中可能存在的安全隐患。',
            exampleEn:     'For example, our school once organised a "Home Safety Role-Play" activity where students in groups practised different home hazard scenarios, including how to respond when a stranger knocks on the door and what to do upon discovering a gas leak. Through this activity, many students reported that they not only remembered the correct response steps, but also genuinely shared the knowledge they had learned with their parents when they got home, even checking together with their families for potential safety hazards in their home.',
            link:          '因此，我认为学校应该积极采用角色扮演、实地演练等互动式教学方法来传授安全知识，而不是仅靠讲课或发放小册子。只有当安全教育变得生动有趣，并与学生的真实生活紧密结合，才能真正让每一位新加坡学生做好应对突发情况的准备，保护自己和身边的人。',
            linkEn:         "Therefore, I believe schools should actively adopt interactive teaching methods such as role-playing and on-site drills to impart safety knowledge, rather than relying only on lectures or distributing pamphlets. Only when safety education becomes lively and interesting, and is closely connected to students' real lives, can it truly prepare every Singapore student to respond to emergencies and protect themselves and those around them.",
          },
        },
      },
      targetKeywords: ['攀爬', '危险', '跌倒', '受伤', '小心翼翼'],
    },
  },
  {
    id: 'a4', yearLabel: '2016 Day 1', themeId: 'safety',
    subThemeCn: '防范诈骗', subThemeEn: 'Scam Prevention', focusSkill: 'Opinion',
    reading: {
      text: '上周，学校邀请了一位警察叔叔来为我们讲解防范骗子的知识。他告诉我们，骗子经常会假装成银行或政府工作人员，通过电话骗取他人的信任和钱财。因此，遇到可疑的情况，我们应该先跟父母或老师商量，不要随便透露个人资料。提高防范意识，能有效减少受骗的风险，保护好自己和家人的财产安全。',
      targetWords: ['骗子', '假装', '信任', '钱财', '可疑', '透露', '防范意识'],
    },
    conversation: {
      storyboardDesc: 'Students running down a staircase at school. One student slips and falls, hurting their knee.',
      questions: {
        q1: {
          cn: '描述录像中楼梯间发生的意外过程。',
          en: 'Describe the process of the accident in the staircase in the video.',
          peelAnswer: {
            point:         '录像中，一场因为鲁莽奔跑和推挤而引发的楼梯间意外，清楚地展示了忽视校园安全规则所带来的严重后果。',
            pointEn:       'In the video, a staircase accident caused by reckless running and jostling clearly demonstrated the serious consequences of disregarding school safety rules.',
            elaboration:   '下课铃声一响，一群学生便迫不及待地涌入楼梯间，争先恐后地往下跑。其中几名同学相互推挤，完全不顾及其他同学的安全。就在这乱哄哄的情况中，一名走在前排的同学被后面的人推了一把，重心不稳，一脚踩空，整个人向前扑倒，膝盖重重地撞上了坚硬的台阶，痛得大叫起来。周围的同学这才停下来，慌张地围上前去，其中一名同学迅速跑去找老师求助。',
            elaborationEn: 'When the bell rang to signal the end of class, a group of students rushed eagerly into the staircase, racing each other to get down. Several students pushed and jostled each other, completely disregarding the safety of their fellow students. In the midst of this chaos, one student at the front was shoved from behind, lost their balance, and missed their footing on a step, falling forward with their knee hitting the hard stair step heavily, crying out in pain. The surrounding students only then stopped, rushing over in a panic, while one student quickly ran to find a teacher for help.',
            example:       '例如，录像中那名跌倒的同学膝盖上立刻肿起了一大块，无法自行站立，最终需要在同学和老师的搀扶下，才能被送到医务室处理伤口。这个令人揪心的场景，完全是可以避免的——只要大家在楼梯间能放慢脚步，依次有序地行走，而不是相互推挤争先，这场意外根本不会发生。',
            exampleEn:     'For example, the student who fell in the video immediately had a large swelling on their knee and could not stand up on their own, ultimately needing to be supported by classmates and a teacher before they could be taken to the sick bay for treatment. This distressing scene was entirely avoidable — had everyone simply slowed down and walked in an orderly manner on the staircase instead of jostling and rushing, the accident would never have occurred.',
            link:          '这段录像深刻地告诫我们，楼梯间是学校内最容易发生意外的地方之一。在楼梯上奔跑和推挤，不只会伤害自己，更可能连累无辜的同学受伤。每个人都有责任遵守楼梯间的行走规则，以自律和秩序来维护整个校园的安全。',
            linkEn:        'This video profoundly warns us that the staircase is one of the places in school where accidents most easily occur. Running and jostling on stairs not only causes harm to oneself but can also injure innocent classmates. Everyone has a responsibility to observe the rules for walking on staircases, maintaining the safety of the entire school through self-discipline and orderliness.',
          },
        },
        q2: {
          cn: '你在学校里见过类似的不安全行为吗？你是如何处理的？',
          en: 'Have you seen similar unsafe behaviour at school? How did you handle it?',
          peelAnswer: {
            point:         '是的，我在学校里曾经目睹过一些不安全行为，每次遇到，我都会尝试以适当的方式劝阻，因为维护校园安全是我们每个人的责任。',
            pointEn:       'Yes, I have witnessed some unsafe behaviour at school, and each time I encounter it, I try to dissuade the person in an appropriate way, because maintaining school safety is the responsibility of each one of us.',
            elaboration:   '在我们学校，偶尔会看到一些同学在走廊上追逐嬉戏，或者在楼梯间奔跑。每次看到这种情况，我会先评估一下状况，如果觉得危险程度较低，我会友善地提醒那些同学说："在走廊上不能跑，小心会撞到人或跌倒。"但如果情况比较严重，例如有人在靠近楼梯边缘的地方打闹，我会立刻告知附近的老师或学生纠察员，由他们来处理。',
            elaborationEn:   "In our school, one occasionally sees students chasing each other in the corridors or running in the staircase. Each time I see this, I first assess the situation — if I feel the level of danger is relatively low, I will kindly remind those students: \"You're not allowed to run in the corridor — be careful or you might bump into someone or fall.\" But if the situation is more serious, for example if someone is horsing around near the edge of a staircase, I would immediately inform a nearby teacher or student prefect to let them handle it.",
            example:       '有一次，我看到低年级的几名同学在饮水机旁边的湿滑地板上奔跑，其中一名差点滑倒。我立刻走过去，蹲下来和他们说话，告诉他们地板很滑，跑步容易跌倒受伤。孩子们听了，立刻停下来，乖乖地走路离开。那一刻，我感到很有成就感，也更加明白，维护校园安全，不只是老师和纠察员的事，每一位同学都应该积极参与。',
            exampleEn:     'Once, I saw several junior students running on the slippery floor near the water cooler, with one almost slipping and falling. I immediately walked over, crouched down to their level and spoke to them, telling them the floor was slippery and that running could easily result in a fall and injury. The children listened and immediately stopped, walking away obediently. At that moment I felt a great sense of accomplishment, and also came to appreciate more deeply that maintaining school safety is not only the job of teachers and prefects — every student should participate actively.',
            link:          '我认为，校园安全文化的建立，需要每一位学生都愿意以身作则，勇于劝导不安全行为。正是这种人人参与、互相提醒的校园精神，才能让新加坡的学校成为一个真正安全、让家长放心的学习环境。',
            linkEn:        'I believe that building a school safety culture requires every student to be willing to lead by example and have the courage to dissuade unsafe behaviour. It is precisely this school spirit of everyone participating and reminding each other that allows Singapore schools to become a truly safe learning environment that gives parents peace of mind.',
          },
        },
        q3: {
          cn: '你认为学生纠察员在维护校园安全方面起到了什么作用？',
          en: 'What role do you think student prefects play in maintaining school safety?',
          peelAnswer: {
            point:         '我认为学生纠察员在维护校园安全方面扮演着不可或缺的重要角色，他们既是安全规则的执行者，也是同学们的正面榜样。',
            pointEn:       'I believe that student prefects play an indispensable and important role in maintaining school safety — they are both enforcers of safety rules and positive role models for their fellow students.',
            elaboration:   '首先，学生纠察员能够在课间和放学时段，在走廊、楼梯间等容易发生意外的地点进行巡逻监督，及时制止同学们奔跑、推挤或其他不安全行为，弥补了老师无法时刻在场的不足。其次，作为同龄人，纠察员的劝导往往比老师的指令更容易被其他同学接受，因为大家更愿意听从一个"和自己一样的人"说的话。此外，担任纠察员本身也是一种教育——让一些有责任感的同学承担维护校园安全的职责，能培养他们的领导力、责任感和服务他人的精神。',
            elaborationEn:   "Firstly, student prefects are able to patrol and supervise locations prone to accidents — such as corridors and staircases — during recess and after school, promptly stopping students from running, jostling, or engaging in other unsafe behaviour, making up for the limitation that teachers cannot be present at all times. Secondly, as peers, a prefect's persuasion is often more readily accepted by other students than a teacher's directive, because people are more willing to listen to \"someone just like themselves\". Furthermore, serving as a prefect is itself an educational experience — assigning the responsibility of maintaining school safety to conscientious students cultivates their leadership, sense of responsibility, and spirit of serving others.",
            example:       '例如，在我们学校，纠察员每天早上都会站在校门口和楼梯口，引导同学们有序进入课室。遇到有同学推挤或奔跑的情况，他们会礼貌但坚定地提醒对方。我观察到，许多原本随意奔跑的同学，在纠察员的提醒下，都能立刻调整自己的行为，可见纠察员的存在确实对维持校园秩序和安全有着显著的效果。',
            exampleEn:      "For example, in our school, prefects stand at the school gate and staircase entrances every morning, guiding students to enter their classrooms in an orderly manner. When encountering students who push or run, they remind them politely but firmly. I have observed that many students who would otherwise run around casually immediately adjust their behaviour upon a prefect's reminder — demonstrating that the presence of prefects does indeed have a significant effect on maintaining school order and safety.",
            link:          '综上所述，学生纠察员是校园安全体系中不可缺少的一部分。他们不只是规则的守护者，更是用自己的行动告诉全校同学：维护校园安全是每个人的责任，而承担责任、服务他人，正是新加坡学生应该具备的优秀品格。',
            linkEn:         "In conclusion, student prefects are an indispensable part of the school safety system. They are not only guardians of rules, but also show through their own actions that maintaining school safety is everyone's responsibility — and taking on responsibility while serving others is precisely the excellent character that Singapore students should possess.",
          },
        },
      },
      targetKeywords: ['推挤', '受伤', '医务室', '遵守规则', '跌倒'],
    },
  },
  // ── Tech (t1–t4) ─────────────────────────────────────────────
  {
    id: 't1', yearLabel: '2019 Day 2', themeId: 'tech',
    subThemeCn: '智能手机的利弊', subThemeEn: 'Pros and Cons of Smartphones', focusSkill: 'Opinion',
    reading: {
      text: '智能手机已经成为我们日常生活中不可缺少的工具。它不仅让我们能随时联系亲友，还能帮助我们快速查询资料和学习知识。然而，如果过度依赖手机，就可能影响学习效率和身体健康。我觉得，我们应该合理安排使用电子产品的时间，不要让它成为干扰生活的绊脚石。',
      targetWords: ['智能手机', '联系', '查询', '过度依赖', '学习效率', '合理安排', '绊脚石'],
    },
    conversation: {
      storyboardDesc: 'A family dinner where everyone is on their phones instead of talking. The grandmother looks lonely.',
      scenarioDescription:   '录像里，一家人围坐在饭桌旁用餐。然而，爸爸、妈妈和孩子各自低着头，专心地盯着手中的手机，没有人互相交谈。坐在一旁的奶奶独自望着餐桌，神情显得十分孤独落寞，与周围沉浸在手机屏幕里的家人形成了鲜明的对比。',
      scenarioDescriptionEn: 'In the video, a family is seated around the dinner table for a meal. However, the father, mother and child are each looking down at their phones, and no one is talking to one another. The grandmother sits alone at the table looking very lonely and forlorn, in stark contrast to the family members who are all absorbed in their phone screens.',
      questions: {
        q1: {
          cn: '描述录像中家庭聚餐时发生了什么问题？',
          keywords:    ['温馨', '团聚', '其乐融融', '长辈', '晚辈', '不仅……也……', '一家人', '欢声笑语', '饭桌礼仪', '家庭凝聚力'],
          en: 'Describe the problem that occurred during the family dinner in the video.',
          peelAnswer: {
            point:       '录像中家庭聚餐时发生了一个令人担忧的问题：家人各自低头玩手机，没有人与奶奶交谈，使她显得非常孤独。',
            pointEn:       'In the video, a troubling situation occurred at the family dinner: family members were each looking down at their phones, and nobody spoke to the grandmother, making her appear very lonely.',
            elaboration: '原本一家人坐在一起用餐应该是增进感情、分享生活的美好时光，然而录像中的爸爸、妈妈和孩子都把注意力放在手机屏幕上，对旁边的奶奶视而不见。奶奶坐在桌旁，神情落寞，与周围忙于刷手机的家人形成了鲜明的对比。',
            elaborationEn: 'What should have been a warm and joyful occasion for the family to bond and share became a time where the father, mother and child all had their attention fixed on their phone screens, completely ignoring the grandmother beside them. She sat at the table looking forlorn, in stark contrast to the family members absorbed in their phones.',
            example:     '例如，即使饭桌上摆满了丰盛的菜肴，家人却没有任何一人向奶奶夹菜或询问她的近况，这让聚餐失去了温情与意义，沦为各自沉浸在虚拟世界里的"共处一室"。',
            exampleEn:     'For example, even though the table was covered with a generous spread of food, not a single family member served the grandmother or asked how she was doing. The meal lost all its warmth and meaning, becoming nothing more than people sitting together while living in their own virtual worlds.',
            link:        '这个情景提醒我们，电子产品若使用不当，会悄悄侵蚀家人之间珍贵的联系。我们应该学会在家庭时间里放下手机，用心陪伴身边的人，尤其是年长的家人，让他们感受到被珍视和关爱。',
            linkEn:        'This scene reminds us that when used improperly, electronic devices can quietly erode the precious bonds between family members. We should learn to put down our phones during family time and be fully present with the people around us — especially our elderly relatives — so they feel truly cherished and loved.',
          },
        },
        q2: {
          cn: '你认为科技对人与人之间的关系有什么正面和负面的影响？',
          keywords:    ['尊老爱幼', '传统价值观', '代代相传', '不仅……也……', '凝聚力', '家庭温暖', '感恩', '家庭教育', '言传身教', '潜移默化'],
          en: 'What positive and negative impacts do you think technology has on relationships between people?',
          peelAnswer: {
            point:         '我认为科技对人与人之间的关系既有正面的促进作用，也有不可忽视的负面影响，关键在于我们如何善用它。',
            pointEn:       'I believe that technology has both positive effects that promote relationships between people, and negative impacts that cannot be ignored — the key lies in how we make good use of it.',
            elaboration:   '从正面来看，科技让身处不同地方的家人和朋友能够随时保持联系，视频通话让异地亲情不再遥远；社交媒体也让人们更容易找到志同道合的朋友，分享彼此的生活。然而从负面来看，过度依赖电子产品会导致人们沉迷于虚拟世界，减少面对面的真实交流，进而削弱亲密感，甚至让家人在同一屋檐下却形同陌路。',
            elaborationEn:  "On the positive side, technology allows family and friends in different places to stay in touch at any time, and video calls make distant family relationships feel close again; social media also makes it easier for people to find like-minded friends and share each other's lives. However, on the negative side, over-reliance on electronic devices can cause people to become absorbed in the virtual world, reducing face-to-face interaction and weakening intimacy — even making family members under the same roof feel like strangers.",
            example:       '例如，我的祖父母住在马来西亚，多亏了视频通话，我们每个星期都能见到彼此的脸庞，感受并不疏远；但与此同时，我也曾经历过和朋友出去游玩，大家却各自刷手机，彼此之间几乎没有真正交谈的尴尬时刻。',
            exampleEn:      "For example, my grandparents live in Malaysia, and thanks to video calls, we can see each other's faces every week and do not feel distant. But at the same time, I have experienced the awkward situation of going out with friends, only to find everyone scrolling through their phones with barely any real conversation.",
            link:          '因此，科技本身并不是问题，问题在于我们的使用方式。只要我们懂得自律，在适当的时候放下手机、用心投入与身边人的互动，科技便能成为增进感情的工具，而不是阻隔人心的屏障。',
            linkEn:        'Therefore, technology itself is not the problem — the problem lies in how we use it. As long as we exercise self-discipline and put down our phones at the right moments to genuinely engage with the people around us, technology can become a tool for strengthening relationships rather than a barrier that separates hearts.',
          },
        },
        q3: {
          cn: '在你的家庭里，大家是如何平衡使用电子产品和家庭时间的？',
          keywords:    ['难忘', '印象深刻', '温馨时光', '珍惜', '不仅……也……', '感情深厚', '回味无穷', '家人陪伴', '心怀感恩', '倍感温暖'],
          en: 'In your family, how do you balance using electronic devices and family time?',
          peelAnswer: {
            point:       '在我的家庭里，我们通过制定共同约定来平衡电子产品的使用和家庭时间，确保两者之间取得健康的平衡。',
            pointEn:       'In my family, we balance the use of electronic devices and family time by establishing shared agreements, ensuring a healthy balance between the two.',
            elaboration: '爸爸妈妈规定，吃饭时间所有人必须把手机放在一边，专心用餐和交流；周末则会安排至少一项家庭活动，比如一起去公园散步或玩桌游。此外，平日里我也会在完成功课之后，才使用平板电脑作为奖励，而不是一回家就捧着屏幕。',
            elaborationEn: 'Mum and Dad have a rule that during mealtimes, everyone must put their phones aside and focus on eating and chatting together; on weekends, at least one family activity is planned, such as going for a walk in the park or playing board games. In addition, on weekdays I only use the tablet after finishing my homework as a reward, rather than picking it up the moment I get home.',
            example:     '例如，上个月，爸爸提议我们举办"无屏幕晚餐"，每周五晚上一家人吃饭时完全不碰手机。那天的晚餐特别热闹，大家分享了各自一周内有趣的经历，气氛非常融洽。',
            exampleEn:     "For example, last month, Dad suggested we hold a 'screen-free dinner' every Friday evening, where the whole family would have dinner without touching their phones at all. That dinner was especially lively — everyone shared interesting things that had happened during the week, and the atmosphere was wonderfully warm.",
            link:        '我认为，家庭之间的约定和互相监督，是平衡科技与家庭时间最有效的方法。这样既能让我们享受科技带来的便利，也不会忽略家人之间面对面交流的宝贵时光。',
            linkEn:        'I believe that family agreements and mutual accountability are the most effective ways to balance technology and family time. This allows us to enjoy the convenience that technology brings while not neglecting the precious time we spend face-to-face with our family.',
          },
        },
      },
      targetKeywords: ['互动', '生动有趣', '多媒体', '自主学习', '效率'],
    },
  },
  {
    id: 't2', yearLabel: '2022 Day 2', themeId: 'tech',
    subThemeCn: '网络学习平台', subThemeEn: 'Online Learning Platforms', focusSkill: 'Narrative',
    reading: {
      text: '随着科技的进步，网络学习平台逐渐普及。在疫情期间，许多学校开始采用网上教学的方式。这种学习模式虽然方便灵活，但也对我们的自律能力提出了要求。没有老师在身边监督，我们必须靠自己的意志力保持专心。我认为，只有养成良好的学习习惯，才能充分发挥网络教育的优势。',
      targetWords: ['网络学习', '普及', '灵活', '自律能力', '监督', '意志力', '优势'],
    },
    conversation: {
      storyboardDesc: 'An elderly man is confused at a self-checkout kiosk in a supermarket. A young person steps up to show him how to use it.',
      questions: {
        q1: {
          cn: '描述录像中乐龄人士面对新科技时的困惑以及年轻人的帮助。',
          en: "Describe the senior's confusion facing new technology and the young person's help in the video.",
          peelAnswer: {
            point:         '录像中，一位乐龄人士在面对超市的自助付款机时，显得手足无措，而一名年轻人主动上前耐心协助，展现了温暖动人的跨代互助精神。',
            pointEn:       'In the video, an elderly person appeared completely flustered when faced with a supermarket self-checkout kiosk, while a young person proactively stepped forward to patiently assist, demonstrating a warmly touching spirit of cross-generational mutual help.',
            elaboration:   '那位老伯伯独自站在自助付款机前，对着屏幕上的各种按钮和提示语发愣，不知从何下手。他先是试着按了几个键，却触发了错误提示，机器发出刺耳的报警声，令他越来越慌乱。就在这时，排在他后面的一名年轻人没有表现出不耐烦，而是微笑着走上前去，以轻声细语、简单易懂的方式，一步一步地引导老伯伯完成扫码、选择付款方式和领取收据的整个流程，直到老伯伯顺利完成付款，才放心离开。',
            elaborationEn: 'The elderly gentleman stood alone in front of the self-checkout kiosk, staring blankly at the various buttons and prompts on the screen, not knowing where to begin. He first tried pressing a few keys but triggered an error alert, and the machine emitted a jarring alarm sound, causing him to become increasingly flustered. At this point, the young person queuing behind him showed no impatience — instead, they walked forward with a smile and, in a soft, simple and easy-to-understand manner, guided the elderly gentleman step by step through the entire process of scanning items, selecting a payment method, and collecting his receipt, only leaving once the payment was successfully completed.',
            example:       '例如，录像中那名年轻人在帮助老伯伯时，没有显出任何不耐烦，更没有把老伯伯的手直接拨开自己操作，而是一边指着屏幕，一边轻声说："现在把商品条码对准这个红色感应区，听到"哔"的一声就好了。"这种有耐心、有方法地教导方式，不仅帮助老伯伯学会了如何使用机器，更维护了他的尊严和自尊心。',
            exampleEn:       "For example, the young person helping the elderly gentleman in the video showed no signs of impatience at all, and certainly did not push the elderly man's hands aside to operate the machine themselves. Instead, they pointed to the screen while saying softly, \"Now point the barcode on the item towards this red scanner — you'll hear a 'beep' when it's done.\" This patient and methodical teaching approach not only helped the elderly gentleman learn how to use the machine but also preserved his dignity and self-respect.",
            link:          '录像中这一幕跨代互助的温馨画面，提醒我们在科技高速发展的今天，我们不应该遗忘社会中可能跟不上脚步的乐龄人士。给予他们耐心和帮助，不仅是一种善举，更是新加坡"关怀共融"社会价值观的体现。',
            linkEn:          "This warm scene of cross-generational mutual assistance in the video reminds us that in today's era of rapidly advancing technology, we should not forget the elderly members of society who may struggle to keep up. Offering them patience and help is not only an act of kindness, but also an embodiment of Singapore's social values of \"care and inclusivity\".",
          },
        },
        q2: {
          cn: '你曾教过家里的长辈使用过智能手机的功能吗？分享你的经历。',
          en: 'Have you ever taught your elders how to use smartphone functions? Share your experience.',
          peelAnswer: {
            point:         '是的，我曾经教过祖母如何使用智能手机上的视频通话功能，那段经历让我既感到有成就感，也让我体会到了教导长辈所需要的耐心与细心。',
            pointEn:       'Yes, I have taught my grandmother how to use the video calling function on a smartphone, and that experience gave me a great sense of accomplishment while also helping me appreciate the patience and attentiveness required when teaching elders.',
            elaboration:   '祖母住在马来西亚，和我们相距较远，过去只能靠电话联络。我决定教她用视频通话，这样她就能看到我们的脸，感觉更加亲近。然而，整个教学过程并不顺利。祖母经常搞不清楚是要点击还是双击，也常常不小心按错键，结果退出了通话界面。每次出现问题，我都会深呼一口气，保持冷静，再从头一步步解释。',
            elaborationEn: 'Grandmother lives in Malaysia, quite far from us, and we used to only be able to communicate by voice call. I decided to teach her to use video calling so she could see our faces and feel closer to us. However, the teaching process did not go smoothly. Grandmother often could not tell whether she needed to tap or double-tap, and frequently pressed the wrong key by accident, accidentally exiting the call screen. Each time a problem arose, I took a deep breath, stayed calm, and explained step by step from the beginning again.',
            example:       '令我印象最深刻的是，有一次祖母怎么都找不到视频通话的按钮，我足足解释了五遍，她才终于弄清楚。但当她第一次成功拨通视频，看到我的脸出现在屏幕上，她高兴得笑了起来，连声说："哎呀，真的能看到你！太神奇了！"那一刻，我所有的挫折感都消失了，取而代之的是满满的喜悦和成就感。从那以后，每个周末祖母都会自己拨打视频通话来和我们聊天，让相距两地的我们感情更亲密了。',
            exampleEn:     'The moment that left the deepest impression on me was once when Grandmother could not find the video call button no matter what. I explained it five full times before she finally understood. But when she successfully made her first video call and saw my face appear on the screen, she broke into a smile and kept saying, "Oh my, I can really see you! How amazing!" In that instant, all my feelings of frustration vanished and were replaced by an overwhelming sense of joy and accomplishment. From then on, Grandmother would make video calls herself every weekend to chat with us, making our relationship across the distance feel much closer.',
            link:          '这段经历让我明白，教导长辈使用科技，需要的不只是技术知识，更重要的是耐心、体谅和尊重。作为年轻一代，我们有能力帮助长辈跟上时代的步伐，而这种关爱与传承，正是新加坡家庭精神最美好的体现。',
            linkEn:         "This experience taught me that teaching elders to use technology requires not just technical knowledge, but more importantly patience, empathy and respect. As the younger generation, we have the ability to help elders keep pace with the times, and this caring and intergenerational connection is the most beautiful expression of the spirit of Singapore's family values.",
          },
        },
        q3: {
          cn: '如何能让新加坡成为一个更具包容性的"智慧国"？',
          en: 'How can Singapore become a more inclusive "Smart Nation"?',
          peelAnswer: {
            point:         '我认为要让新加坡成为一个更具包容性的"智慧国"，必须确保科技发展的成果能惠及所有人，尤其是乐龄人士、低收入群体和残障人士。',
            pointEn:       'I believe that to make Singapore a more inclusive "Smart Nation", it is essential to ensure that the benefits of technological development can reach everyone — especially the elderly, lower-income groups, and persons with disabilities.',
            elaboration:   '首先，政府可以扩大数码素养培训计划的覆盖面，在社区中心、居民委员会和图书馆开设更多免费的科技基础课程，特别针对乐龄人士和不熟悉数字工具的居民，帮助他们掌握日常所需的数码技能，如网上购物、电子付款和视频通话等。其次，科技公司在设计产品时，应该注重无障碍设计，例如提供大字体、语音辅助和简化界面的选项，让行动不便或视力欠佳的人也能轻松使用数码服务。此外，推动志愿者计划，鼓励年轻人走进社区，一对一地帮助乐龄人士适应数字生活，也是非常有效的方式。',
            elaborationEn:  "Firstly, the government can expand the reach of digital literacy training programmes, offering more free basic technology courses at community centres, residents' committees and libraries — targeted especially at elderly residents and those unfamiliar with digital tools — to help them master the digital skills needed for daily life, such as online shopping, electronic payment and video calling. Secondly, technology companies should prioritise accessibility in their product design, for example by providing options for large text, voice assistance and simplified interfaces, so that people with limited mobility or poor eyesight can also use digital services with ease. In addition, promoting volunteer programmes to encourage young people to go into communities and help elderly residents adapt to digital life on a one-to-one basis is also a very effective approach.",
            example:       '例如，新加坡政府推行的"数码百事通"（Digital Ambassadors）计划，就是招募年轻志愿者前往组屋区，协助乐龄居民学习使用SingPass、网上医疗预约等数码服务。这个计划有效地弥合了数字鸿沟，让许多本来对科技望而却步的老人，逐渐能够独立处理日常数码事务，提升了他们的生活质量和自信心。',
            exampleEn:       "For example, Singapore's government-launched \"Digital Ambassadors\" programme recruits young volunteers to go to HDB estates and help elderly residents learn to use digital services such as SingPass and online medical appointments. This programme has effectively bridged the digital divide, allowing many elderly people who previously felt daunted by technology to gradually manage their daily digital tasks independently, improving their quality of life and confidence.",
            link:          '综上所述，一个真正具有包容性的"智慧国"，不只看一个国家的科技水平有多高，更要看科技是否真正惠及社会上的每一个人。只有当每一位新加坡居民，无论年龄、能力或背景，都能自信地融入数字时代，新加坡才能真正实现"无人落后"的智慧国愿景。',
            linkEn:          "In conclusion, a truly inclusive \"Smart Nation\" is not only measured by how advanced a country's technology is, but also by whether technology genuinely benefits every person in society. Only when every Singapore resident, regardless of age, ability or background, can confidently integrate into the digital age, can Singapore truly achieve its Smart Nation vision of \"leaving no one behind\".",
          },
        },
      },
      targetKeywords: ['耐心', '手忙脚乱', '包容', '时代接轨', '教导'],
    },
  },
  {
    id: 't3', yearLabel: '2023 Day 2', themeId: 'tech',
    subThemeCn: '社交媒体与隐私', subThemeEn: 'Social Media and Privacy', focusSkill: 'Expression',
    reading: {
      text: '社交媒体让我们能轻易地与朋友保持联系，分享生活的点滴。然而，在享受便利的同时，我们也应该注意保护自己的隐私。上周，我在网上看到一个同龄的孩子因为透露个人资料而遭到网络欺凌。这件事提醒了我，在发布任何内容前，都要先想一想可能产生的后果。学会谨慎使用社交媒体，是保护自己的重要一步。',
      targetWords: ['社交媒体', '隐私', '透露', '网络欺凌', '后果', '谨慎', '保护自己'],
    },
    conversation: {
      storyboardDesc: 'A food delivery rider cycling through a neighbourhood in the rain to deliver food to a family.',
      questions: {
        q1: {
          cn: '描述录像中送餐员辛勤工作的情景。',
          en: 'Describe the scene of the food delivery rider working hard in the video.',
          peelAnswer: {
            point:         '录像中，一名送餐员在倾盆大雨中骑车穿梭于组屋区，将外卖食物准时送到顾客家门口，令人深感敬佩和心疼。',
            pointEn:        "In the video, a food delivery rider cycled through an HDB estate in pouring rain, delivering takeaway food to a customer's doorstep on time — a sight that evoked both deep admiration and heartfelt sympathy.",
            elaboration:   '录像里，外面下着大雨，路面湿滑。那名送餐员戴着头盔，身穿雨衣，艰难地骑着自行车，一手控制车把，一手护着装有食物的保温袋，小心翼翼地避开路上的水洼。到达目的地后，他满身湿透，却依然礼貌地按门铃，把食物交给顾客，微笑着说了声"请享用"。整个过程中，他的专业态度和敬业精神令人动容。',
            elaborationEn: 'In the video, it was raining heavily and the road surfaces were slippery. The delivery rider, wearing a helmet and raincoat, struggled to cycle along, steering with one hand while protecting the insulated food bag with the other, carefully avoiding puddles on the road. Upon arriving at the destination, he was completely soaked, yet still politely pressed the doorbell, handed the food to the customer, and said with a smile, "Please enjoy your meal." Throughout the entire process, his professional attitude and dedication were deeply moving.',
            example:       '例如，录像中那名送餐员在递上食物时，还特意检查了食物袋的封口是否完好，确保食物没有因为大雨而受潮。这个细心的举动，说明他不只是在完成一份工作，而是真正以认真负责的态度对待每一位顾客，值得我们由衷地尊重。在新加坡，无数像他这样的送餐员，每天风雨无阻地为我们提供服务，让我们的生活更加便利。',
            exampleEn:      "For example, in the video the delivery rider, when handing over the food, also specifically checked that the food bag's seal was intact, ensuring the food had not been dampened by the heavy rain. This considerate gesture showed that he was not merely completing a job, but genuinely approaching every customer with a conscientious and responsible attitude — something worthy of our wholehearted respect. In Singapore, countless delivery riders like him work tirelessly through all kinds of weather every day, making our lives more convenient.",
            link:          '录像中送餐员在风雨中坚守岗位的画面，让我深刻体会到，每一份外卖的背后，都凝聚着一位普通劳动者的辛勤付出。我们在享受送餐服务带来的便利时，更应该心存感激，以尊重和礼貌来对待每一位为我们服务的工作人员。',
            linkEn:        'The image of the delivery rider persevering at his post through wind and rain in the video made me deeply appreciate that behind every food delivery order is the hard work and dedication of an ordinary worker. While we enjoy the convenience brought by food delivery services, we should be all the more grateful, treating every service worker who serves us with respect and courtesy.',
          },
        },
        q2: {
          cn: '你家经常叫外卖吗？你对送餐服务的便利性有什么看法？',
          en: 'Does your family order food delivery often? What are your views on its convenience?',
          peelAnswer: {
            point:         '我家偶尔会叫外卖，我认为送餐服务确实为现代家庭提供了极大的便利，但我们也不应该过度依赖，忽略了其背后的代价。',
            pointEn:       'My family occasionally orders food delivery. I believe that food delivery services do provide tremendous convenience for modern families, but we should also not become overly reliant on them, ignoring the costs behind the service.',
            elaboration:   '送餐服务的便利性是毋庸置疑的，特别是在父母下班后疲惫不堪，或是家里有人生病、需要照顾的时候，叫外卖能节省大量的烹饪和购物时间。然而，频繁叫外卖也有其代价：一方面是经济上的负担，另一方面是外卖食物的健康程度往往不如家里烹饪的饭菜。更重要的是，家庭用餐时间是家人增进感情的宝贵机会，如果太多时候依赖外卖，可能会减少大家一起下厨的互动和乐趣。',
            elaborationEn: 'The convenience of food delivery services is undeniable — especially when parents return exhausted after work, or when someone at home is ill and needs care, as ordering delivery can save a great deal of cooking and shopping time. However, frequent food delivery comes with its costs: on one hand, the financial burden; on the other, takeaway food is often not as healthy as home-cooked meals. More importantly, family mealtimes are precious opportunities for family members to strengthen their bond, and if the family relies on delivery too often, it may reduce the interaction and enjoyment of cooking together.',
            example:       '记得有一次，爸妈都要加班，家里没有时间做饭，我们便叫了外卖。那顿饭虽然方便，但我感觉少了些什么——那种一家人围在一起准备饭菜、分工切菜和摆碗筷的温馨感觉不见了。那次之后，我跟妈妈提议，就算很忙，每周也要至少一两次一起在家做简单的饭，哪怕只是炒饭或汤面，因为那个过程本身就是很珍贵的家庭时光。',
            exampleEn:     'I remember once when both Mum and Dad had to work overtime and there was no time to cook at home, so we ordered food delivery. The meal was convenient, but I felt something was missing — that warm feeling of the whole family gathered together to prepare the meal, sharing the tasks of chopping vegetables and setting the bowls and chopsticks. After that, I suggested to Mum that even when we are busy, we should cook at home together at least once or twice a week, even if it is just fried rice or noodle soup, because that process itself is very precious family time.',
            link:          '我认为，送餐服务是现代生活的好帮手，应该在真正有需要时才使用，而不是让它取代家庭烹饪和共餐的传统。只有当我们合理地使用这些便利服务，同时不忘背后每一位辛勤工作的送餐员，我们才能真正地享受科技带来的好处。',
            linkEn:        'I believe food delivery services are excellent aids in modern life and should be used when there is a genuine need, rather than allowing them to replace the tradition of home cooking and sharing meals as a family. Only when we use these convenient services in a measured way, while never forgetting each and every hard-working delivery rider behind the service, can we truly enjoy the benefits that technology brings.',
          },
        },
        q3: {
          cn: '我们应该如何对这些在烈日或风雨中工作的服务人员表示尊重和体谅？',
          en: 'How should we show respect and empathy for these service workers who work in the sun or rain?',
          peelAnswer: {
            point:         '我认为，对在烈日或风雨中辛勤工作的服务人员表示尊重和体谅，不需要做什么大事，只需要在日常生活的点滴互动中，以真诚的礼貌和体贴的行动来表达。',
            pointEn:       'I believe that showing respect and empathy to service workers who toil in the blazing sun or pouring rain does not require grand gestures — it simply requires expressing sincere politeness and thoughtful actions in the small moments of everyday interactions.',
            elaboration:   '首先，在接收外卖或任何服务时，我们应该主动向服务人员说一声"谢谢"，给予真诚的眼神接触和微笑，而不是只盯着手机，把食物拿走就关门。其次，我们可以在天气恶劣时表达多一分体谅——例如，当送餐员在大雨中赶到时，可以主动递上一条干毛巾，或表示感谢他们不辞辛苦的付出。此外，也要避免在天气极端恶劣时，仅为了一时方便而不必要地叫外卖，造成服务人员不必要的风险。',
            elaborationEn: 'Firstly, when receiving food delivery or any service, we should proactively say "thank you" to the service worker, offering genuine eye contact and a smile, rather than staring at our phone and just taking the food and closing the door. Secondly, we can show an extra bit of consideration in bad weather — for example, when a delivery rider arrives in heavy rain, we can proactively offer a dry towel, or simply express gratitude for their tireless effort. In addition, we should also avoid placing unnecessary delivery orders merely for the sake of momentary convenience during extreme weather, creating unnecessary risk for service workers.',
            example:       '例如，我听说有一位新加坡居民在下雨天收到外卖时，看到送餐员全身湿透，立刻递上了一杯热饮和一条干毛巾，还真诚地道谢。送餐员非常感动，在网上分享了这段经历，引发了很多网民的正面回应。这件小事提醒我们，一个简单的善意举动，就能给他人带来极大的温暖，也能传递正能量，让整个社会更加充满人情味。',
            exampleEn:     'For example, I heard of a Singapore resident who, upon receiving a delivery on a rainy day and seeing the delivery rider completely soaked, immediately offered a hot drink and a dry towel, and expressed sincere thanks. The delivery rider was deeply moved and shared the experience online, drawing many positive responses from netizens. This small incident reminds us that a simple act of goodwill can bring tremendous warmth to others and also spreads positive energy, making our whole society feel more full of human warmth.',
            link:          '总而言之，尊重每一位服务人员，是新加坡"关怀社会"精神的体现。无论是送餐员、清洁工人还是保安叔叔，他们都在以自己的辛勤劳动为社会作出贡献。只要我们多一点体谅、多一声谢谢、多一个微笑，就能让他们感受到自己的工作是被珍视和认可的，这种人与人之间的温情，正是让新加坡成为更美好家园的珍贵力量。',
            linkEn:          "In conclusion, respecting every service worker is an embodiment of Singapore's spirit of a \"caring society\". Whether they are delivery riders, cleaning workers or security guards, they are all contributing to society through their hard work. As long as we show a little more understanding, say one more \"thank you\", and offer one more smile, we can make them feel that their work is valued and appreciated. This warmth between people is the precious force that makes Singapore a better home for everyone.",
          },
        },
      },
      targetKeywords: ['体谅', '风雨无阻', '外卖', '辛苦', '礼貌'],
    },
  },
  {
    id: 't4', yearLabel: '2024 Day 2', themeId: 'tech',
    subThemeCn: '人工智能的影响', subThemeEn: 'Impact of Artificial Intelligence', focusSkill: 'Vocabulary',
    reading: {
      text: '人工智能正在改变我们的生活。如今，智能机器人能帮助医生进行诊断，也能在工厂里完成复杂的组装工作。虽然这些科技让生活更加便利，但也有人担心机器人会取代人类的工作。我认为，只要我们不断学习新知识，提升自己的能力，就能与科技共同进步，创造更美好的未来。',
      targetWords: ['人工智能', '智能机器人', '诊断', '组装', '取代', '提升', '共同进步'],
    },
    conversation: {
      storyboardDesc: 'Students using an AI chat interface to brainstorm ideas for a class project, while the teacher observes and guides them.',
      questions: {
        q1: {
          cn: '描述录像中学生们如何利用AI辅助学习。',
          en: 'Describe how the students use AI to assist their learning in the video.',
          peelAnswer: {
            point:         '录像中，几名学生在老师的指导下，积极地利用AI聊天工具来协助他们为班级项目进行集思广益，展现出科技与学习有机结合的良好景象。',
            pointEn:        "In the video, several students, under their teacher's guidance, actively used an AI chat tool to assist them in brainstorming ideas for a class project, demonstrating a positive picture of technology and learning working in harmony.",
            elaboration:   '同学们围坐在电脑前，把项目的主题输入AI工具，AI迅速生成了一系列的创意方向和资料参考。同学们并没有盲目接受AI的建议，而是认真地阅读和讨论，筛选出符合项目要求的想法，并在此基础上进行深入的分析和补充，加入自己的思考和创意。老师则在一旁观察，偶尔提问，引导学生思考AI回答的准确性和局限性，鼓励他们保持批判性思维，不依赖AI的单一答案。',
            elaborationEn:  "The students sat around the computer, entering the project's theme into the AI tool, which quickly generated a series of creative directions and reference materials. Rather than blindly accepting AI's suggestions, the students carefully read and discussed the outputs, filtering out ideas that matched the project's requirements and building upon them with in-depth analysis and additions, incorporating their own thinking and creativity. The teacher observed from the side, occasionally asking questions, guiding students to consider the accuracy and limitations of AI's responses, and encouraging them to maintain critical thinking rather than relying on AI's answers alone.",
            example:       '例如，录像中有一名同学提出了一个AI没有提到的独特视角，他解释道："AI给的资料很有用，但我觉得还可以从本地的角度来分析，加入新加坡的例子，这样项目会更有特色。"其他同学听后纷纷赞同，大家一起在AI的基础上，进一步丰富和完善了项目计划。这一幕生动地说明了，AI是一个强大的辅助工具，但人类的思考和判断力，才是最不可缺少的。',
            exampleEn:     'For example, one student in the video suggested a unique angle that AI had not mentioned, explaining: "The information AI gave is very useful, but I think we can also analyse it from a local perspective, adding Singapore examples — that would make the project more distinctive." The other students agreed upon hearing this, and together they further enriched and refined the project plan on the foundation provided by the AI. This scene vividly illustrates that AI is a powerful assistive tool, but human thinking and judgement are the most indispensable elements.',
            link:          '录像中学生们善用AI辅助学习的做法，体现了正确使用科技工具的精神——既充分发挥AI的效率优势，又不丢失自主思考和创新的能力。在新加坡的未来教育中，懂得与AI协作，将成为每个学生必须掌握的重要能力。',
            linkEn:         "The way the students in the video made good use of AI to assist their learning embodies the right spirit of using technological tools — fully exploiting the efficiency advantages of AI while not losing the capacity for independent thinking and innovation. In Singapore's future education, knowing how to collaborate with AI will become an important skill that every student must master.",
          },
        },
        q2: {
          cn: '你认为AI能取代老师吗？为什么？',
          en: 'Do you think AI can replace teachers? Why?',
          peelAnswer: {
            point:         '我认为AI无法取代老师，因为教育不只是知识的传递，更是人与人之间情感、价值观和品格的培养，这些是AI目前无法做到的事情。',
            pointEn:       'I do not believe AI can replace teachers, because education is not only about the transmission of knowledge, but also about the cultivation of emotions, values and character between people — things that AI is currently unable to accomplish.',
            elaboration:   '固然，AI在知识检索、个性化练习和即时反馈等方面有着无可比拟的优势，它能够根据每个学生的程度提供量身定制的学习内容，让学生按照自己的节奏学习。然而，一位好的老师能够察觉到学生情绪上的变化，在学生感到沮丧或困惑时给予及时的鼓励和支持；能在言传身教中传递做人的道理和处事的智慧；也能在课堂上创造那种思维碰撞的火花，引导学生进行深度讨论，这些都是AI目前无法复制的人文温度。',
            elaborationEn:  "Admittedly, AI has unparalleled advantages in knowledge retrieval, personalised practice and instant feedback — it can provide customised learning content tailored to each student's level, allowing students to learn at their own pace. However, a good teacher can detect changes in students' emotions, offering timely encouragement and support when students feel frustrated or confused; can transmit principles for conducting oneself in life and wisdom in handling affairs through their own words and deeds; and can create those sparks of intellectual collision in the classroom, guiding students in deep discussion — all of which embody a human warmth that AI cannot currently replicate.",
            example:       '例如，我的华文老师曾在一次考试后，注意到我神情低落，特意在放学后留下来与我谈心，鼓励我不要灰心，还帮我找出了答题时失分的原因。那次谈话，不只帮助我改善了成绩，更让我感受到了老师真诚的关怀，让我重新找回了学习的信心。这种师生之间真实的情感纽带，是任何AI都无法给予的珍贵东西。',
            exampleEn:      "For example, my Chinese language teacher once noticed I looked downcast after an exam and specifically stayed back after school to have a heart-to-heart conversation with me, encouraging me not to be discouraged, and helping me identify where I had lost marks. That conversation not only helped me improve my results, but also made me feel the teacher's genuine care, helping me regain my confidence in learning. This authentic emotional bond between teacher and student is something precious that no AI can provide.",
            link:          '因此，我认为AI应该被视为老师的得力助手，而不是替代者。未来最理想的教育模式，是让AI负责知识传授和技能练习，而老师则专注于品格培育、情感支持和思维引导，让两者相辅相成，共同为学生创造最好的学习体验。',
            linkEn:        'Therefore, I believe AI should be regarded as a capable assistant to teachers, not a replacement. The ideal future education model is for AI to handle knowledge transmission and skills practice, while teachers focus on character cultivation, emotional support and thinking guidance — the two complementing each other to together create the best possible learning experience for students.',
          },
        },
        q3: {
          cn: '面对快速发展的科技，小学生应该具备什么样的学习态度？',
          en: 'Facing fast-developing technology, what kind of learning attitude should primary students have?',
          peelAnswer: {
            point:         '我认为面对日新月异的科技发展，小学生最重要的学习态度是保持好奇心、愿意持续学习，以及具备批判性思维，不盲目接受一切科技带来的信息和变化。',
            pointEn:       'I believe that facing the rapidly changing landscape of technological development, the most important learning attitudes for primary school students are maintaining curiosity, being willing to continue learning, and possessing critical thinking — not blindly accepting all the information and changes that technology brings.',
            elaboration:   '首先，科技的发展日新月异，今天被认为是尖端的技术，可能明天便会被更新的事物取代。因此，保持强烈的求知欲和好奇心，主动探索和学习新知识，是适应快速变化的最根本态度。其次，懂得善用科技工具、灵活应用各种数码资源来辅助学习，而不是把科技当作一种依赖，是非常重要的能力。此外，面对网络上大量的信息，我们更需要培养批判性思维，学会分辨哪些信息是可靠的、哪些是需要进一步核实的，而不是照单全收。',
            elaborationEn: 'Firstly, technological developments change with each passing day — what is considered cutting-edge technology today may be superseded by something newer tomorrow. Therefore, maintaining a strong thirst for knowledge and curiosity, proactively exploring and learning new knowledge, is the most fundamental attitude for adapting to rapid change. Secondly, knowing how to make good use of technological tools and flexibly applying various digital resources to assist learning — rather than treating technology as something to depend upon — is a very important capability. Furthermore, faced with the vast amount of information online, we need even more to cultivate critical thinking, learning to distinguish which information is reliable and which requires further verification, rather than accepting everything at face value.',
            example:       '例如，在新加坡，学校已经开始在课程中引入计算思维（Computational Thinking）和编程教育，让学生从小学会运用逻辑思维来解决问题。这不只是为了让学生学会编写程序，更重要的是培养他们在面对复杂问题时，能有条不紊地分析和解决的能力——这种能力在科技日益发达的未来，将会显得越来越珍贵。',
            exampleEn:     'For example, in Singapore, schools have already begun incorporating Computational Thinking and coding education into the curriculum, teaching students from a young age to apply logical thinking to solve problems. This is not only to teach students how to write programs — more importantly, it cultivates their ability to systematically analyse and resolve complex problems — a capability that will become increasingly precious in a future where technology is ever more advanced.',
            link:          '总而言之，科技的发展是不可阻挡的趋势，而真正能在这个时代立于不败之地的，不是那些掌握最多科技工具的人，而是那些懂得如何思考、如何学习、如何与科技和谐共处的人。作为新加坡的未来主人翁，从小培养终身学习的精神和批判性思维，才是我们应对未来最有力的武器。',
            linkEn:         "In conclusion, technological development is an unstoppable trend, and those who will truly thrive in this era are not those who possess the most technological tools, but those who know how to think, how to learn, and how to coexist harmoniously with technology. As Singapore's future leaders, cultivating from young a spirit of lifelong learning and critical thinking is the most powerful weapon for us to face the future.",
          },
        },
      },
      targetKeywords: ['日新月异', '思考', '辅助工具', '灵活应用', '掌握'],
    },
  },

];

// ── Build final oralSets array ────────────────────────────────────────────────

_setNumber = 0; // reset counter before transform
export const oralSets: OralSet[] = RAW_VAULT.map(transform);
