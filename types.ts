
// 文章分类：涵盖主流外刊版块
export type Category = 'World' | 'Business' | 'Science' | 'Technology' | 'Culture' | 'Economics';

// UI 主题：支持浅色、深色、护眼的羊皮纸色
export type Theme = 'light' | 'dark' | 'sepia' | 'system';

export interface User {
  name: string;
  email: string;
  preferences: Category[];
}

// 核心：词汇条目设计，包含语境翻译和查询计数
export interface VocabItem {
  word: string;
  pronunciation?: string; // 音标
  definition: string; // 基础中文释义
  context_translation: string; // 在当前句子中的具体含义（非常重要！）
  type: string; // 词性
  queryCount?: number; // 用户查询次数，用于识别“顽固生词”
}

export interface ArticleParagraph {
  en: string;
  cn: string;
}

// 英语学习文章内容模型
export interface ArticleContent {
  title: string;
  subtitle: string;
  author: string;
  date: string;
  difficulty: 'B1' | 'B2' | 'C1' | 'C2'; // 对应欧洲语言参考标准，帮用户选对难度
  readTimeMin: number;
  paragraphs: ArticleParagraph[];
  vocabulary: VocabItem[]; // AI 预选的重点词汇
}

export interface ArticlePreview {
  id: string;
  title: string;
  summary: string;
  category: Category;
  imageUrl: string;
  date: string;
  source?: string;
}

export interface DailyQuote {
  en: string;
  cn: string;
  author: string;
  category: string; 
  imageUrl: string;
}
