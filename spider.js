const Crawler = require("crawler");
const fs = require("fs");

const URL = 'https://gz.ke.com/ershoufang/pg';

function initUrlArr(totalPage) {
  const arr = [];
  for(let i=1; i<=totalPage; i++) {
    arr.push(URL + i);
  }
  return arr;
}

function getPage() {
  return new Promise((resolve, reject) => {
    var c = new Crawler({
      maxConnections: 10,
      callback: function (error, res, done) {
        if (error) {
          console.log(error);
        } else {
          var $ = res.$;
          const pageData = JSON.parse($(".house-lst-page-box").attr('page-data'));
          resolve(initUrlArr(pageData.totalPage));
        }
        done();
      }
    });
    // Queue just one URL, with default callback
    c.queue('https://gz.ke.com/ershoufang/pg1/');
  })
}

function startCrawl() {
  getPage().then(async (paths) => {
    const objData = await crawlPage(paths);
    console.log(`${paths.length}页数据爬取完成，开始保存文件！`);
    writeFile(objData);
  });
}

async function crawlPage(paths) {
  let data = [];
  for(var i=0, len=paths.length; i<len; i++) {
    const arr = await parsePage(paths[i]);
    data = data.concat(arr);
    console.log(`爬取第${i + 1}页数据成功！继续加油⛽️`, arr.length);
  }
  return parseData(data);
}
/**
 * houseId 房子ID
 * url 详情链接
 * title 标题
 * unitPrice 单价
 * totalPrice 总价
 * publishDate 发布时间
 * community 小区
 * area 面积
 * elevator 电梯
 * region 地区
 * houseType 户型
 * direction 朝向
 * quality 装修资料
 */
function parsePage(path) {
  return new Promise((resolve, rejct) => {
    var c = new Crawler({
      maxConnections: 10,
      callback: function (error, res, done) {
        if (error) {
          console.log(error);
        } else {
          var $ = res.$;
          const $list = $('.sellListContent>li');
          const len = $list.length;
          const arr = [];
          for (let i = 0; i < len; i++) {
            const $elem = $($list[i]);
            const $title = $elem.find('.title a');
            const $address = $elem.find('.address .houseInfo');
            const $flood = $elem.find('.flood .positionInfo');
            const $followInfo = $elem.find('.followInfo');
            const addressArr = $address.text().split(' | ');
            const floodArr = $flood.text().split('  -  ');
            const followInfoArr = $followInfo.text().split(' / ');
            const title = $title.text();
            const url = $title.attr('href');
            const community = addressArr[0];
            const houseType = addressArr[1];
            const area = addressArr[2];
            const direction = addressArr[3];
            const quality = addressArr[4];
            const elevator = addressArr[5];
            const region = floodArr[1];
            const unitPrice = $elem.find('.priceInfo .unitPrice').text().match(/(\d+)/g)[0];
            const totalPrice = $elem.find('.priceInfo .totalPrice').text();
            const publishDate = followInfoArr[2];
            const houseId = url.match(/(\d+)/g)[0];
            arr.push({
              title,
              url,
              community,
              houseType,
              area,
              direction,
              quality,
              elevator,
              region,
              unitPrice,
              totalPrice,
              publishDate,
              houseId
            })
          }
          resolve(arr);
        }
        done();
      }
    });
    // Queue just one URL, with default callback
    c.queue(path);
  });
}
// 数据格式化
function parseData(arr) {
  console.log(arr.length);
  const obj = {};
  arr.forEach((item) => {
    if (obj[item.houseId]) {
      console.log(obj[item.houseId].title, item.title);
    }
    obj[item.houseId] = item;
  });
  return obj;
}

// 写文件
function writeFile(data) {
  const date = new Date();
  fs.writeFile(`data/${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.json`, JSON.stringify(data), function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("数据写入成功！");
  });
}

module.exports = startCrawl;