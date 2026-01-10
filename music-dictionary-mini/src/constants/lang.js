// 语种列表
export const LANG_LIST = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: '英文' },
  { code: 'it', name: '意大利文' },
  { code: 'fr', name: '法文' },
  { code: 'de', name: '德文' },
  { code: 'ru', name: '俄文' },
  { code: 'es', name: '西班牙文' }
];

// 获取语种名称
export const getLangName = (code) => {
  const lang = LANG_LIST.find(item => item.code === code);
  return lang ? lang.name : code;
};