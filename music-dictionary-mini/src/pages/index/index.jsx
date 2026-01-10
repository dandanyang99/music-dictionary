import Taro, { useState } from '@tarojs/taro';
import { View, Input, Picker, Button, Text, ScrollView } from '@tarojs/components';
import request from '../../utils/request';
import { LANG_LIST, getLangName } from '../../constants/lang';
import './index.less';

export default function Index() {
  // 状态管理
  const [sourceWord, setSourceWord] = useState(''); // 输入的词汇
  const [sourceLang, setSourceLang] = useState('zh'); // 源语种
  const [translateResult, setTranslateResult] = useState(null); // 翻译结果
  const [loading, setLoading] = useState(false); // 加载状态

  // 语种选择器的列数据
  const pickerColumns = LANG_LIST.map(item => item.name);

  // 切换语种
  const onLangChange = (e) => {
    const index = e.detail.value[0];
    setSourceLang(LANG_LIST[index].code);
  };

  // 提交查询
  const handleQuery = async () => {
    if (!sourceWord.trim()) {
      Taro.showToast({ title: '请输入音乐词汇', icon: 'none' });
      return;
    }

    setLoading(true);
    try {
      const res = await request.post('/word/query', {
        source_word: sourceWord.trim(),
        source_lang: sourceLang
      });
      setTranslateResult(res.data);
    } catch (err) {
      console.error('查询失败：', err);
    } finally {
      setLoading(false);
    }
  };

  // 渲染翻译结果
  const renderResult = () => {
    if (!translateResult) return null;

    // 提取所有目标语种翻译
    const targetLangKeys = Object.keys(translateResult).filter(key => key.startsWith('target_lang_'));

    return (
      <ScrollView className="result-container" scrollY>
        <View className="result-title">
          <Text className="source-word">{translateResult.source_word}</Text>
          <Text className="source-lang">（{getLangName(translateResult.source_lang)}）</Text>
        </View>
        {targetLangKeys.map(key => {
          const langCode = key.replace('target_lang_', '');
          const translateValue = translateResult[key];
          if (!translateValue) return null;
          return (
            <View className="result-item" key={key}>
              <Text className="lang-label">{getLangName(langCode)}：</Text>
              <Text className="translate-text">{translateValue}</Text>
            </View>
          );
        })}
        {translateResult.professional_mean && (
          <View className="prof-mean">
            <Text className="label">专业释义：</Text>
            <Text className="content">{translateResult.professional_mean}</Text>
          </View>
        )}
        {translateResult.data_source === 'AI翻译' && (
          <View className="tips">
            <Text>⚠️ 该结果由AI翻译生成，仅供参考</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View className="index-page">
      <View className="search-container">
        <Input
          className="word-input"
          placeholder="请输入音乐词汇（如：钢琴、piano、pianoforte）"
          value={sourceWord}
          onChange={(e) => setSourceWord(e.detail.value)}
          disabled={loading}
        />
        <Picker
          mode="selector"
          columns={pickerColumns}
          value={[LANG_LIST.findIndex(item => item.code === sourceLang)]}
          onChange={onLangChange}
          disabled={loading}
        >
          <View className="lang-picker">
            <Text>{getLangName(sourceLang)}</Text>
          </View>
        </Picker>
        <Button
          className="query-btn"
          type="primary"
          loading={loading}
          onClick={handleQuery}
        >
          翻译查询
        </Button>
      </View>

      {renderResult()}
    </View>
  );
}