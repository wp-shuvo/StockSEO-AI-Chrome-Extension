const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateSEO = async (imageUrl) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Act as an Adobe Stock SEO expert. Analyze this image: ${imageUrl}
Generate exactly two parts:
TITLE: A descriptive SEO optimized title (max 180 characters)
KEYWORDS: Exactly 49 relevant, single-word keywords separated by commas.

Most important keywords first. No numbering or extra text.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  console.log('Gemini Raw:', text);

  // Improved Parsing logic
  const titlePart = text.match(/TITLE:\s*(.*)/i);
  const keywordsPart = text.match(/KEYWORDS:\s*(.*)/is);

  const title = titlePart ? titlePart[1].trim() : 'Stock Image SEO';
  const keywordsStr = keywordsPart ? keywordsPart[1].trim() : '';
  const keywords = keywordsStr.split(',')
    .map(k => k.trim().replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ''))
    .filter(k => k.length > 0);

  return { title, keywords: keywords.slice(0, 49) };
};

module.exports = { generateSEO };
