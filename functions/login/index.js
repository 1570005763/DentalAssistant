// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'test-199cdb' })

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    openid: wxContext.OPENID,
    unionid: wxContext.UNIONID,
  }
}