// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'test-199cdb' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  if (event.add) {
    return await db.collection('blacklist').doc(event.openid).set({
      data: {
        openid: event.openid
      }
    })
  } else {
    return await db.collection('blacklist').doc(event.openid).remove({})
  }
}