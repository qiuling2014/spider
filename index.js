const Koa = require('koa');
const startCrawl = require("./spider");

const data = require('./data/2018-8-25.json');


const keys = Object.keys(data);
console.log(keys.length);

const app = new Koa();

// startCrawl();

const main = ctx => {
  ctx.response.body = data;
};

app.use(main);

app.listen(3000);
console.info('server start in 3000 port')