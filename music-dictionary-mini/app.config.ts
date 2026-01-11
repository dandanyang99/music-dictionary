// music-dictionary/music-dictionary-mini/app.config.ts
export default {
  pages: [
    'pages/index/index', // 你的小程序页面路径，按需添加
    'pages/lang/lang'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '音乐词典',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    // 如有 tabBar 需配置，无则删除
    color: '#333',
    selectedColor: '#1677ff',
    list: []
  },
  // 小程序基础配置
  enableShareAppMessage: true,
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于小程序定位展示'
    }
  }
};