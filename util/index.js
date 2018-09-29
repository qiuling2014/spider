
const colors = require( "colors")

function diffData(data1, data2) {
  const keys = Object.keys(data1);
  const keys2 = Object.keys(data2);
  const newData = [];
  const diffData = [];
  // 找出价格变化
  keys.forEach((key) => {
    if (data2[key] && (data1[key].totalPrice !== data2[key].totalPrice || data1[key].unitPrice !== data2[key].unitPrice)) {
      diffData.push(data2[key])
    }
  });
  
  const upArr = [];
  const downArr = [];
  let upCount = 0;
  let downCount = 0;
  
  diffData.forEach((item) => {
    const key = item.houseId;
    const data1_totalPrice = data1[key].totalPrice;
    const data2_totalPrice = data2[key].totalPrice;
    const data1_unitPrice = data1[key].unitPrice;
    const data2_unitPrice = data2[key].unitPrice;
    if (data1_unitPrice > data2_unitPrice) {
      console.log(`${data2[key].houseId} ${data2[key].region} ${data2[key].community}：单价下跌↓，由${data1_unitPrice}下降至${data2_unitPrice}，总价：${data1_totalPrice} => ${data2_totalPrice}，跌幅${ ((data1_unitPrice - data2_unitPrice)/data1_unitPrice * 100).toFixed(2) + '%' }`.green);
      downCount++
      downArr.push(item);
    } else {
      console.log(`${data2[key].houseId} ${data2[key].region} ${data2[key].community}：单价上涨↑，由${data1_unitPrice}上涨至${data2_unitPrice}，总价：${data1[key].totalPrice} => ${data2[key].totalPrice}`.red);    
      upCount++;
      downArr.push(item);    
    }
  });
  console.log(`总计${diffData.length}套价格变化，${upCount}套单价上涨，${downCount}套单价下跌`.yellow);

  return {
    upArr,
    downArr
  }
}
// 求平均单价
function getAverage(arr) {
  const length = arr.length;
  if (!length) {
    return 0;
  }
  let count = 0;
  arr.forEach((item) => {
    count += item.unitPrice;
  });
  return Math.floor(count/length);
}

module.exports = {
  diffData,
  getAverage
};
