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
            elaborationEn: "Firstly, the school could display eye-catching posters in the canteen reminding students to clear their trays and dispose of leftover food after meals, helping everyone build good habits. Secondly, the school could set up a \"Cleanliness Champion\" reward system, praising the class with the best canteen behaviour each month, using positive reinforcement to strengthen students' sense of self-discipline.",
            example:       '例如，我们学校曾经举办过"光盘达人"活动，鼓励同学们把碗里的饭菜吃完，并在宣传栏上展示做得好的班级。那段期间，食堂的卫生情况明显改善，同学们也更加自觉了。',
            exampleEn:     "For example, our school once held a \"Clean Plate Champion\" campaign, encouraging students to finish all the food in their bowls, and displaying the best-performing classes on the notice board. During that period, the canteen's hygiene improved noticeably and students became much more conscientious.",
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
        q1: { cn: '描述比赛中发生的意外以及同学的反应。', en: 'Describe the accident during the race and the classmate\'s reaction.' },
        q2: { cn: '你曾有过在困难中得到同学帮助的经历吗？', en: 'Have you ever had an experience where a classmate helped you during a difficulty?' },
        q3: { cn: '你认为互相帮助和比赛成绩哪个更重要？为什么？', en: 'Do you think friendship or competition results are more important? Why?' },
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
        q1: { cn: '录像中在美术室里的学生发生了什么事？', en: 'What happened among the students in the art room?' },
        q2: { cn: '在小组讨论或活动中，你会如何与同学沟通？', en: 'How do you communicate with classmates during group discussions or activities?' },
        q3: { cn: '你认为在学校里培养团队精神对未来有什么帮助？', en: 'How do you think fostering teamwork at school helps in the future?' },
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
        q1: { cn: '描述欢送会上同学们表达感激之情的方式。', en: 'Describe how the students expressed their gratitude at the farewell party.' },
        q2: { cn: '分享一个你最喜欢的老师的故事。', en: 'Share a story about your favourite teacher.' },
        q3: { cn: '你认为学生应该如何表现出对老师的尊重？', en: 'How do you think students should show respect to their teachers?' },
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
        q1: { cn: '录像中人们在熟食中心用餐后的行为有什么不同？', en: 'How do the behaviours of people after dining in the hawker centre differ in the video?' },
        q2: { cn: '你通常会自己收拾碗碟吗？为什么？', en: 'Do you usually clear your own dishes? Why?' },
        q3: { cn: '你认为政府强制执行回收托盘的计划是否有效？', en: 'Do you think the government\'s mandatory tray return scheme is effective?' },
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
        q1: { cn: '描述录像中公园里人们爱护环境和不爱护环境的行为。', en: 'Describe the behaviours of people caring for and not caring for the environment in the park.' },
        q2: { cn: '如果你看到同学乱丢垃圾，你会如何提醒他？', en: 'If you see a classmate littering, how would you remind them?' },
        q3: { cn: '你认为加强环保教育对保护新加坡的绿化环境有什么作用？', en: 'What role do you think strengthening environmental education plays in protecting Singapore\'s greenery?' },
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
        q1: { cn: '录像中在图书馆里发生了什么干扰他人的行为？', en: 'What disruptive behaviour occurred in the library in the video?' },
        q2: { cn: '在图书馆或电影院等需要安静的场所，你会注意什么？', en: 'In quiet places like libraries or cinemas, what would you pay attention to?' },
        q3: { cn: '为什么学会控制自己的音量是尊重他人的表现？', en: 'Why is learning to control your volume a sign of respect for others?' },
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
        q1: { cn: '描述录像中邻里之间互相帮助的情景。', en: 'Describe the scene of mutual help between neighbours in the video.' },
        q2: { cn: '你曾有过帮助邻居的经历吗？分享你的感受。', en: 'Have you ever had an experience of helping a neighbour? Share your feelings.' },
        q3: { cn: '为什么"远亲不如近邻"这句话在现代社会依然重要？', en: 'Why is the saying "a close neighbour is better than a distant relative" still important today?' },
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
        q1: { cn: '录像中同学们在乐龄中心做了哪些活动？', en: 'What activities did the students do at the senior centre in the video?' },
        q2: { cn: '如果你有空，你会选择什么样的义工服务？为什么？', en: 'If you had time, what kind of volunteer service would you choose? Why?' },
        q3: { cn: '你认为现在的年轻人应该如何关怀社会中的弱势群体？', en: 'How do you think young people today should care for vulnerable groups in society?' },
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
        q1: { cn: '描述录像中邻居们在一起庆祝的情景。', en: 'Describe the scene of neighbours celebrating together in the video.' },
        q2: { cn: '你参加过邻里举办的活动吗？描述一下那个活动。', en: 'Have you participated in any neighbourhood events? Describe that event.' },
        q3: { cn: '举办邻里联欢活动对促进种族和谐有什么帮助？', en: 'How do neighbourhood parties help promote racial harmony?' },
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
        q1: { cn: '录像中居民们在邻里花园里做了什么？', en: 'What did the residents do in the neighbourhood garden in the video?' },
        q2: { cn: '你对"甘榜精神"有什么理解？', en: 'What is your understanding of the "Kampong Spirit"?' },
        q3: { cn: '你认为邻里之间互相分享食物或资源有什么好处？', en: 'What are the benefits of neighbours sharing food or resources?' },
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
        q1: { cn: '录像中同学们在学校里如何进行废物利用和回收？', en: 'How did the students carry out waste reuse and recycling at school in the video?' },
        q2: { cn: '在家里，你和家人是如何实践"环保三字诀"（减少、重用、回收）的？', en: 'At home, how do you and your family practise the "3Rs" (Reduce, Reuse, Recycle)?' },
        q3: { cn: '你认为政府应该采取什么措施来鼓励更多国人参与环保？', en: 'What measures do you think the government should take to encourage more Singaporeans to participate in environmental protection?' },
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
        q1: { cn: '描述录像中海报展示的正确和错误用水行为。', en: 'Describe the correct and incorrect water usage behaviours shown in the poster in the video.' },
        q2: { cn: '除了节约用水，你在日常生活中还通过哪些方式保护自然资源？', en: 'Besides saving water, what other ways do you protect natural resources in your daily life?' },
        q3: { cn: '为什么从小培养孩子的环保习惯对社会的可持续发展很重要？', en: 'Why is fostering environmental habits in children important for the sustainable development of society?' },
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
        q1: { cn: '描述录像中人们在海边进行清洁活动的情景。', en: 'Describe the scene of people carrying out a cleanup activity at the beach in the video.' },
        q2: { cn: '你去过海边吗？你在那里通常会做些什么来保护环境？', en: 'Have you been to the beach? What do you usually do there to protect the environment?' },
        q3: { cn: '你认为这类社区清洁活动对提高公众的环保意识有帮助吗？为什么？', en: 'Do you think these community cleanup activities help raise public environmental awareness? Why?' },
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
        q1: { cn: '描述录像中食堂里发生的食物浪费现象。', en: 'Describe the food waste occurring in the canteen in the video.' },
        q2: { cn: '你在用餐时会如何确保不浪费食物？', en: 'How do you ensure you don\'t waste food when dining?' },
        q3: { cn: '你认为"光盘行动"在学校里推广有什么意义？', en: 'What is the significance of promoting the "Clear Your Plate" campaign in schools?' },
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
        q1: { cn: '根据图片，描述这家人在计划旅游时的过程和心情。', en: 'Based on the pictures, describe the family\'s process and mood while planning their trip.' },
        q2: { cn: '分享一个你和家人一起进行过的难忘活动。', en: 'Share a memorable activity you did with your family.' },
        q3: { cn: '在快节奏的新加坡，你认为家庭团聚对孩子的成长有什么重要性？', en: 'In fast-paced Singapore, what importance do you think family gatherings have for a child\'s growth?' },
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
        q1: { cn: '描述录像中关于阅读习惯的正确与错误做法。', en: 'Describe the correct and incorrect practices regarding reading habits in the video.' },
        q2: { cn: '你喜欢阅读吗？你最喜欢哪一类的书籍？为什么？', en: 'Do you like reading? What kind of books do you like most? Why?' },
        q3: { cn: '由于电子产品的普及，你认为如何能让更多青少年重拾阅读纸质书的兴趣？', en: 'Given the prevalence of electronic devices, how can we make more teenagers regain interest in reading physical books?' },
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
        q1: { cn: '描述录像中同学们在食堂里选择健康饮食的情景。', en: 'Describe the scene of students choosing healthy food in the canteen in the video.' },
        q2: { cn: '在日常生活中，你和家人是如何保持均衡饮食的？', en: 'In your daily life, how do you and your family maintain a balanced diet?' },
        q3: { cn: '你认为学校应该如何通过活动来提高学生的健康意识？', en: 'How do you think schools should raise students\' health awareness through activities?' },
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
        q1: { cn: '录像中描述了小孩如何管理自己的房间和私人物品？', en: 'How does the child in the video manage their room and personal belongings?' },
        q2: { cn: '除了收拾房间，你还会做哪些家务来分担父母的压力？', en: 'Besides tidying your room, what other chores do you do to ease your parents\' stress?' },
        q3: { cn: '你认为从小培养自理能力对孩子的未来有什么好处？', en: 'What are the benefits of fostering self-care skills in children from a young age?' },
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
        q1: { cn: '描述录像中发生的危险马路行为。', en: 'Describe the dangerous road behaviour shown in the video.' },
        q2: { cn: '如果你看到同学在过马路时玩手机，你会怎么做？', en: 'What would you do if you saw a classmate playing with their phone while crossing the road?' },
        q3: { cn: '除了马路安全，你认为学校还应该加强哪些方面的安全教育？', en: 'Besides road safety, what other aspects of safety education should the school strengthen?' },
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
        q1: { cn: '描述录像中孩子在面对网络社交时的反应。', en: "Describe the child's reaction when facing online social networking in the video." },
        q2: { cn: '你平时是如何管理自己的上网时间并确保安全的？', en: 'How do you usually manage your internet time and ensure safety?' },
        q3: { cn: '你认为家长在引导孩子正确使用网络方面应该扮演什么角色？', en: 'What role do you think parents should play in guiding children to use the internet correctly?' },
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
        q1: { cn: '描述录像中发生的居家不安全行为。', en: 'Describe the unsafe home behaviour occurring in the video.' },
        q2: { cn: '当你在家独自一人时，你会注意哪些安全事项？', en: 'When you are home alone, what safety matters do you pay attention to?' },
        q3: { cn: '为什么通过角色扮演来学习安全知识对小学生很有效？', en: 'Why is learning safety knowledge through role-playing effective for primary students?' },
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
        q1: { cn: '描述录像中楼梯间发生的意外过程。', en: 'Describe the process of the accident in the staircase in the video.' },
        q2: { cn: '你在学校里见过类似的不安全行为吗？你是如何处理的？', en: 'Have you seen similar unsafe behaviour at school? How did you handle it?' },
        q3: { cn: '你认为学生纠察员在维护校园安全方面起到了什么作用？', en: 'What role do you think student prefects play in maintaining school safety?' },
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
            point:       '我认为科技对人与人之间的关系既有正面的促进作用，也有不可忽视的负面影响，关键在于我们如何善用它。',
            elaboration: '从正面来看，科技让身处不同地方的家人和朋友能够随时保持联系，视频通话让异地亲情不再遥远；社交媒体也让人们更容易找到志同道合的朋友，分享彼此的生活。然而从负面来看，过度依赖电子产品会导致人们沉迷于虚拟世界，减少面对面的真实交流，进而削弱亲密感，甚至让家人在同一屋檐下却形同陌路。',
            example:     '例如，我的祖父母住在马来西亚，多亏了视频通话，我们每个星期都能见到彼此的脸庞，感受并不疏远；但与此同时，我也曾经历过和朋友出去游玩，大家却各自刷手机，彼此之间几乎没有真正交谈的尴尬时刻。',
            link:        '因此，科技本身并不是问题，问题在于我们的使用方式。只要我们懂得自律，在适当的时候放下手机、用心投入与身边人的互动，科技便能成为增进感情的工具，而不是阻隔人心的屏障。',
          },
            pointEn:       'I believe that technology has both positive effects that promote relationships between people, and negative impacts that cannot be ignored — the key lies in how we make good use of it.',
        },
            elaborationEn: 'On the positive side, technology allows family and friends in different places to stay in touch at any time, and video calls make distant family relationships feel close again; social media also makes it easier for people to find like-minded friends and share each other\'s lives. However, on the negative side, over-reliance on electronic devices can cause people to become absorbed in the virtual world, reducing face-to-face interaction and weakening intimacy — even making family members under the same roof feel like strangers.',
        q3: {
            exampleEn:     'For example, my grandparents live in Malaysia, and thanks to video calls, we can see each other\'s faces every week and do not feel distant. But at the same time, I have experienced the awkward situation of going out with friends, only to find everyone scrolling through their phones with barely any real conversation.',
          cn: '在你的家庭里，大家是如何平衡使用电子产品和家庭时间的？',
          keywords:    ['难忘', '印象深刻', '温馨时光', '珍惜', '不仅……也……', '感情深厚', '回味无穷', '家人陪伴', '心怀感恩', '倍感温暖'],
            linkEn:        'Therefore, technology itself is not the problem — the problem lies in how we use it. As long as we exercise self-discipline and put down our phones at the right moments to genuinely engage with the people around us, technology can become a tool for strengthening relationships rather than a barrier that separates hearts.',
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
        q1: { cn: '描述录像中乐龄人士面对新科技时的困惑以及年轻人的帮助。', en: "Describe the senior's confusion facing new technology and the young person's help in the video." },
        q2: { cn: '你曾教过家里的长辈使用过智能手机的功能吗？分享你的经历。', en: 'Have you ever taught your elders how to use smartphone functions? Share your experience.' },
        q3: { cn: '如何能让新加坡成为一个更具包容性的"智慧国"？', en: 'How can Singapore become a more inclusive "Smart Nation"?' },
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
        q1: { cn: '描述录像中送餐员辛勤工作的情景。', en: 'Describe the scene of the food delivery rider working hard in the video.' },
        q2: { cn: '你家经常叫外卖吗？你对送餐服务的便利性有什么看法？', en: 'Does your family order food delivery often? What are your views on its convenience?' },
        q3: { cn: '我们应该如何对这些在烈日或风雨中工作的服务人员表示尊重和体谅？', en: 'How should we show respect and empathy for these service workers who work in the sun or rain?' },
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
        q1: { cn: '描述录像中学生们如何利用AI辅助学习。', en: 'Describe how the students use AI to assist their learning in the video.' },
        q2: { cn: '你认为AI能取代老师吗？为什么？', en: 'Do you think AI can replace teachers? Why?' },
        q3: { cn: '面对快速发展的科技，小学生应该具备什么样的学习态度？', en: 'Facing fast-developing technology, what kind of learning attitude should primary students have?' },
      },
      targetKeywords: ['日新月异', '思考', '辅助工具', '灵活应用', '掌握'],
    },
  },

];

// ── Build final oralSets array ────────────────────────────────────────────────

_setNumber = 0; // reset counter before transform
export const oralSets: OralSet[] = RAW_VAULT.map(transform);
