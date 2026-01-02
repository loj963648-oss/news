
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ArticleContent, ArticlePreview, Category, DailyQuote, VocabItem } from "../types";

// 初始化 Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CACHE_TTL = 3600000; // 缓存有效期 1 小时

/**
 * 缓存管理
 */
const getCache = (key: string) => {
  const item = sessionStorage.getItem(key);
  if (!item) return null;
  try {
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_TTL) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
};

const setCache = (key: string, data: any) => {
  sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
};

/**
 * 获取文章列表：支持自定义抓取数量以节省配额
 */
export const fetchFeed = async (
  category: Category | 'All', 
  limit: number = 6, // 默认 6 篇，初始可传 1
  searchQuery?: string,
  offset: number = 0
): Promise<ArticlePreview[]> => {
  // 缓存键值加入 limit，确保不同请求互不干扰
  const cacheKey = `feed_v6_${category}_${searchQuery || ''}_${offset}_limit_${limit}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const model = "gemini-3-flash-preview"; 
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  let searchContext = searchQuery ? `关于 "${searchQuery}" 的新闻` : (category === 'All' ? '近期备受瞩目的深度报道' : `${category} 领域的最新动态`);

  // 精确化 Prompt，明确要求返回数量
  const prompt = `查找 ${limit} 篇来自 Economist, NYT, The Atlantic 或 Nature 的高质量文章。
  日期范围：最近一周（截至 ${today}）。
  主题：${searchContext}。
  返回格式必须是标准的 JSON 数组：[{"id","title","summary","category","date","source"}]。
  摘要需简洁有力，且适合中高级英语学习者。`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], temperature: 0.1 },
    });

    const articles = extractJsonArray(response.text || "").map((item: any, index: number) => ({
      ...item,
      id: item.id || `art-${Date.now()}-${index + offset}`,
      imageUrl: `https://picsum.photos/1000/700?random=${index + offset + 120}`,
      category: item.category || 'World'
    }));

    if (articles.length > 0) setCache(cacheKey, articles);
    return articles;
  } catch (error) {
    console.error("抓取失败:", error);
    return [];
  }
};

const extractJsonArray = (text: string): any[] => {
  try {
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = text.substring(startIdx, endIdx + 1);
      return JSON.parse(jsonStr);
    }
  } catch (e) {}
  return [];
};

/**
 * 生成全文
 */
export const generateFullArticle = async (
  title: string, 
  category: Category | string, 
  source?: string
): Promise<ArticleContent | null> => {
  const cacheKey = `article_v6_${title.substring(0, 30)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const prompt = `你是一位精通英语教育的资深撰稿人。请针对 "${title}" 撰写一篇深度报道。
  要求：Economist 风格，提供高质量双语对照翻译，挑选 6 个核心考点词汇并给出在此句中的具体释义。标注 CEFR 难度。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: articleSchema, // 引用之前定义的 schema
      },
    });
    const data = JSON.parse(response.text.trim());
    setCache(cacheKey, data);
    return data;
  } catch (e) { return null; }
};

const articleSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subtitle: { type: Type.STRING },
    author: { type: Type.STRING },
    date: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    readTimeMin: { type: Type.INTEGER },
    paragraphs: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: { en: { type: Type.STRING }, cn: { type: Type.STRING } },
        required: ["en", "cn"],
      },
    },
    vocabulary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          pronunciation: { type: Type.STRING },
          definition: { type: Type.STRING },
          context_translation: { type: Type.STRING },
          type: { type: Type.STRING },
        },
        required: ["word", "definition", "context_translation", "type"],
      },
    },
  },
  required: ["title", "subtitle", "author", "paragraphs", "vocabulary", "difficulty"],
};

/**
 * 获取每日金句
 */
export const fetchDailyQuote = async (): Promise<DailyQuote | null> => {
  const cacheKey = `daily_quote_v6_${new Date().toDateString()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "提供一句地道的英语格言，带中文翻译和作者。JSON 格式：{en, cn, author, category}。",
      config: { responseMimeType: "application/json" },
    });
    const data = JSON.parse(response.text.trim());
    data.imageUrl = `https://picsum.photos/1200/800?grayscale&blur=2&seed=${Date.now()}`;
    setCache(cacheKey, data);
    return data;
  } catch (e) { return null; }
};

/**
 * 语境点词翻译
 */
export const explainWordInContext = async (word: string, contextSentence: string): Promise<VocabItem | null> => {
  const cacheKey = `vocab_v6_${word.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `解释单词 "${word}" 在句子 "${contextSentence}" 中的精准含义。JSON：{word, definition, context_translation, type, pronunciation}。`,
      config: { responseMimeType: "application/json" },
    });
    const data = JSON.parse(response.text.trim());
    setCache(cacheKey, data);
    return data;
  } catch (e) { return null; }
};

/**
 * 获取单词发音
 */
export const fetchWordAudio = async (text: string): Promise<string | null> => {
  const cacheKey = `audio_v2_${text.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Pronounce: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
      },
    });
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      setCache(cacheKey, audioData);
      return audioData;
    }
    return null;
  } catch (e) { return null; }
};
