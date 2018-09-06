const Crawler = require("crawler");
const fs = require("fs");
const colors = require( "colors")

const URL = 'https://gz.ke.com/ershoufang/pg';

// 区域
const COMMUNITY = ['tianhe', 'haizhu', 'yuexiu', 'panyu', 'baiyun', 'liwan', 'huangpugz'];
// const COMMUNITY = ['panyu'];

// 每个区域的小区总页数
const COMMUNITY_PATH = {
  'tianhe': []
}


function getPageCount(community) {
  return new Promise((resolve, reject) => {
    var c = new Crawler({
      maxConnections: 10,
      callback: function (error, res, done) {
        if (error) {
          console.log(error);
        } else {
          var $ = res.$;
          const pageData = $(".house-lst-page-box").attr('page-data') && JSON.parse($(".house-lst-page-box").attr('page-data'));
          resolve(initUrlArr(pageData.totalPage, community));
        }
        done();
      }
    });
    // Queue just one URL, with default callback
    c.queue(`https://gz.ke.com/xiaoqu/${community}/`);
  });
}


function initUrlArr(totalPage, community) {
  const arr = [];
  for(let i=1; i<=totalPage; i++) {
    arr.push(`https://gz.ke.com/xiaoqu/${community}/pg${i}/`);
  }
  return arr;
}

async function startCrawl() {
  const dataMap = {};
  for(let keys of COMMUNITY) {
    const paths = await getPageCount(keys);
    COMMUNITY_PATH[keys] = paths;
  }
  for(let keys of COMMUNITY) {
    const objData = await crawlPage(COMMUNITY_PATH[keys], keys);
    dataMap[keys] = objData;
  }
  // console.log(dataMap);
  writeFile(dataMap);
}

async function crawlPage(paths, community) {
  let data = [];
  console.log(`开始爬取${community}地区的小区数据`.yellow);
  for(var i=0, len=paths.length; i<len; i++) {
    const arr = await parsePage(paths[i]);
    data = data.concat(arr);
    console.log(`爬取${community}地区，第${i + 1}页数据成功！`.green);
  }
  return data;
}
/**
 * communityId 小区ID
 * url 详情链接
 * title 小区名称
 * unitPrice 单价
 * region 地区
 * year 年代
 * count 在售总数
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
          const $list = $('.listContent>li');
          const len = $list.length;
          const arr = [];
          for (let i = 0; i < len; i++) {
            const $elem = $($list[i]);
            const $title = $elem.find('.title a');
            const communityId = $elem.data('id');
            const url = $title.attr('href');
            const title = $title.text();
            const unitPrice = $elem.find('.xiaoquListItemPrice .totalPrice>span').text();
            const region = $elem.find('.positionInfo .district').text() + $elem.find('.positionInfo .bizcircle').text()
            const year = $elem.find('.positionInfo').text().split('/')[1];
            const count = $elem.find('.xiaoquListItemSellCount .totalSellCount span').text();

            arr.push({
              communityId,
              url,
              title,
              unitPrice,
              region,
              year,
              count,
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
  fs.writeFile(`data/community/community-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.json`, JSON.stringify(data), function (err) {
    if (err) {
      return console.error(err);
    }
    console.log("数据写入成功！");
  });
}

module.exports = startCrawl;