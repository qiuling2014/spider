const Koa = require('koa');
const route = require('koa-route')

const startCrawl = require('./spiderHouse');
const util = require('./util');

const DATA1 = require('./data/2018-8-25.json');
const DATA2 = require('./data/2018-8-31.json');
const DATA3 = require('./data/2018-9-7.json');

const app = new Koa();

console.log( Object.keys(DATA3).length)

startCrawl();
// util.diffData(DATA1, DATA2);
// console.log(util.getAverage(DATA1));

const main = ctx => {
  ctx.response.body = '<H1>HELLO</H1>';
};

app.use(route.get('/', main));

app.listen(3000);

console.info('server start in 3000 port');