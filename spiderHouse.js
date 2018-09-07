const Crawler = require("crawler");
const fs = require("fs");
const colors = require( "colors");
const community = require("./data/community/community-2018-9-6.json");
const config = require("./config.js");

let communityPaths = [];
config.region.forEach((region) => {
  community[region].forEach((item) => {
    const pageCount = Math.ceil(item.count / 30);
    const paths = initUrlArr(pageCount, item.communityId);
    communityPaths = communityPaths.concat(paths);
  });
});


function crawlPage(url) {
  return new Promise((resolve, reject) => {
    var c = new Crawler({
      maxConnections: 10,
      rateLimit: 500, // `maxConnections` 会强制为1个
      callback: function (error, res, done) {
        if (error) {
          console.log(error);
        } else {
          console.log(url);
          var $ = res.$;
          const dataArr = parsePage($);
          resolve(dataArr);
        }
        done();
      }
    });
    // Queue just one URL, with default callback
    c.queue(url);
  })
}

function initUrlArr(totalPage, communityId) {
  const arr = [];
  for(let i=1; i<=totalPage; i++) {
    arr.push(`https://gz.ke.com/ershoufang/pg${i}c${communityId}`);
  }
  return arr;
}


/**
 * houseId 房子ID
 * url 详情链接
 * title 标题
 * unitPrice 单价
 * totalPrice 总价
 * publishDate 发布时间
 * community 小区
 * communityId 小区ID
 * area 面积
 * elevator 电梯
 * region 地区
 * houseType 户型
 * direction 朝向
 * quality 装修资料
 */
function parsePage($) {
  const $list = $('.sellListContent').eq(0).find('li');
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
    });
  }
  return arr;
}

async function startCrawl() {
  let data = [];
  for(var i=0, len=communityPaths.length; i<len; i++) {
    const arr = await crawlPage(communityPaths[i]);
    data = data.concat(arr);
    console.log(`爬取第${i + 1}页数据成功！`, arr.length);
  }
  writeFile(parseData(data));

  // const promises = communityPaths.map((path) => {
  //   return crawlPage(path)
  // });
  // await Promise.all(promises).then(function (data) {
  //   console.log(data);    
  // });
}

// 数据格式化
function parseData(arr) {
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
