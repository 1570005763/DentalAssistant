// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: 'test-199cdb' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const patient = 'patient' + event.reservedTime
  return await db.collection('appointment').doc(event.idx).update({
    data: {
      index: event.index,
      [patient]: event.patients
    }
  })
}