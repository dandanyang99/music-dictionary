const axios = require('axios');
const crypto = require('crypto');
const querystring = require('querystring');
require('dotenv').config();

// 语种映射（百度翻译语种码）
const langMap = {
  zh: 'zh', // 中文
  en: 'en', // 英文
  it: 'it', // 意大利文
  fr: 'fra',// 法文
  de: 'de', // 德文
  ru: 'ru', // 俄文
  es: 'spa' // 西班牙文
};

// 生成百度翻译签名
function generateSign(query, salt, appId, secretKey) {
  const str = appId + query + salt + secretKey;
  return crypto.createHash('md5').update(str).digest('hex');
}

// 百度翻译核心方法
async function baiduTranslate(query, fromLang, toLang) {
  try {
    const appId = process.env.BAIDU_APP_ID;
    const secretKey = process.env.BAIDU_SECRET_KEY;
    const salt = Date.now().toString();
    const from = langMap[fromLang] || fromLang;
    const to = langMap[toLang] || toLang;
    const sign = generateSign(query, salt, appId, secretKey);

    const data = {
      q: query,
      from,
      to,
      appid: appId,
      salt,
      sign
    };

    const response = await axios.post(
      'https://fanyi-api.baidu.com/api/trans/vip/translate',
      querystring.stringify(data),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (response.data.error_code) {
      throw new Error(`翻译失败：${response.data.error_msg}`);
    }

    // 提取翻译结果
    return response.data.trans_result[0].dst;
  } catch (err) {
    console.error('百度翻译接口调用失败：', err);
    throw err;
  }
}

// 批量翻译（源词汇 → 所有目标语种）
async function batchTranslate(word, fromLang) {
  const targetLangs = ['zh', 'en', 'it', 'fr', 'de', 'ru', 'es'].filter(lang => lang !== fromLang);
  const result = {};

  for (const lang of targetLangs) {
    try {
      result[`target_lang_${lang}`] = await baiduTranslate(word, fromLang, lang);
    } catch (err) {
      result[`target_lang_${lang}`] = '';
      console.error(`翻译${lang}失败：`, err.message);
    }
  }

  return result;
}

module.exports = { baiduTranslate, batchTranslate, langMap };