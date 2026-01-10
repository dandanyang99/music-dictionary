import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code !== 200) {
      Taro.showToast({
        title: res.msg || '请求失败',
        icon: 'none'
      });
      return Promise.reject(res);
    }
    return res;
  },
  error => {
    Taro.showToast({
      title: error.message || '服务器错误',
      icon: 'none'
    });
    return Promise.reject(error);
  }
);

export default request;