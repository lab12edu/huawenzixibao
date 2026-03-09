// ============================================================
// oralData.ts — Huawen Zixibao Oral Practice Sets
// 10 sets mapped to real PSLE oral topics 2015–2024
// Post-2017 format: 旁白 + 4 video frames + 3 questions + vocab
// Reading passages use only level-appropriate characters
// ============================================================

export interface OralVocabItem {
  chinese: string;
  pinyin: string;
  english: string;
  exampleChinese?: string;
  exampleEnglish?: string;
}

export interface OralQuestion {
  questionChinese: string;
  questionEnglish: string;
  starterChinese: string;
  starterEnglish: string;
  modelAnswerChinese: string;
  modelAnswerEnglish: string;
  keyPhrases: string[];
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
  titleChinese: string;
  titleEnglish: string;
  introChinese: string;
  introEnglish: string;
  narratorChinese: string;
  narratorEnglish: string;
  frames: [OralVideoFrame, OralVideoFrame, OralVideoFrame, OralVideoFrame];
}

export interface OralSet {
  id: string;
  setNumber: number;
  themeChinese: string;
  themeEnglish: string;
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
}

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

export const oralSets: OralSet[] = [

  // ══════════════════════════════════════════════════════
  // SET 1 — 帮忙做家务  P3–P4
  // Based on: 2015 日常生活（厨房）/ 2021 责任感
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-001',
    setNumber: 1,
    themeChinese: '帮忙做家务',
    themeEnglish: 'Helping with Housework',
    moralChinese: '责任感',
    accentColour: '#E65100',
    levels: ['P3', 'P4'],
    psleYears: ['2015', '2021'],
    vocab: [
      { chinese: '家务', pinyin: 'jiā wù', english: 'household chores',
        exampleChinese: '做家务是每个人的责任。', exampleEnglish: 'Doing household chores is everyone\'s responsibility.' },
      { chinese: '摆碗筷', pinyin: 'bǎi wǎn kuài', english: 'set the table (lay bowls and chopsticks)',
        exampleChinese: '我帮妈妈摆碗筷。', exampleEnglish: 'I help Mum lay the bowls and chopsticks.' },
      { chinese: '折叠衣服', pinyin: 'zhé dié yī fu', english: 'fold clothes',
        exampleChinese: '姐姐帮婆婆折叠衣服。', exampleEnglish: 'Elder sister helps Grandma fold the clothes.' },
      { chinese: '清理垃圾', pinyin: 'qīng lǐ lā jī', english: 'clear the rubbish',
        exampleChinese: '弟弟负责清理垃圾。', exampleEnglish: 'Younger brother is in charge of clearing the rubbish.' },
      { chinese: '整理床铺', pinyin: 'zhěng lǐ chuáng pù', english: 'make the bed',
        exampleChinese: '每天早上我会整理床铺。', exampleEnglish: 'Every morning I make my bed.' },
      { chinese: '减轻负担', pinyin: 'jiǎn qīng fù dān', english: 'ease the burden',
        exampleChinese: '帮忙做家务可以减轻父母的负担。', exampleEnglish: 'Helping with chores can ease our parents\' burden.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中的孙子和孙女怎样帮忙婆婆做家务。',
        questionEnglish: 'Please talk about how the grandchildren in the video help their grandmother with household chores.',
        starterChinese: '录像中，孙女……孙子……',
        starterEnglish: 'In the video, the granddaughter… the grandson…',
        modelAnswerChinese: '录像中，婆婆在厨房炒菜，孙女把婆婆煮好的菜捧到餐桌上，摆好碗筷。用餐后，大孙子帮忙收拾碗碟、抹桌子；小孙子扫地，他扫得可认真啦，还蹲下来把每个角落扫干净，然后把垃圾装进塑料袋丢进垃圾槽里。孙女帮忙婆婆折叠衣服，然后收进衣柜里。',
        modelAnswerEnglish: 'In the video, Grandma is stir-frying in the kitchen. The granddaughter carries the cooked dishes to the dining table and lays out the bowls and chopsticks. After the meal, the older grandson helps collect the bowls and plates and wipes the table; the younger grandson sweeps the floor very carefully, even squatting down to clean every corner, then puts the rubbish into a plastic bag and throws it into the rubbish chute. The granddaughter helps Grandma fold the clothes and put them into the wardrobe.',
        keyPhrases: ['摆好碗筷', '收拾碗碟', '扫地', '折叠衣服'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你会帮忙父母做什么家务。',
        questionEnglish: 'Besides what you saw in the video, tell us what household chores you help your parents with.',
        starterChinese: '在家里，我会帮忙……',
        starterEnglish: 'At home, I help with…',
        modelAnswerChinese: '在家里，我会帮忙做很多家务。每天早上起身后，我会自己整理床铺，折被子。吃了饭，我会帮忙妈妈洗杯、洗碗、拖地。我也会晾衣服、收衣服。有时候，厕所脏了，我也会主动清洗马桶。做家务丰富了我的生活知识，这是课本里学不到的。',
        modelAnswerEnglish: 'At home, I help with many household chores. Every morning after getting up, I make my own bed and fold the blanket. After meals, I help Mum wash the cups, wash the bowls, and mop the floor. I also hang up and bring in the laundry. Sometimes when the toilet is dirty, I will proactively clean the toilet bowl. Doing housework has enriched my life knowledge — something that cannot be learnt from textbooks.',
        keyPhrases: ['整理床铺', '洗碗', '拖地', '主动'],
      },
      q3: {
        questionChinese: '你认为小学生应该帮忙做家务吗？为什么？',
        questionEnglish: 'Do you think primary school students should help with household chores? Why?',
        starterChinese: '我认为小学生应该帮忙做家务。做家务……',
        starterEnglish: 'I think primary school students should help with household chores. Doing chores…',
        modelAnswerChinese: '我认为小学生应该帮忙做家务。做家务是家里每个成员的责任，大家都应该尽一份力。孩子帮忙做家务，可以减轻父母的负担，也可以培养责任感。我虽然是个小学生，学校功课繁多，但还是有时间做家务。我常常观察妈妈怎么做，妈妈也会一步一步示范讲解，完成了一项家务我会感到很开心，做家务增强了我的自信，培养了我解决问题的能力。',
        modelAnswerEnglish: 'I think primary school students should help with household chores. Doing housework is the responsibility of every family member and everyone should do their part. When children help with chores, it eases their parents\' burden and also cultivates a sense of responsibility. Although I am a primary school student with a lot of schoolwork, I still find time to do chores. I often observe how Mum does things, and she explains step by step. After completing a chore, I feel very happy. Doing housework builds my confidence and develops my problem-solving ability.',
        keyPhrases: ['减轻负担', '培养责任感', '尽一份力', '解决问题的能力'],
      },
      q3TipByLevel: {
        advanced: '用"不仅……而且……"来连接两个好处，例如"帮忙做家务不仅能减轻父母的负担，而且能培养我们的责任感。"',
        standard: '说出两个理由，用"第一……第二……"来组织你的回答。',
      },
    },
    passage: {
      paragraphs: [
        '今天是星期六，妈妈要去买东西。出门前，她对小明说："小明，你今天要帮忙做家务。"',
        '小明点点头，说："好的，妈妈，你放心去吧！"',
        '妈妈走了以后，小明先把地扫干净，再拖地。他还把自己的房间整理好，把玩具放回原处。',
        '妈妈回来后，看到家里干干净净的，非常开心。她摸着小明的头说："小明真能干！"小明听了，心里甜滋滋的。',
      ],
      difficulty: '基础',
      characterCount: 120,
    },
    pictureStory: {
      titleChinese: '帮忙做家务',
      titleEnglish: 'Helping with Housework',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '做家务是每个家庭成员的责任，大家生活在一起都要尽一份力。',
      narratorEnglish: 'Doing household chores is the responsibility of every family member; everyone living together should do their part.',
      frames: [
        {
          descriptionChinese: '婆婆在厨房炒菜，孙女把食物捧到餐桌上，摆好碗筷',
          descriptionEnglish: 'Grandma cooks in the kitchen; granddaughter carries food to the table and sets out bowls and chopsticks',
          captionChinese: '①婆婆在厨房炒菜，孙女把食物捧到餐桌上，摆好碗筷。',
          captionEnglish: '① Grandma is cooking in the kitchen. The granddaughter carries the food to the dining table and lays out the bowls and chopsticks.',
        },
        {
          descriptionChinese: '用餐后，大孙子帮忙收拾碗碟、抹桌子',
          descriptionEnglish: 'After the meal, the older grandson helps collect dishes and wipe the table',
          captionChinese: '②用餐后，大孙子帮忙收拾碗碟、抹桌子。',
          captionEnglish: '② After the meal, the older grandson helps collect the bowls and plates and wipes the table.',
        },
        {
          descriptionChinese: '小孙子扫地、清理垃圾',
          descriptionEnglish: 'The younger grandson sweeps the floor and clears the rubbish',
          captionChinese: '③小孙子扫地，清理垃圾。',
          captionEnglish: '③ The younger grandson sweeps the floor and clears the rubbish.',
        },
        {
          descriptionChinese: '孙女帮忙婆婆折叠衣服，收进衣柜里',
          descriptionEnglish: 'The granddaughter helps Grandma fold clothes and put them in the wardrobe',
          captionChinese: '④孙女帮忙婆婆折叠衣服，收进衣柜里。',
          captionEnglish: '④ The granddaughter helps Grandma fold the clothes and put them away in the wardrobe.',
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════
  // SET 2 — 关心朋友  P3–P4
  // Based on: 2017 友谊（关心朋友）
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-002',
    setNumber: 2,
    themeChinese: '关心朋友',
    themeEnglish: 'Caring for Friends',
    moralChinese: '友谊',
    accentColour: '#1565C0',
    levels: ['P3', 'P4'],
    psleYears: ['2017'],
    vocab: [
      { chinese: '关心', pinyin: 'guān xīn', english: 'to care for / show concern',
        exampleChinese: '朋友生病了，我去关心他。', exampleEnglish: 'My friend was sick, so I went to care for him.' },
      { chinese: '探望', pinyin: 'tàn wàng', english: 'to visit (someone who is ill)',
        exampleChinese: '我去医院探望生病的同学。', exampleEnglish: 'I visited my sick classmate in hospital.' },
      { chinese: '安慰', pinyin: 'ān wèi', english: 'to comfort',
        exampleChinese: '朋友难过时，我会安慰他。', exampleEnglish: 'When my friend is sad, I comfort him.' },
      { chinese: '分享', pinyin: 'fēn xiǎng', english: 'to share',
        exampleChinese: '我和朋友分享食物。', exampleEnglish: 'I share food with my friend.' },
      { chinese: '友情', pinyin: 'yǒu qíng', english: 'friendship',
        exampleChinese: '友情是很宝贵的。', exampleEnglish: 'Friendship is very precious.' },
      { chinese: '帮助', pinyin: 'bāng zhù', english: 'to help',
        exampleChinese: '我帮助同学做功课。', exampleEnglish: 'I help my classmate with schoolwork.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中的同学是怎样关心生病朋友的。',
        questionEnglish: 'Please talk about how the students in the video show care for their sick friend.',
        starterChinese: '录像中，同学们……',
        starterEnglish: 'In the video, the students…',
        modelAnswerChinese: '录像中，小华生病在家休息。他的同学们放学后，一起到小华家去探望他。他们带来了水果和作业，把当天学校的功课告诉小华，还帮他补习落下的课程。他们陪小华聊天，让小华心情好多了。小华的妈妈非常感激，说小华有这样的好朋友真幸福。',
        modelAnswerEnglish: 'In the video, Xiao Hua is resting at home because he is sick. After school, his classmates went together to visit him at his home. They brought fruit and schoolwork, told Xiao Hua about the lessons that day, and helped him catch up on the work he had missed. They kept Xiao Hua company and chatted with him, making him feel much better. Xiao Hua\'s mother was very grateful and said Xiao Hua was lucky to have such good friends.',
        keyPhrases: ['探望', '带来水果', '补习', '陪伴'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你曾经怎样关心过你的朋友。',
        questionEnglish: 'Besides what you saw in the video, tell us about a time you showed care for a friend.',
        starterChinese: '有一次，我的朋友……我……',
        starterEnglish: 'Once, my friend… I…',
        modelAnswerChinese: '有一次，我的朋友小丽在学校跌倒，膝盖擦破了皮，哭了起来。我马上跑过去，扶她起来，带她到医务室处理伤口。我也帮她拿书包，陪她一起走。后来她好多了，谢谢我帮了她。我觉得朋友有难的时候，我们应该互相帮忙，这样友情才会更深厚。',
        modelAnswerEnglish: 'Once, my friend Xiao Li fell down at school and scraped her knee. She started to cry. I immediately ran over, helped her up, and brought her to the medical room to get her wound treated. I also carried her school bag and walked with her. Later she felt better and thanked me for helping her. I feel that when a friend is in trouble, we should help each other — this makes our friendship even deeper.',
        keyPhrases: ['扶她起来', '医务室', '帮拿书包', '互相帮忙'],
      },
      q3: {
        questionChinese: '你认为我们应该怎样对待朋友？',
        questionEnglish: 'How do you think we should treat our friends?',
        starterChinese: '我认为我们应该……',
        starterEnglish: 'I think we should…',
        modelAnswerChinese: '我认为我们应该真心对待朋友。首先，我们要诚实，不对朋友说谎，这样朋友才会信任我们。其次，朋友有困难时，我们要主动帮忙，不能袖手旁观。第三，我们要学会分享，把快乐的事情告诉朋友，也在朋友伤心时安慰他。好的友情需要用心去维护，只要我们真心对朋友，友情就会越来越深。',
        modelAnswerEnglish: 'I think we should treat our friends sincerely. First, we must be honest and not lie to friends, so that they will trust us. Second, when a friend is in difficulty, we should take the initiative to help and not stand aside doing nothing. Third, we should learn to share — tell friends about happy things and comfort them when they are sad. A good friendship needs to be nurtured wholeheartedly. As long as we are sincere with our friends, the friendship will grow deeper and deeper.',
        keyPhrases: ['诚实', '主动帮忙', '分享', '真心'],
      },
      q3TipByLevel: {
        advanced: '用"首先……其次……第三……"来列举三点，每点用一句话解释，展示有条理的表达能力。',
        standard: '说出两种对待朋友的方法，用"第一……第二……"来组织你的回答，每点举一个例子。',
      },
    },
    passage: {
      paragraphs: [
        '小文和小华是好朋友。一天，小文生病了，不能上学。小华很担心他。',
        '放学后，小华买了一些水果，去小文家探望他。小文看到小华来了，非常高兴。',
        '小华把当天的功课告诉小文，还帮他讲解不明白的地方。小文听了，心里暖暖的。',
        '小文的妈妈说："小华，你真是个好朋友！"小华笑着说："朋友就应该互相帮忙嘛！"',
      ],
      difficulty: '基础',
      characterCount: 116,
    },
    pictureStory: {
      titleChinese: '关心生病的朋友',
      titleEnglish: 'Caring for a Sick Friend',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '真正的友谊，是在朋友需要帮助的时候，能够伸出援手，关心和陪伴他。',
      narratorEnglish: 'True friendship means being able to reach out, show care, and keep a friend company when they need help.',
      frames: [
        {
          descriptionChinese: '小华生病躺在床上，妈妈在旁照顾',
          descriptionEnglish: 'Xiao Hua lies sick in bed with his mother caring for him',
          captionChinese: '①小华生病了，躺在床上休息，妈妈在旁照顾他。',
          captionEnglish: '① Xiao Hua is sick and resting in bed; his mother is by his side taking care of him.',
        },
        {
          descriptionChinese: '同学们放学后一起来到小华家，带着水果和作业',
          descriptionEnglish: 'Classmates come to Xiao Hua\'s home after school, bringing fruit and schoolwork',
          captionChinese: '②放学后，同学们一起来到小华家，带来了水果和当天的作业。',
          captionEnglish: '② After school, the classmates came together to Xiao Hua\'s home, bringing fruit and the day\'s schoolwork.',
        },
        {
          descriptionChinese: '同学们帮小华补习，讲解当天的功课',
          descriptionEnglish: 'Classmates help Xiao Hua catch up, explaining the day\'s lessons',
          captionChinese: '③同学们帮小华补习，把当天的功课一一讲解给他听。',
          captionEnglish: '③ The classmates helped Xiao Hua catch up on his studies, explaining each part of the day\'s lessons to him.',
        },
        {
          descriptionChinese: '大家一起聊天欢笑，小华心情好多了',
          descriptionEnglish: 'Everyone chats and laughs together; Xiao Hua feels much better',
          captionChinese: '④大家一起聊天欢笑，小华的心情好多了，妈妈在旁感激地点点头。',
          captionEnglish: '④ Everyone chats and laughs together; Xiao Hua feels much better, and his mother nods gratefully beside them.',
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════
  // SET 3 — 邻里关系  P3–P4
  // Based on: 2017 邻里关系（在走廊堆放物品）
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-003',
    setNumber: 3,
    themeChinese: '邻里关系',
    themeEnglish: 'Neighbourly Relations',
    moralChinese: '公德心',
    accentColour: '#00695C',
    levels: ['P3', 'P4'],
    psleYears: ['2017'],
    vocab: [
      { chinese: '邻居', pinyin: 'lín jū', english: 'neighbour',
        exampleChinese: '我们和邻居相处很好。', exampleEnglish: 'We get along well with our neighbours.' },
      { chinese: '走廊', pinyin: 'zǒu láng', english: 'corridor',
        exampleChinese: '走廊是公共的地方。', exampleEnglish: 'The corridor is a common area.' },
      { chinese: '公共', pinyin: 'gōng gòng', english: 'public / communal',
        exampleChinese: '我们要爱护公共设施。', exampleEnglish: 'We should take care of public facilities.' },
      { chinese: '影响', pinyin: 'yǐng xiǎng', english: 'to affect / influence',
        exampleChinese: '乱放东西会影响邻居。', exampleEnglish: 'Leaving things around affects the neighbours.' },
      { chinese: '礼貌', pinyin: 'lǐ mào', english: 'polite / courtesy',
        exampleChinese: '我们要有礼貌地和邻居说话。', exampleEnglish: 'We should speak politely to our neighbours.' },
      { chinese: '和睦', pinyin: 'hé mù', english: 'harmonious',
        exampleChinese: '邻居之间要和睦相处。', exampleEnglish: 'Neighbours should live in harmony.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中发生了什么事，邻居们是怎么处理的。',
        questionEnglish: 'Please talk about what happened in the video and how the neighbours dealt with it.',
        starterChinese: '录像中，……',
        starterEnglish: 'In the video,…',
        modelAnswerChinese: '录像中，一户人家把很多东西堆放在走廊上，包括自行车、箱子和杂物，走廊变得很窄，邻居们走过去都很不方便。其中一位邻居伯伯差点被绊倒。后来，一位邻居有礼貌地去敲门，请那户人家把东西收好，不要堆放在走廊上，以免影响大家的出入安全。那户人家听了，觉得很惭愧，马上把东西搬进屋里。',
        modelAnswerEnglish: 'In the video, a household piled many items in the corridor, including bicycles, boxes, and miscellaneous items, making the corridor very narrow and difficult for neighbours to pass through. One elderly neighbour almost tripped over the items. Later, a neighbour politely knocked on the door and asked that household to put their things away and not pile them in the corridor, so as not to affect everyone\'s safety when entering and leaving. Upon hearing this, that household felt ashamed and immediately moved the items inside.',
        keyPhrases: ['堆放物品', '走廊变窄', '有礼貌地', '搬进屋里'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你是怎样和邻居友好相处的。',
        questionEnglish: 'Besides what you saw in the video, tell us how you get along well with your neighbours.',
        starterChinese: '在日常生活中，我会……',
        starterEnglish: 'In daily life, I…',
        modelAnswerChinese: '在日常生活中，我会主动和邻居打招呼，见到他们说"早安"或"你好"。我也会帮忙老人家按电梯，帮他们拿东西。在家里，我们不会在夜晚大声喧哗，以免影响邻居休息。有时候，妈妈煮了好吃的东西，也会分一些给邻居。我觉得邻居之间要互相关心、和睦相处，这样大家住在一起才会开心。',
        modelAnswerEnglish: 'In daily life, I take the initiative to greet my neighbours, saying "Good morning" or "Hello" when I see them. I also help elderly neighbours press the lift button and carry their things. At home, we do not make loud noise at night so as not to disturb our neighbours\' rest. Sometimes when Mum cooks something delicious, she shares some with the neighbours. I feel that neighbours should care for each other and live in harmony — that way everyone will be happy living together.',
        keyPhrases: ['主动打招呼', '帮忙老人家', '不大声喧哗', '分享'],
      },
      q3: {
        questionChinese: '你认为好邻居应该怎样相处？',
        questionEnglish: 'How do you think good neighbours should get along?',
        starterChinese: '我认为好邻居应该……',
        starterEnglish: 'I think good neighbours should…',
        modelAnswerChinese: '我认为好邻居应该互相尊重，不做影响别人的事。例如，不把东西堆放在走廊，不在夜晚大声喧哗，保持公共地方整洁。此外，好邻居也应该互相关心，在对方有困难时伸出援手。我们住在同一个社区，就像一个大家庭一样，大家和睦相处，社区才会变得更美好。',
        modelAnswerEnglish: 'I think good neighbours should respect each other and not do things that affect others. For example, they should not pile items in the corridor, not make loud noise at night, and keep communal areas clean. In addition, good neighbours should also care for each other and lend a helping hand when the other is in difficulty. We live in the same community, like one big family — when everyone lives in harmony, the community becomes a better place.',
        keyPhrases: ['互相尊重', '公共地方整洁', '互相关心', '和睦相处'],
      },
      q3TipByLevel: {
        advanced: '用"不仅……而且……"连接"尊重"和"关心"两个层面，例如"好邻居不仅要尊重别人，而且要在别人有困难时伸出援手。"',
        standard: '说出两件好邻居应该做的事，用"第一……第二……"来组织，每点用一个例子说明。',
      },
    },
    passage: {
      paragraphs: [
        '小丽家住在组屋里。她的邻居王伯伯是个老人，一个人住，家里没有人帮忙。',
        '有一天，小丽看见王伯伯提着很多东西，走得很辛苦。她马上跑过去说："王伯伯，我帮你拿！"',
        '王伯伯看着小丽，笑着说："谢谢你，小丽，你真是个好孩子！"',
        '小丽的妈妈知道后，也常常把家里做的饭菜分给王伯伯。王伯伯很感动，说能有这样的邻居，真是太幸福了。',
      ],
      difficulty: '基础',
      characterCount: 118,
    },
    pictureStory: {
      titleChinese: '走廊不是仓库',
      titleEnglish: 'The Corridor Is Not a Storeroom',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '走廊是大家共用的地方，我们要保持走廊畅通，不堆放杂物，这样邻居才能安全出入。',
      narratorEnglish: 'The corridor is a shared space for everyone. We must keep it clear and not pile up miscellaneous items, so that neighbours can pass through safely.',
      frames: [
        {
          descriptionChinese: '一户人家把自行车、箱子堆放在走廊上',
          descriptionEnglish: 'A household piles bicycles and boxes in the corridor',
          captionChinese: '①一户人家把自行车、箱子和杂物都堆放在走廊上，走廊变得很窄。',
          captionEnglish: '① A household piles their bicycles, boxes, and miscellaneous items in the corridor, making it very narrow.',
        },
        {
          descriptionChinese: '邻居老伯伯经过时差点被绊倒',
          descriptionEnglish: 'An elderly neighbour almost trips while walking past',
          captionChinese: '②邻居老伯伯经过时，差点被杂物绊倒，吓了一跳。',
          captionEnglish: '② An elderly neighbour almost trips over the items when passing by, getting a fright.',
        },
        {
          descriptionChinese: '一位邻居有礼貌地去敲门，反映问题',
          descriptionEnglish: 'A neighbour politely knocks on the door to raise the issue',
          captionChinese: '③一位邻居有礼貌地去敲门，请那户人家不要在走廊堆放东西。',
          captionEnglish: '③ A neighbour politely knocks on the door and asks that household not to pile things in the corridor.',
        },
        {
          descriptionChinese: '那户人家把东西搬进屋里，走廊恢复畅通',
          descriptionEnglish: 'The household moves their things inside; the corridor is clear again',
          captionChinese: '④那户人家听了，马上把东西搬进屋里，走廊又变得畅通了，大家都很开心。',
          captionEnglish: '④ That household listened and immediately moved their things inside. The corridor became clear again, and everyone was happy.',
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════
  // SET 4 — 图书馆公德心  P3–P4
  // Based on: 2018 公德心（图书馆）
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-004',
    setNumber: 4,
    themeChinese: '图书馆公德心',
    themeEnglish: 'Civic Behaviour in the Library',
    moralChinese: '公德心',
    accentColour: '#00695C',
    levels: ['P3', 'P4'],
    psleYears: ['2018'],
    vocab: [
      { chinese: '图书馆', pinyin: 'tú shū guǎn', english: 'library',
        exampleChinese: '我每周去图书馆借书。', exampleEnglish: 'I go to the library to borrow books every week.' },
      { chinese: '安静', pinyin: 'ān jìng', english: 'quiet',
        exampleChinese: '图书馆里要保持安静。', exampleEnglish: 'We must keep quiet in the library.' },
      { chinese: '爱护', pinyin: 'ài hù', english: 'to take care of / cherish',
        exampleChinese: '我们要爱护图书馆的书。', exampleEnglish: 'We should take care of the library\'s books.' },
      { chinese: '归还', pinyin: 'guī huán', english: 'to return (borrowed items)',
        exampleChinese: '请按时归还借来的书。', exampleEnglish: 'Please return borrowed books on time.' },
      { chinese: '公德心', pinyin: 'gōng dé xīn', english: 'civic-mindedness',
        exampleChinese: '我们要有公德心，爱护公物。', exampleEnglish: 'We should be civic-minded and take care of public property.' },
      { chinese: '遵守', pinyin: 'zūn shǒu', english: 'to abide by / observe',
        exampleChinese: '我们要遵守图书馆的规则。', exampleEnglish: 'We must abide by the library rules.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中的同学在图书馆里有哪些不好的行为，以及后来发生了什么事。',
        questionEnglish: 'Please talk about the inappropriate behaviour of the students in the library in the video, and what happened afterwards.',
        starterChinese: '录像中，有些同学……',
        starterEnglish: 'In the video, some students…',
        modelAnswerChinese: '录像中，有些同学在图书馆里大声说话，影响了其他人看书。也有同学把书随手乱放，不放回原处。有一个同学还在书上乱写乱画，把书弄脏了。图书馆管理员发现后，过来提醒他们要保持安静，爱护书本，遵守图书馆的规则。那些同学听了，都感到很惭愧，马上改正了自己的行为。',
        modelAnswerEnglish: 'In the video, some students were talking loudly in the library, disturbing other people who were reading. Some students also left books lying around without returning them to their proper place. One student was even scribbling in a book, making it dirty. When the librarian noticed, she came over to remind them to keep quiet, take care of the books, and follow the library rules. Upon hearing this, those students felt ashamed and immediately corrected their behaviour.',
        keyPhrases: ['大声说话', '乱放书', '乱写乱画', '改正行为'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你在图书馆里会怎么做。',
        questionEnglish: 'Besides what you saw in the video, tell us what you do when you are in the library.',
        starterChinese: '在图书馆里，我会……',
        starterEnglish: 'In the library, I…',
        modelAnswerChinese: '在图书馆里，我会保持安静，不大声说话，不打扰其他人。我借书时，会小心翻阅，不折书角，不在书上写字。看完的书，我会放回原来的地方，让下一个人容易找到。如果要和朋友说话，我会走到外面去，不在图书馆里喧哗。我觉得大家都要有公德心，才能让图书馆保持整洁和安静。',
        modelAnswerEnglish: 'In the library, I keep quiet and do not speak loudly or disturb others. When I borrow books, I handle them carefully, not folding the corners or writing in them. After reading, I return the books to their original place so the next person can easily find them. If I need to talk to a friend, I step outside so as not to make noise in the library. I feel that everyone must be civic-minded to keep the library tidy and quiet.',
        keyPhrases: ['保持安静', '小心翻阅', '放回原处', '公德心'],
      },
      q3: {
        questionChinese: '你认为为什么我们在公共场所要有公德心？',
        questionEnglish: 'Why do you think we need to be civic-minded in public places?',
        starterChinese: '我认为在公共场所要有公德心，因为……',
        starterEnglish: 'I think we need to be civic-minded in public places because…',
        modelAnswerChinese: '我认为在公共场所要有公德心，因为公共场所是大家共用的地方，我们的行为会影响到其他人。例如，在图书馆大声说话，会打扰到正在专心看书的人；乱放书，会让其他人找不到书。如果每个人都有公德心，公共场所就会变得更整洁、更舒适，大家都能好好享用这些设施。公德心不只是为了别人，也是为了我们自己。',
        modelAnswerEnglish: 'I think we need to be civic-minded in public places because they are shared by everyone, and our behaviour affects others. For example, talking loudly in the library disturbs people who are concentrating on reading; leaving books out of place makes it hard for others to find them. If everyone is civic-minded, public places will become tidier and more comfortable, and everyone can enjoy these facilities well. Being civic-minded is not just for others — it is also for ourselves.',
        keyPhrases: ['共用的地方', '影响别人', '整洁舒适', '为了自己'],
      },
      q3TipByLevel: {
        advanced: '用"不只是……也是……"来说明公德心对自己和他人都有好处，展示全面的思考。',
        standard: '说出一个在图书馆不守规矩会带来的问题，然后解释为什么公德心很重要。',
      },
    },
    passage: {
      paragraphs: [
        '小英很喜欢去图书馆看书。图书馆里有很多书，她每次去都可以找到自己喜欢看的书。',
        '有一天，小英在图书馆看书，旁边一个小朋友一直大声说话，让她没办法专心看书。',
        '小英有礼貌地对那个小朋友说："请你小声一点，图书馆里要安静。"那个小朋友听了，马上小声了。',
        '小英觉得图书馆是大家的地方，我们都要好好爱护，遵守规则，这样大家才能好好看书。',
      ],
      difficulty: '基础',
      characterCount: 122,
    },
    pictureStory: {
      titleChinese: '爱护图书馆',
      titleEnglish: 'Taking Care of the Library',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '图书馆是大家共用的地方，我们要保持安静，爱护书本，遵守规则，做个有公德心的好公民。',
      narratorEnglish: 'The library is a shared space for everyone. We must keep quiet, take care of the books, follow the rules, and be civic-minded citizens.',
      frames: [
        {
          descriptionChinese: '几个同学在图书馆大声说话、嬉笑',
          descriptionEnglish: 'Several students talking loudly and laughing in the library',
          captionChinese: '①几个同学在图书馆里大声说话、嬉笑，影响了其他人看书。',
          captionEnglish: '① Several students are talking loudly and laughing in the library, disturbing others who are reading.',
        },
        {
          descriptionChinese: '一个同学在书上乱写乱画',
          descriptionEnglish: 'A student scribbling in a book',
          captionChinese: '②一个同学在书上乱写乱画，把图书馆的书弄脏了。',
          captionEnglish: '② A student is scribbling in a book, dirtying the library\'s books.',
        },
        {
          descriptionChinese: '图书馆管理员过来提醒他们遵守规则',
          descriptionEnglish: 'The librarian comes over to remind them to follow the rules',
          captionChinese: '③图书馆管理员过来，有礼貌地提醒同学们要保持安静，爱护书本。',
          captionEnglish: '③ The librarian comes over and politely reminds the students to keep quiet and take care of the books.',
        },
        {
          descriptionChinese: '同学们惭愧地改正，安静地看书',
          descriptionEnglish: 'The students feel ashamed and correct themselves, reading quietly',
          captionChinese: '④同学们感到很惭愧，马上安静下来，把书放回原处，认真看书。',
          captionEnglish: '④ The students feel ashamed, immediately quieten down, return the books to their proper places, and read attentively.',
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════
  // SET 5 — 保持环境清洁  P4–P5
  // Based on: 2019 课题二 / 2023 课题一
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-005',
    setNumber: 5,
    themeChinese: '保持环境清洁',
    themeEnglish: 'Keeping the Environment Clean',
    moralChinese: '公德心',
    accentColour: '#2E7D32',
    levels: ['P4', 'P5'],
    psleYears: ['2019', '2023'],
    vocab: [
      { chinese: '环境卫生', pinyin: 'huán jìng wèi shēng', english: 'environmental hygiene / cleanliness',
        exampleChinese: '保持环境卫生是大家的责任。', exampleEnglish: 'Maintaining environmental hygiene is everyone\'s responsibility.' },
      { chinese: '随手', pinyin: 'suí shǒu', english: 'conveniently / as one goes',
        exampleChinese: '请随手关门。', exampleEnglish: 'Please close the door as you go.' },
      { chinese: '垃圾桶', pinyin: 'lā jī tǒng', english: 'rubbish bin',
        exampleChinese: '请把垃圾丢进垃圾桶。', exampleEnglish: 'Please throw rubbish into the bin.' },
      { chinese: '归还', pinyin: 'guī huán', english: 'to return (items)',
        exampleChinese: '用完餐盘要归还。', exampleEnglish: 'Return the tray after eating.' },
      { chinese: '负责任', pinyin: 'fù zé rèn', english: 'responsible',
        exampleChinese: '我们要对自己的行为负责任。', exampleEnglish: 'We must be responsible for our own actions.' },
      { chinese: '自觉', pinyin: 'zì jué', english: 'self-discipline / to do something of one\'s own accord',
        exampleChinese: '我们要自觉保持课室整洁。', exampleEnglish: 'We should keep the classroom tidy of our own accord.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中的同学是怎样保持课室清洁的。',
        questionEnglish: 'Please talk about how the students in the video keep their classroom clean.',
        starterChinese: '录像中，同学们……',
        starterEnglish: 'In the video, the students…',
        modelAnswerChinese: '录像中，放学后，同学们自觉地留下来打扫课室。有的同学负责扫地，把地上的纸屑和垃圾扫干净；有的同学擦黑板，把黑板上的字迹全部擦掉；有的同学整理桌椅，把课桌排列整齐。打扫完毕后，大家把垃圾收进垃圾袋，一起提到走廊的垃圾桶里。课室变得干干净净，同学们都感到很有成就感。',
        modelAnswerEnglish: 'In the video, after school, the students voluntarily stayed behind to clean the classroom. Some students swept the floor, sweeping up all the scraps of paper and rubbish; some wiped the blackboard, erasing all the writing on it; some tidied the desks and chairs, arranging them neatly. After cleaning, everyone collected the rubbish into bags and brought it to the rubbish bin in the corridor together. The classroom became spotlessly clean, and the students all felt a great sense of achievement.',
        keyPhrases: ['自觉', '扫地', '擦黑板', '整理桌椅'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你在学校或家里是怎样保持环境清洁的。',
        questionEnglish: 'Besides what you saw in the video, tell us how you keep your school or home environment clean.',
        starterChinese: '在学校，我会……在家里，我会……',
        starterEnglish: 'At school, I… At home, I…',
        modelAnswerChinese: '在学校，我会把吃完的食物包装丢进垃圾桶，不乱丢垃圾。在食堂吃完饭后，我会自觉把碗盘归还到归还处，把桌面擦干净。在家里，我会帮忙倒垃圾，把垃圾袋放进走廊的垃圾槽。我也会把自己的房间整理好，不让杂物堆积。保持环境清洁不只是清洁工的责任，而是每个人的责任。',
        modelAnswerEnglish: 'At school, I throw food packaging into the rubbish bin and do not litter. After eating in the canteen, I voluntarily return the bowls and plates to the return area and wipe the table clean. At home, I help take out the rubbish and put the rubbish bag into the rubbish chute in the corridor. I also keep my room tidy and do not let clutter pile up. Keeping the environment clean is not just the cleaner\'s responsibility — it is everyone\'s responsibility.',
        keyPhrases: ['归还碗盘', '擦干净', '倒垃圾', '每个人的责任'],
      },
      q3: {
        questionChinese: '你认为我们应该怎样培养保持环境清洁的好习惯？',
        questionEnglish: 'How do you think we can cultivate good habits of keeping the environment clean?',
        starterChinese: '我认为我们可以……来培养保持环境清洁的好习惯。',
        starterEnglish: 'I think we can cultivate good habits of keeping the environment clean by…',
        modelAnswerChinese: '我认为我们可以从小事做起，培养保持环境清洁的好习惯。首先，我们要以身作则，不管在哪里都把垃圾丢进垃圾桶，不乱丢垃圾。其次，看到垃圾，即使不是自己丢的，也可以顺手捡起来丢掉。第三，如果看到朋友乱丢垃圾，我们可以有礼貌地提醒他们。学校和家长也应该从小教导孩子爱护环境的重要性，让孩子从小养成好习惯。',
        modelAnswerEnglish: 'I think we can start from small things to cultivate good habits of keeping the environment clean. First, we should lead by example — no matter where we are, throw rubbish into the bin and never litter. Second, when we see rubbish, even if we did not drop it, we can pick it up and throw it away. Third, if we see friends littering, we can politely remind them. Schools and parents should also teach children from a young age about the importance of caring for the environment, so that children develop good habits from an early age.',
        keyPhrases: ['以身作则', '顺手捡起', '有礼貌地提醒', '从小养成'],
      },
      q3TipByLevel: {
        advanced: '用"不仅……而且……"连接个人行动和影响他人，例如"我们不仅要以身作则，而且要影响身边的人一起爱护环境。"',
        standard: '说出两个养成清洁好习惯的方法，用"首先……其次……"来组织你的回答。',
      },
    },
    passage: {
      paragraphs: [
        '学校的食堂每天都有很多同学在那里吃饭。可是，有些同学吃完饭后，就把碗盘留在桌上，不去归还。',
        '小明觉得这样做是不对的，食堂的阿姨每天都要清理那么多碗盘，一定很辛苦。',
        '于是，他开始以身作则，每次吃完饭，都自觉地把碗盘归还到归还处，还把桌面擦干净。',
        '慢慢地，越来越多的同学看到小明这样做，也开始跟着做了。食堂变得越来越整洁，食堂的阿姨笑着说："谢谢同学们！"',
      ],
      difficulty: '中级',
      characterCount: 140,
    },
    pictureStory: {
      titleChinese: '保持课室整洁',
      titleEnglish: 'Keeping the Classroom Tidy',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '课室是我们每天学习的地方，保持课室整洁是每一位同学的责任。只要大家同心协力，我们的学习环境就会变得更美好。',
      narratorEnglish: 'The classroom is where we learn every day. Keeping it tidy is every student\'s responsibility. As long as everyone works together, our learning environment will become a better place.',
      frames: [
        {
          descriptionChinese: '放学后，同学们自觉留下来打扫课室',
          descriptionEnglish: 'After school, students voluntarily stay to clean the classroom',
          captionChinese: '①放学后，同学们自觉留下来，分工打扫课室。',
          captionEnglish: '① After school, the students voluntarily stay behind and divide the work to clean the classroom.',
        },
        {
          descriptionChinese: '同学们扫地、擦黑板、整理桌椅',
          descriptionEnglish: 'Students sweep the floor, wipe the blackboard, and tidy desks and chairs',
          captionChinese: '②有的扫地，有的擦黑板，有的整理桌椅，大家各司其职。',
          captionEnglish: '② Some sweep the floor, some wipe the blackboard, some tidy the desks and chairs — everyone performs their own duty.',
        },
        {
          descriptionChinese: '大家把垃圾收好，送到走廊垃圾桶',
          descriptionEnglish: 'Everyone collects the rubbish and takes it to the corridor bin',
          captionChinese: '③打扫完毕，大家把垃圾收进袋子，一起送到走廊的垃圾桶里。',
          captionEnglish: '③ After cleaning, everyone collects the rubbish into bags and brings them to the corridor rubbish bin together.',
        },
        {
          descriptionChinese: '课室干净整洁，老师和同学们都很满意',
          descriptionEnglish: 'The classroom is clean and tidy; the teacher and students are all satisfied',
          captionChinese: '④课室变得干干净净，老师竖起大拇指称赞同学们，大家都感到很骄傲。',
          captionEnglish: '④ The classroom becomes spotlessly clean; the teacher gives a thumbs up to praise the students, and everyone feels proud.',
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════
  // SET 6 — 好榜样：关爱与环保  P4–P5
  // Based on: 2020 好榜样（收集饮料罐换取米捐给有需要的人）
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-006',
    setNumber: 6,
    themeChinese: '关爱与环保',
    themeEnglish: 'Care and Environmental Protection',
    moralChinese: '同理心',
    accentColour: '#AD1457',
    levels: ['P4', 'P5'],
    psleYears: ['2020'],
    vocab: [
      { chinese: '饮料罐', pinyin: 'yǐn liào guàn', english: 'drink can',
        exampleChinese: '我们收集饮料罐来回收。', exampleEnglish: 'We collect drink cans for recycling.' },
      { chinese: '回收', pinyin: 'huí shōu', english: 'to recycle',
        exampleChinese: '回收物品可以减少垃圾。', exampleEnglish: 'Recycling items can reduce rubbish.' },
      { chinese: '捐赠', pinyin: 'juān zèng', english: 'to donate',
        exampleChinese: '我们把大米捐赠给有需要的人。', exampleEnglish: 'We donate rice to people in need.' },
      { chinese: '有需要的人', pinyin: 'yǒu xū yào de rén', english: 'people in need',
        exampleChinese: '我们应该帮助有需要的人。', exampleEnglish: 'We should help people in need.' },
      { chinese: '榜样', pinyin: 'bǎng yàng', english: 'role model',
        exampleChinese: '他是我们学习的榜样。', exampleEnglish: 'He is a role model for us to learn from.' },
      { chinese: '爱心', pinyin: 'ài xīn', english: 'compassion / loving heart',
        exampleChinese: '她有一颗爱心，常常帮助别人。', exampleEnglish: 'She has a compassionate heart and often helps others.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中的同学们是怎样做好榜样的。',
        questionEnglish: 'Please talk about how the students in the video serve as good role models.',
        starterChinese: '录像中，同学们……',
        starterEnglish: 'In the video, the students…',
        modelAnswerChinese: '录像中，同学们发起了一个"以罐换米"的活动。他们在学校和社区里收集用过的饮料罐，把这些罐子送去回收，换取大米。收集到足够的大米后，同学们把大米整理好，亲自送到有需要的家庭，例如低收入家庭和独居老人。这个活动不只是帮助了有需要的人，也让更多人了解回收的重要性，是一个一举两得的好榜样行动。',
        modelAnswerEnglish: 'In the video, the students launched a "cans for rice" initiative. They collected used drink cans at school and in the community, sent the cans for recycling in exchange for rice. After collecting enough rice, the students packed it up and personally delivered it to families in need, such as low-income families and elderly people living alone. This activity not only helped people in need but also made more people aware of the importance of recycling — a good role model action that achieves two goals at once.',
        keyPhrases: ['收集饮料罐', '换取大米', '送给有需要的人', '一举两得'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你有没有做过类似的善事或帮助别人的活动。',
        questionEnglish: 'Besides what you saw in the video, tell us if you have done similar good deeds or activities to help others.',
        starterChinese: '我曾经……帮助……',
        starterEnglish: 'I once… helped…',
        modelAnswerChinese: '我曾经参加了学校组织的探访老人院活动。我们为老人家准备了小礼物，还为他们表演节目。看到老人家开心的笑容，我的心里感到非常温暖。我也曾经在社区的回收箱旁边，帮助不知道怎么分类的邻居把废纸和瓶子分好类。我觉得帮助别人不一定要做大事，有时候一个小小的举动，就能让别人感到很温暖。',
        modelAnswerEnglish: 'I once joined a school visit to a nursing home. We prepared small gifts for the elderly and performed for them. Seeing their happy smiles made me feel very warm inside. I have also helped neighbours who did not know how to sort their recycling, helping them separate paper and bottles at the community recycling bin. I feel that helping others does not have to mean doing big things — sometimes a small act can make others feel very warm.',
        keyPhrases: ['探访老人院', '表演节目', '帮助分类回收', '小小的举动'],
      },
      q3: {
        questionChinese: '你认为我们应该如何培养关爱他人和爱护环境的精神？',
        questionEnglish: 'How do you think we can cultivate the spirit of caring for others and protecting the environment?',
        starterChinese: '我认为我们可以……来培养关爱他人和爱护环境的精神。',
        starterEnglish: 'I think we can cultivate the spirit of caring for others and protecting the environment by…',
        modelAnswerChinese: '我认为我们可以从日常生活中的小事做起。在关爱他人方面，我们可以多关心身边的人，尤其是老人和有困难的人，主动伸出援手，不袖手旁观。在爱护环境方面，我们要养成回收的习惯，减少使用一次性物品，节约用水用电。此外，学校和家长应该多组织关爱社区和环保的活动，让孩子从小就了解关爱他人和保护环境的重要性，从而成为有爱心、有责任感的公民。',
        modelAnswerEnglish: 'I think we can start from small things in daily life. In terms of caring for others, we can pay more attention to the people around us, especially the elderly and those in difficulty, taking the initiative to lend a hand and not standing aside. In terms of protecting the environment, we should develop recycling habits, reduce the use of disposable items, and conserve water and electricity. In addition, schools and parents should organise more community care and environmental activities, so that children understand from a young age the importance of caring for others and protecting the environment, thus becoming compassionate and responsible citizens.',
        keyPhrases: ['从小事做起', '主动伸出援手', '回收习惯', '有爱心有责任感'],
      },
      q3TipByLevel: {
        advanced: '把回答分成"关爱他人"和"爱护环境"两个部分，用"在……方面"来组织，展示思维的层次感。',
        standard: '各说一件关爱他人和爱护环境的事，并解释为什么这样做重要。',
      },
    },
    passage: {
      paragraphs: [
        '小伟在学校听到老师说，附近有些老人家生活很困难，有时候连饭都吃不饱。',
        '小伟想到一个方法。他号召班上的同学一起收集用过的饮料罐，把这些罐子送去回收，换取大米。',
        '同学们非常支持，大家回家后也发动家人一起收集饮料罐。一个月后，他们收集到了很多大米。',
        '小伟带领同学们亲自把大米送到有需要的老人家手中。老人家们感动地说："谢谢你们，你们真是好孩子！"',
      ],
      difficulty: '中级',
      characterCount: 148,
    },
    pictureStory: {
      titleChinese: '以罐换米',
      titleEnglish: 'Cans for Rice',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '一个有爱心的人，不只关心自己的家人和朋友，也会关心社会上有需要的人。关爱他人和爱护环境，可以让我们的社会变得更美好。',
      narratorEnglish: 'A compassionate person does not only care for their family and friends, but also cares for those in need in society. Caring for others and protecting the environment can make our society a better place.',
      frames: [
        {
          descriptionChinese: '同学们在学校发起收集饮料罐活动',
          descriptionEnglish: 'Students launch a drink can collection campaign at school',
          captionChinese: '①同学们在学校发起收集饮料罐的活动，大家热烈响应。',
          captionEnglish: '① Students launch a drink can collection campaign at school, and everyone responds enthusiastically.',
        },
        {
          descriptionChinese: '同学们把饮料罐送去回收，换取大米',
          descriptionEnglish: 'Students send the cans for recycling in exchange for rice',
          captionChinese: '②同学们把收集好的饮料罐送去回收中心，换取了很多袋大米。',
          captionEnglish: '② The students send the collected cans to the recycling centre and exchange them for many bags of rice.',
        },
        {
          descriptionChinese: '同学们把大米装好，准备送出',
          descriptionEnglish: 'Students pack the rice, ready to deliver it',
          captionChinese: '③同学们齐心协力，把大米整理好，准备送给有需要的家庭。',
          captionEnglish: '③ The students work together to pack the rice, ready to deliver it to families in need.',
        },
        {
          descriptionChinese: '同学们亲自把大米送到老人家手中',
          descriptionEnglish: 'Students personally deliver the rice to elderly residents',
          captionChinese: '④同学们亲自上门，把大米送到独居老人手中，老人家感动地流下眼泪。',
          captionEnglish: '④ The students personally deliver the rice to elderly residents living alone; the elderly are moved to tears.',
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════
  // SET 7 — 责任感  P4–P5
  // Based on: 2021 责任感（房间凌乱、没把鞋子收好）
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-007',
    setNumber: 7,
    themeChinese: '培养责任感',
    themeEnglish: 'Developing a Sense of Responsibility',
    moralChinese: '责任感',
    accentColour: '#E65100',
    levels: ['P4', 'P5'],
    psleYears: ['2021'],
    vocab: [
      { chinese: '凌乱', pinyin: 'líng luàn', english: 'messy / disorderly',
        exampleChinese: '房间凌乱，找不到东西。', exampleEnglish: 'The room is messy and things cannot be found.' },
      { chinese: '整洁', pinyin: 'zhěng jié', english: 'neat and tidy',
        exampleChinese: '保持房间整洁是好习惯。', exampleEnglish: 'Keeping the room tidy is a good habit.' },
      { chinese: '负责', pinyin: 'fù zé', english: 'to be responsible for',
        exampleChinese: '我负责管理自己的房间。', exampleEnglish: 'I am responsible for managing my own room.' },
      { chinese: '养成', pinyin: 'yǎng chéng', english: 'to cultivate / develop (a habit)',
        exampleChinese: '我们要养成整理物品的好习惯。', exampleEnglish: 'We should cultivate the good habit of tidying up.' },
      { chinese: '物归原处', pinyin: 'wù guī yuán chù', english: 'return things to their original place',
        exampleChinese: '用完的东西要物归原处。', exampleEnglish: 'Things used must be returned to their original place.' },
      { chinese: '自律', pinyin: 'zì lǜ', english: 'self-discipline',
        exampleChinese: '自律是成功的关键。', exampleEnglish: 'Self-discipline is the key to success.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中的小朋友遇到了什么问题，以及他后来是怎么做的。',
        questionEnglish: 'Please talk about the problem the child in the video encountered and what he did afterwards.',
        starterChinese: '录像中，小朋友……',
        starterEnglish: 'In the video, the child…',
        modelAnswerChinese: '录像中，小明的房间非常凌乱，玩具、书本和衣物都乱七八糟地堆在地上，害他找不到自己要用的东西，急得团团转。他也因为运动回来后没有把鞋子收好，鞋子乱放在走廊，害妈妈差点被绊倒。妈妈没有帮他收拾，而是告诉他，自己的东西要自己负责管理，要养成物归原处的好习惯。小明听后，认真地把房间和鞋子整理好，并答应以后会保持整洁。',
        modelAnswerEnglish: 'In the video, Xiao Ming\'s room was very messy, with toys, books, and clothes piled haphazardly on the floor, making it impossible for him to find what he needed. He was also running around in a panic. Because he had not put his shoes away after coming home from sport, the shoes were left scattered in the corridor, almost causing his mother to trip. His mother did not help him tidy up, but instead told him that he should be responsible for managing his own belongings and cultivate the good habit of returning things to their original place. After hearing this, Xiao Ming earnestly tidied up his room and shoes, and promised to keep things tidy in future.',
        keyPhrases: ['房间凌乱', '鞋子乱放', '物归原处', '自己负责'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你在日常生活中是怎样表现责任感的。',
        questionEnglish: 'Besides what you saw in the video, tell us how you demonstrate responsibility in daily life.',
        starterChinese: '在日常生活中，我会……',
        starterEnglish: 'In daily life, I…',
        modelAnswerChinese: '在日常生活中，我每天都会整理好自己的书包，检查第二天需要带的东西，不需要爸妈帮忙。我也会在每天睡觉前，把自己的房间整理好，把用过的东西放回原处。在学校，我是班上的清洁组长，负责带领同学们打扫课室，我会认真完成自己的工作，不让组员失望。我觉得，做任何事都要有责任感，这样才能得到别人的信任。',
        modelAnswerEnglish: 'In daily life, I organise my own school bag every day and check what I need to bring the next day, without needing my parents\' help. I also tidy my room and return things to their proper place before sleeping each night. At school, I am the class cleaning group leader, responsible for leading classmates in cleaning the classroom. I carry out my work diligently so as not to let my group members down. I feel that in everything we do, we must have a sense of responsibility — that is how we earn others\' trust.',
        keyPhrases: ['整理书包', '检查物品', '清洁组长', '得到信任'],
      },
      q3: {
        questionChinese: '你认为培养责任感对一个人的成长有什么重要性？',
        questionEnglish: 'Why do you think developing a sense of responsibility is important for a person\'s growth?',
        starterChinese: '我认为培养责任感很重要，因为……',
        starterEnglish: 'I think developing responsibility is important because…',
        modelAnswerChinese: '我认为培养责任感对一个人的成长非常重要。首先，有责任感的人能够管理好自己的事务，不需要别人时刻提醒，这样在学习和工作上都会更有效率。其次，一个有责任感的人，能够得到别人的信任，无论在家庭、学校还是社会上，都会受到尊重。最重要的是，责任感可以帮助我们认识到自己的行为会对他人产生影响，从而让我们更加考虑他人的感受，成为一个对社会有贡献的人。',
        modelAnswerEnglish: 'I think developing a sense of responsibility is very important for a person\'s growth. First, a responsible person can manage their own affairs without needing constant reminders from others, making them more efficient in their studies and work. Second, a responsible person earns the trust of others and is respected in the family, at school, and in society. Most importantly, a sense of responsibility helps us recognise that our actions affect others, causing us to consider others\' feelings more and become a person who contributes to society.',
        keyPhrases: ['管理自己事务', '得到信任', '受到尊重', '对社会有贡献'],
      },
      q3TipByLevel: {
        advanced: '用"首先……其次……最重要的是……"来组织三个层次的好处，展示逻辑思维能力。',
        standard: '说出两个培养责任感的好处，各用一个具体例子来说明。',
      },
    },
    passage: {
      paragraphs: [
        '小雄每次运动完回到家，总是把鞋子随手丢在走廊，把衣服扔在椅子上，房间里也乱得像垃圾堆。',
        '一天，妈妈在走廊差点被小雄的鞋子绊倒，吓了一跳。妈妈认真地对小雄说："自己的东西要自己收好，这是你的责任。"',
        '小雄看到妈妈受到惊吓，心里很内疚。从那天起，他每次运动回来，都会把鞋子整齐地放在鞋柜里。',
        '小雄还主动把自己的房间整理干净，把东西物归原处。妈妈看了，高兴地说："小雄长大了，懂得负责任了！"',
      ],
      difficulty: '中级',
      characterCount: 148,
    },
    pictureStory: {
      titleChinese: '自己的事自己做',
      titleEnglish: 'Taking Responsibility for Yourself',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '责任感是一种重要的品德。当我们学会为自己的行为负责，我们就迈出了成长的重要一步。',
      narratorEnglish: 'A sense of responsibility is an important virtue. When we learn to take responsibility for our own actions, we take an important step in growing up.',
      frames: [
        {
          descriptionChinese: '小明房间凌乱，找不到需要的东西',
          descriptionEnglish: 'Xiao Ming\'s room is messy and he cannot find what he needs',
          captionChinese: '①小明的房间凌乱不堪，他找不到第二天上学需要用的东西，急得团团转。',
          captionEnglish: '① Xiao Ming\'s room is extremely messy; he cannot find what he needs for school the next day and is running around in a panic.',
        },
        {
          descriptionChinese: '运动后的鞋子乱放在走廊，妈妈差点绊倒',
          descriptionEnglish: 'Shoes left scattered in the corridor after sport; Mum almost trips',
          captionChinese: '②小明运动回来后，把鞋子乱放在走廊，妈妈差点被绊倒。',
          captionEnglish: '② After coming home from sport, Xiao Ming leaves his shoes scattered in the corridor; his mother almost trips.',
        },
        {
          descriptionChinese: '妈妈耐心地告诉小明要自己负责管理物品',
          descriptionEnglish: 'Mum patiently tells Xiao Ming to be responsible for his own belongings',
          captionChinese: '③妈妈耐心地告诉小明，自己的东西要自己负责，要养成物归原处的好习惯。',
          captionEnglish: '③ Mum patiently tells Xiao Ming that he should be responsible for his own belongings and develop the good habit of returning things to their original place.',
        },
        {
          descriptionChinese: '小明认真整理房间和鞋子，房间变得整洁',
          descriptionEnglish: 'Xiao Ming earnestly tidies his room and shoes; the room becomes neat',
          captionChinese: '④小明认真地把房间和鞋子整理好，房间变得整洁，妈妈欣慰地笑了。',
          captionEnglish: '④ Xiao Ming earnestly tidies his room and shoes; the room becomes neat, and Mum smiles with relief.',
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════
  // SET 8 — 同理心  P5–P6
  // Based on: 2022 同理心（处处为别人着想）
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-008',
    setNumber: 8,
    themeChinese: '同理心',
    themeEnglish: 'Empathy',
    moralChinese: '同理心',
    accentColour: '#AD1457',
    levels: ['P5', 'P6'],
    psleYears: ['2022'],
    vocab: [
      { chinese: '同理心', pinyin: 'tóng lǐ xīn', english: 'empathy',
        exampleChinese: '有同理心的人能理解别人的感受。', exampleEnglish: 'A person with empathy can understand others\' feelings.' },
      { chinese: '换位思考', pinyin: 'huàn wèi sī kǎo', english: 'to think from another\'s perspective',
        exampleChinese: '学会换位思考，才能理解别人。', exampleEnglish: 'Learning to think from others\' perspectives helps us understand them.' },
      { chinese: '体谅', pinyin: 'tǐ liàng', english: 'to be understanding / considerate',
        exampleChinese: '我们要体谅别人的困难。', exampleEnglish: 'We should be understanding of others\' difficulties.' },
      { chinese: '便利', pinyin: 'biàn lì', english: 'convenient / to make things convenient',
        exampleChinese: '我们的行为会影响他人的便利。', exampleEnglish: 'Our behaviour affects the convenience of others.' },
      { chinese: '设身处地', pinyin: 'shè shēn chǔ dì', english: 'to put oneself in another\'s shoes',
        exampleChinese: '我们要设身处地为别人着想。', exampleEnglish: 'We should put ourselves in others\' shoes.' },
      { chinese: '和谐', pinyin: 'hé xié', english: 'harmonious',
        exampleChinese: '有同理心才能建立和谐社会。', exampleEnglish: 'Empathy is needed to build a harmonious society.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中发生了什么事，以及这件事带给你什么启示。',
        questionEnglish: 'Please talk about what happened in the video and what lesson it gave you.',
        starterChinese: '录像中，……这件事告诉我……',
        starterEnglish: 'In the video,… This tells me…',
        modelAnswerChinese: '录像中，一位年轻人在地铁站霸占了一排座位，把包包放在旁边的座位上，不让其他人坐。这时，一位怀孕的女士走进车厢，站在旁边，但那位年轻人假装没看见，继续玩手机。后来，一位老伯伯主动让座给那位女士，让她坐下来。这件事告诉我，我们要有同理心，学会换位思考，设身处地为别人着想，而不只是考虑自己的方便。',
        modelAnswerEnglish: 'In the video, a young person on the MRT occupied a row of seats by placing his bag on the adjacent seat, not allowing others to sit down. At this point, a pregnant woman entered the carriage and stood nearby, but the young person pretended not to see her and continued playing with his phone. Later, an elderly man proactively gave up his seat for the woman, letting her sit down. This incident tells me that we need to have empathy, learn to think from others\' perspectives, and put ourselves in their shoes, rather than just thinking about our own convenience.',
        keyPhrases: ['霸占座位', '换位思考', '设身处地', '让座'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你曾经在什么情况下表现出同理心。',
        questionEnglish: 'Besides what you saw in the video, tell us about a time you showed empathy.',
        starterChinese: '有一次，我……',
        starterEnglish: 'Once, I…',
        modelAnswerChinese: '有一次，我在食堂看到一位行动不便的老婆婆，她的托盘很重，走得很吃力。我想到如果我是她，一定也很需要别人的帮助，于是我主动走过去，帮她把托盘拿到桌子旁边，扶她坐下。她非常感激地说谢谢，我心里感到很温暖。从那以后，我更加注意到身边有需要帮助的人，并且更愿意伸出援手。',
        modelAnswerEnglish: 'Once in the canteen, I noticed an elderly woman with limited mobility; her tray was heavy and she was walking with great difficulty. I thought that if I were her, I would also really need someone\'s help, so I proactively walked over and helped her carry her tray to the table and helped her sit down. She thanked me very gratefully, and I felt very warm inside. Since then, I have paid more attention to people around me who need help and am more willing to lend a hand.',
        keyPhrases: ['行动不便', '设想自己是她', '主动帮助', '伸出援手'],
      },
      q3: {
        questionChinese: '你认为同理心对建立和谐社会有什么重要性？',
        questionEnglish: 'What importance does empathy have in building a harmonious society?',
        starterChinese: '我认为同理心对建立和谐社会非常重要，因为……',
        starterEnglish: 'I think empathy is very important in building a harmonious society because…',
        modelAnswerChinese: '我认为同理心对建立和谐社会非常重要。在一个多元种族的社会里，人们的背景、文化和需求各不相同。只有当我们学会设身处地为他人着想，才能真正理解和尊重彼此的差异，减少误解和冲突。同理心也能促使我们主动帮助有需要的人，使社会更加关爱和包容。如果每一个人都能处处为别人着想，我们的环境就会变得更美好，社会也会更加和谐。',
        modelAnswerEnglish: 'I think empathy is very important in building a harmonious society. In a multi-racial society, people have different backgrounds, cultures, and needs. Only when we learn to put ourselves in others\' shoes can we truly understand and respect each other\'s differences, reducing misunderstandings and conflicts. Empathy also motivates us to proactively help those in need, making society more caring and inclusive. If every person can always think of others, our environment will become a better place and society will be more harmonious.',
        keyPhrases: ['多元种族', '理解尊重差异', '减少冲突', '关爱包容'],
      },
      q3TipByLevel: {
        advanced: '提到新加坡多元种族社会的具体背景，说明同理心在减少种族和文化冲突中的作用，展示你对社会的思考。',
        standard: '说出两个同理心对社会重要的原因，用"第一……第二……"来组织，每点用一个日常例子说明。',
      },
    },
    passage: {
      paragraphs: [
        '啊！六年了，母校！这里的一草一木，我是那样熟悉，无论我走到哪里，都不会忘记。母校，如今我就要离开您展翅高飞了。',
        '校园的小树，你可记得！当我第一次踏进校门时，感觉自己多么幸福。在这里，我们从不懂事的孩子成为了积极向上的少年。老师啊，您花费了多少心血啊！',
        '校园的小树，你可记得！当我在机器人比赛中得了奖，我捧着奖杯归来的时候，老师欣慰地笑了，亲切地摸着我的头，鼓励我继续努力。老师啊，您的关怀，我怎么会忘记？',
      ],
      difficulty: '高级',
      characterCount: 158,
    },
    pictureStory: {
      titleChinese: '处处为别人着想',
      titleEnglish: 'Always Think of Others',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '同理心，就是能够理解和感受别人的处境与感受。要处处为别人着想，我们的环境才会变得更美好。',
      narratorEnglish: 'Empathy means being able to understand and feel others\' situations and feelings. Only by always thinking of others can our environment become a better place.',
      frames: [
        {
          descriptionChinese: '年轻人在地铁用包包占据邻座，不让他人坐',
          descriptionEnglish: 'A young person uses a bag to occupy the adjacent seat on the MRT, not letting others sit',
          captionChinese: '①一位年轻人在地铁上把包包放在旁边的座位，不让其他乘客坐下。',
          captionEnglish: '① A young person on the MRT puts his bag on the adjacent seat, not allowing other passengers to sit down.',
        },
        {
          descriptionChinese: '怀孕女士上车，站立无处落座，年轻人无动于衷',
          descriptionEnglish: 'A pregnant woman boards and stands with nowhere to sit; the young person is indifferent',
          captionChinese: '②一位怀孕的女士上车，站在旁边，但年轻人假装没看见，继续玩手机。',
          captionEnglish: '② A pregnant woman boards and stands nearby, but the young person pretends not to see her and continues playing with his phone.',
        },
        {
          descriptionChinese: '老伯伯主动让座给怀孕女士',
          descriptionEnglish: 'An elderly man proactively gives up his seat for the pregnant woman',
          captionChinese: '③这时，一位老伯伯主动起身，把自己的座位让给那位怀孕的女士。',
          captionEnglish: '③ At this moment, an elderly man proactively stands up and gives his seat to the pregnant woman.',
        },
        {
          descriptionChinese: '年轻人看到后，惭愧地拿开包包，也让出了座位',
          descriptionEnglish: 'Seeing this, the young person feels ashamed and removes his bag, offering the seat too',
          captionChinese: '④年轻人看到老伯伯的举动，感到很惭愧，默默地拿开包包，为其他有需要的乘客让出了座位。',
          captionEnglish: '④ Seeing the elderly man\'s actions, the young person feels ashamed and quietly removes his bag, giving up the seat for other passengers in need.',
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════
  // SET 9 — 阅读的好处  P5–P6
  // Based on: 2024 阅读（兴趣、爱好）
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-009',
    setNumber: 9,
    themeChinese: '阅读的好处',
    themeEnglish: 'The Benefits of Reading',
    moralChinese: '勤奋',
    accentColour: '#4E342E',
    levels: ['P5', 'P6'],
    psleYears: ['2024'],
    vocab: [
      { chinese: '阅读', pinyin: 'yuè dú', english: 'to read / reading',
        exampleChinese: '阅读是获取知识的好方法。', exampleEnglish: 'Reading is a great way to gain knowledge.' },
      { chinese: '知识', pinyin: 'zhī shi', english: 'knowledge',
        exampleChinese: '阅读可以增长知识。', exampleEnglish: 'Reading can broaden one\'s knowledge.' },
      { chinese: '想象力', pinyin: 'xiǎng xiàng lì', english: 'imagination',
        exampleChinese: '阅读故事书能培养想象力。', exampleEnglish: 'Reading storybooks can cultivate imagination.' },
      { chinese: '词汇', pinyin: 'cí huì', english: 'vocabulary',
        exampleChinese: '多阅读可以增加词汇量。', exampleEnglish: 'Reading more can increase vocabulary.' },
      { chinese: '习惯', pinyin: 'xí guàn', english: 'habit',
        exampleChinese: '养成每天阅读的习惯很重要。', exampleEnglish: 'It is important to cultivate the habit of reading daily.' },
      { chinese: '陶冶情操', pinyin: 'táo yě qíng cāo', english: 'to cultivate one\'s character / enrich one\'s mind',
        exampleChinese: '阅读文学作品能陶冶情操。', exampleEnglish: 'Reading literary works can enrich one\'s mind and character.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中的同学是怎样享受阅读的，以及他们从阅读中得到什么好处。',
        questionEnglish: 'Please talk about how the students in the video enjoy reading and what benefits they gain from it.',
        starterChinese: '录像中，同学们……他们从阅读中……',
        starterEnglish: 'In the video, the students… They gain from reading…',
        modelAnswerChinese: '录像中，同学们利用课余时间到图书馆阅读各种不同类型的书籍，有科学书、故事书、漫画和百科全书。有些同学阅读后，还会把书中有趣的内容分享给朋友，一起讨论。他们表示，通过阅读，他们学到了很多在课本上学不到的知识，也扩大了词汇量，在写作方面进步了很多。阅读也让他们能够放松心情，从紧张的学习压力中得到休息。',
        modelAnswerEnglish: 'In the video, students used their free time to go to the library and read various types of books, including science books, story books, comics, and encyclopaedias. After reading, some students would share interesting content from the books with friends and discuss together. They said that through reading, they had learned a lot of knowledge not found in textbooks, expanded their vocabulary, and improved greatly in writing. Reading also helped them relax and take a break from the stress of their studies.',
        keyPhrases: ['各种类型书籍', '分享讨论', '扩大词汇量', '放松心情'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你的阅读习惯，以及阅读给你带来了什么好处。',
        questionEnglish: 'Besides what you saw in the video, tell us about your reading habits and the benefits reading has brought you.',
        starterChinese: '我喜欢阅读……阅读让我……',
        starterEnglish: 'I enjoy reading… Reading has helped me…',
        modelAnswerChinese: '我喜欢阅读历史故事书和科普书籍。每天睡觉前，我都会花半个小时阅读。阅读让我学到了很多历史知识，也让我了解到很多科学现象的原理，非常有趣。此外，阅读也帮助我提高了写作水平。以前我写作文时常常不知道用什么词语，但现在我的词汇量增加了，能够写出更生动的句子。我认为阅读是一种既有益又有乐趣的活动，值得每个人去培养这个好习惯。',
        modelAnswerEnglish: 'I enjoy reading history storybooks and popular science books. Every night before sleeping, I spend half an hour reading. Reading has taught me a lot of historical knowledge and helped me understand the principles behind many scientific phenomena, which is very interesting. In addition, reading has also helped me improve my writing. In the past, I often did not know what words to use when writing compositions, but now my vocabulary has grown and I can write more vivid sentences. I believe reading is both beneficial and enjoyable — it is worth everyone cultivating this good habit.',
        keyPhrases: ['每天阅读半小时', '历史科普', '提高写作水平', '词汇量增加'],
      },
      q3: {
        questionChinese: '在数字时代，你认为阅读实体书籍还是否重要？为什么？',
        questionEnglish: 'In the digital age, do you think reading physical books is still important? Why?',
        starterChinese: '我认为在数字时代，阅读实体书籍……因为……',
        starterEnglish: 'I think in the digital age, reading physical books… because…',
        modelAnswerChinese: '我认为在数字时代，阅读实体书籍仍然非常重要。首先，研究表明，阅读实体书时，人们的专注度更高，能够更好地理解和记忆内容，相比之下，在电子屏幕上阅读更容易分心。其次，实体书不需要电池或网络，随时随地都可以阅读。最重要的是，培养阅读习惯能够帮助我们静下心来，在这个快节奏的数字时代，这种专注和沉静的能力是非常宝贵的。当然，电子阅读也有其优点，两者并非对立，关键在于我们是否养成了爱阅读的习惯。',
        modelAnswerEnglish: 'I think reading physical books is still very important in the digital age. First, research shows that people\'s concentration is higher when reading physical books, and they can better understand and remember content; in contrast, reading on electronic screens is more distracting. Second, physical books do not need batteries or internet access and can be read anywhere at any time. Most importantly, cultivating a reading habit helps us calm our minds — in this fast-paced digital age, the ability to focus and be still is very precious. Of course, e-reading also has its advantages; the two are not opposed. The key is whether we have developed a love of reading.',
        keyPhrases: ['专注度更高', '不需要电池', '静下心来', '爱阅读的习惯'],
      },
      q3TipByLevel: {
        advanced: '用"当然……但是……关键在于……"的句式来呈现平衡的观点，承认电子阅读的优点，再回到实体书的独特价值。',
        standard: '说出两个实体书仍然重要的理由，用"第一……第二……"来组织，每点举一个例子说明。',
      },
    },
    passage: {
      paragraphs: [
        '小文从小就喜欢读书，他的书架上摆满了各种各样的书。每天放学后，他第一件事就是拿出书本，沉浸在书的世界里。',
        '有一次，老师出了一道关于古代历史的题目，全班同学都不会做，只有小文举手回答，而且答得非常正确。同学们都很惊讶，纷纷问他是怎么知道的。',
        '小文笑着说："我在课外书里读到过这段历史，原来书里的知识真的很有用！"老师称赞他说："读书破万卷，下笔如有神，小文做到了。"',
        '从那以后，班上越来越多的同学爱上了阅读。他们发现，书本里有一个无限广阔的世界，等着他们去探索。',
      ],
      difficulty: '高级',
      characterCount: 165,
    },
    pictureStory: {
      titleChinese: '爱上阅读',
      titleEnglish: 'Falling in Love with Reading',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '阅读是一扇窗，能让我们看见更广阔的世界；阅读是一座桥，能把我们和知识、智慧连接起来。养成阅读的习惯，让我们终身受益。',
      narratorEnglish: 'Reading is a window that allows us to see a broader world; reading is a bridge that connects us to knowledge and wisdom. Cultivating the habit of reading benefits us for life.',
      frames: [
        {
          descriptionChinese: '同学们在图书馆自由选书、阅读',
          descriptionEnglish: 'Students freely select and read books in the library',
          captionChinese: '①课余时间，同学们到图书馆自由选书，享受阅读的乐趣。',
          captionEnglish: '① During free time, students go to the library to freely select books and enjoy the pleasure of reading.',
        },
        {
          descriptionChinese: '同学们阅读后互相分享书中内容',
          descriptionEnglish: 'Students share what they read from their books with each other',
          captionChinese: '②阅读后，同学们互相分享书中有趣的内容，热烈地讨论。',
          captionEnglish: '② After reading, students share interesting content from their books with each other and discuss enthusiastically.',
        },
        {
          descriptionChinese: '阅读帮助同学在写作和学习上进步',
          descriptionEnglish: 'Reading helps students improve in writing and studies',
          captionChinese: '③老师批改作文，发现爱阅读的同学词汇丰富，文章写得非常生动。',
          captionEnglish: '③ The teacher marks compositions and finds that students who love reading have rich vocabulary and write very vivid essays.',
        },
        {
          descriptionChinese: '同学们在家里也养成了每天阅读的习惯',
          descriptionEnglish: 'Students also develop the habit of reading every day at home',
          captionChinese: '④受到启发，同学们在家里也养成了每天阅读的好习惯，书架上的书越来越多。',
          captionEnglish: '④ Inspired, the students also cultivate the good habit of reading every day at home, and their bookshelves grow fuller and fuller.',
        },
      ],
    },
  },

  // ══════════════════════════════════════════════════════
  // SET 10 — 公路安全  P5–P6
  // Based on: 2020 公路安全（过马路戴耳机、没注意交通路况）
  // ══════════════════════════════════════════════════════
  {
    id: 'oral-010',
    setNumber: 10,
    themeChinese: '公路安全',
    themeEnglish: 'Road Safety',
    moralChinese: '安全',
    accentColour: '#F57F17',
    levels: ['P5', 'P6'],
    psleYears: ['2020'],
    vocab: [
      { chinese: '交通安全', pinyin: 'jiāo tōng ān quán', english: 'traffic / road safety',
        exampleChinese: '我们要注意交通安全。', exampleEnglish: 'We must pay attention to road safety.' },
      { chinese: '分心', pinyin: 'fēn xīn', english: 'to be distracted',
        exampleChinese: '过马路时不能分心。', exampleEnglish: 'We must not be distracted when crossing the road.' },
      { chinese: '耳机', pinyin: 'ěr jī', english: 'earphones / earbuds',
        exampleChinese: '过马路时不要戴耳机。', exampleEnglish: 'Do not wear earphones when crossing the road.' },
      { chinese: '观察', pinyin: 'guān chá', english: 'to observe',
        exampleChinese: '过马路前要观察左右来车。', exampleEnglish: 'Observe vehicles from both sides before crossing the road.' },
      { chinese: '警惕', pinyin: 'jǐng tì', english: 'to be alert / vigilant',
        exampleChinese: '在马路上要时刻保持警惕。', exampleEnglish: 'We must always stay alert on the road.' },
      { chinese: '意识', pinyin: 'yì shí', english: 'awareness / consciousness',
        exampleChinese: '我们要加强交通安全意识。', exampleEnglish: 'We must strengthen our road safety awareness.' },
    ],
    questions: {
      q1: {
        questionChinese: '这位同学，请你谈一谈录像中的行人有哪些不安全的行为，以及可能带来什么后果。',
        questionEnglish: 'Please talk about the unsafe behaviours of the pedestrians in the video and the possible consequences.',
        starterChinese: '录像中，行人……这样做可能会……',
        starterEnglish: 'In the video, the pedestrians… Doing so might…',
        modelAnswerChinese: '录像中，有些行人在过马路时戴着耳机听音乐，完全听不到外面的声音，无法察觉到附近有没有车辆驶来，这样很容易发生意外。也有人一边看手机一边过马路，没有注意交通路况。还有人在红灯亮着的时候，看到没有车就闯红灯，这样做是非常危险的。这些不安全的行为可能导致严重的交通事故，甚至危及生命。',
        modelAnswerEnglish: 'In the video, some pedestrians were wearing earphones and listening to music while crossing the road, completely unable to hear sounds from outside and unaware of whether any vehicles were approaching — making accidents very likely to happen. Some people were also looking at their phones while crossing the road, not paying attention to traffic conditions. Others ran red lights when they saw no cars coming while the light was red, which is extremely dangerous. These unsafe behaviours could lead to serious traffic accidents and even put lives at risk.',
        keyPhrases: ['戴耳机', '看手机', '闯红灯', '危及生命'],
      },
      q2: {
        questionChinese: '除了录像中所看到的，请说一说你平时是怎样注意交通安全的。',
        questionEnglish: 'Besides what you saw in the video, tell us how you pay attention to road safety in daily life.',
        starterChinese: '在日常生活中，我过马路时会……',
        starterEnglish: 'In daily life, when I cross the road, I…',
        modelAnswerChinese: '在日常生活中，我过马路时非常小心。我会先等绿灯亮起，然后再左看右看，确保没有车辆驶来，才过马路。我也不会在过马路时玩手机或戴耳机，保持高度警惕。当我骑脚踏车时，我会戴上头盔，遵守交通规则，不闯红灯。我也会提醒家人和朋友注意交通安全，因为安全是最重要的事。',
        modelAnswerEnglish: 'In daily life, I am very careful when crossing the road. I wait for the green light, then look left and right to make sure no vehicles are coming before I cross. I also do not play with my phone or wear earphones when crossing the road, staying highly alert. When I ride a bicycle, I wear a helmet, follow traffic rules, and do not run red lights. I also remind family and friends to pay attention to road safety, because safety is the most important thing.',
        keyPhrases: ['等绿灯', '左看右看', '不玩手机', '戴头盔'],
      },
      q3: {
        questionChinese: '你认为在科技发达的今天，分心驾驶和分心行走的问题是否越来越严重？我们应该如何解决这个问题？',
        questionEnglish: 'Do you think distracted driving and distracted walking are becoming increasingly serious problems in today\'s technologically advanced world? How should we address this problem?',
        starterChinese: '我认为分心的问题……我们可以通过……来解决。',
        starterEnglish: 'I think the problem of distraction… We can address it by…',
        modelAnswerChinese: '我认为随着智能手机的普及，分心驾驶和分心行走的问题确实越来越严重。人们习惯了随时随地查看手机，却忽略了这样做在马路上有多危险。要解决这个问题，我们需要从几个方面入手。首先，政府可以加强相关法律，对边走路边使用手机的行人以及分心驾驶的司机采取更严厉的罚款措施。其次，学校和家庭应该从小培养孩子的交通安全意识，让孩子明白手机可以等，但生命只有一次。最后，科技公司也可以开发手机应用程序，在检测到用户正在行走或驾驶时，自动关闭屏幕通知，减少诱惑。',
        modelAnswerEnglish: 'I think with the widespread use of smartphones, the problems of distracted driving and distracted walking are indeed becoming increasingly serious. People have become accustomed to checking their phones at any time and place, yet they neglect how dangerous this is on the road. To solve this problem, we need to approach it from several angles. First, the government can strengthen related laws and impose stricter fines on pedestrians using phones while walking and drivers who are distracted. Second, schools and families should cultivate children\'s road safety awareness from a young age, making children understand that the phone can wait, but life is only lived once. Finally, technology companies can also develop mobile apps that automatically disable screen notifications when detecting that the user is walking or driving, reducing temptation.',
        keyPhrases: ['智能手机普及', '加强法律', '从小培养意识', '手机可以等生命只有一次'],
      },
      q3TipByLevel: {
        advanced: '分析问题的根源（智能手机普及），然后从政府、学校家庭、科技公司三个层面提出解决方案，展示多角度思维。',
        standard: '说出这个问题为什么越来越严重，然后提出两个解决方法，用"首先……其次……"来组织。',
      },
    },
    passage: {
      paragraphs: [
        '那天下午，小杰放学后戴着耳机，一边听音乐一边走路回家。他完全沉浸在音乐里，没有注意周围的环境。',
        '走到路口时，小杰看了一眼，以为没有车，就低着头走了过去。突然，一辆摩托车从旁边驶来，司机紧急刹车，险些撞上小杰，把小杰吓得魂飞魄散。',
        '摩托车司机停下来，严肃地说："小朋友，过马路要注意安全！戴着耳机怎么能听到车声呢？"小杰这才意识到自己差点闯了大祸。',
        '从那以后，小杰过马路时再也不戴耳机，也不看手机了。他还把这件事告诉了身边的同学，提醒大家注意交通安全。',
      ],
      difficulty: '高级',
      characterCount: 172,
    },
    pictureStory: {
      titleChinese: '过马路要注意安全',
      titleEnglish: 'Stay Safe When Crossing the Road',
      introChinese: '仔细听旁白，认真看镜头。',
      introEnglish: 'Listen carefully to the narrator and watch the video attentively.',
      narratorChinese: '在科技发达的今天，越来越多的人习惯了边走路边看手机，这给交通安全带来了很大的隐患。我们必须时刻保持警惕，把安全放在第一位。',
      narratorEnglish: 'In today\'s technologically advanced world, more and more people have become accustomed to looking at their phones while walking, posing a serious hidden danger to road safety. We must always stay alert and put safety first.',
      frames: [
        {
          descriptionChinese: '行人戴耳机、看手机过马路',
          descriptionEnglish: 'Pedestrians wearing earphones and looking at phones while crossing the road',
          captionChinese: '①一些行人在过马路时戴着耳机或低头看手机，完全没有注意交通状况。',
          captionEnglish: '① Some pedestrians wear earphones or look down at their phones while crossing the road, paying no attention to traffic conditions.',
        },
        {
          descriptionChinese: '一辆车紧急刹车，险些撞上分心的行人',
          descriptionEnglish: 'A car brakes sharply, nearly hitting a distracted pedestrian',
          captionChinese: '②一辆汽车紧急刹车，险些撞上一个低头看手机的行人，大家都被吓到了。',
          captionEnglish: '② A car brakes sharply and nearly hits a pedestrian looking down at their phone; everyone is frightened.',
        },
        {
          descriptionChinese: '警察过来向行人解释交通安全的重要性',
          descriptionEnglish: 'A police officer comes over to explain road safety to the pedestrians',
          captionChinese: '③附近的警察过来，向行人解释过马路时使用手机的危险性，提醒大家要注意交通安全。',
          captionEnglish: '③ A nearby police officer comes over to explain to the pedestrians the danger of using phones while crossing the road, reminding everyone to pay attention to road safety.',
        },
        {
          descriptionChinese: '行人收起手机，安全地过马路',
          descriptionEnglish: 'Pedestrians put away their phones and cross the road safely',
          captionChinese: '④行人们听从警察的劝告，收起手机，等绿灯后左看右看，安全地过了马路。',
          captionEnglish: '④ The pedestrians heed the police officer\'s advice, put away their phones, wait for the green light, look left and right, and cross the road safely.',
        },
      ],
    },
  },

];
