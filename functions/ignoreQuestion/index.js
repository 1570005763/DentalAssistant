// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'test-199cdb' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('question').doc(event.id).update({
    data: {
      isIgnored: true
    }
  })
}