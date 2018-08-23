const Koa = require('koa');
const Crawler = require("crawler");

const app = new Koa();

const main = ctx => {
  ctx.response.body = 'Hello koa';
};

app.use(main);

var c = new Crawler({
  maxConnections: 10,
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      console.log($("title").text());
    }
    done();
  }
});

// Queue just one URL, with default callback
c.queue('http://www.baidu.com');

app.listen(3000);
console.info('server start in 3000 port')