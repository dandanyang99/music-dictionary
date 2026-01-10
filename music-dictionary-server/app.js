const Koa = require('koa');
const koaBody = require('koa-body');
const wordRouter = require('./router/word');
require('dotenv').config();

const app = new Koa();
const port = process.env.PORT || 3000;

// 中间件
app.use(koaBody()); // 解析请求体
app.use(async (ctx, next) => {
  // 跨域处理
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
    return;
  }
  await next();
});

// 注册路由
app.use(wordRouter.routes()).use(wordRouter.allowedMethods());

// 启动服务器
app.listen(port, () => {
  console.log(`后端服务器运行在：http://localhost:${port}`);
});