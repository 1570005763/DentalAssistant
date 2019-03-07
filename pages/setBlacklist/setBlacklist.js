// pages/setBlacklist/setBlacklist.js
const db = wx.cloud.database();
Page({
  data: {
    patient: [],
    patientInfo: [],
    skip: 0,
    isLoading: false,
    isEnd: false
  },

  onLoad: function (options) {
    loadPatient(this, 15, true);
  },

  onPullDownRefresh: function () {
    this.setData({
      patient: [],
      patientInfo: [],
      skip: 0,
      isEnd: false
    })
    loadPatient(this, 15, true);
  },

  onReachBottom: function () {
    loadPatient(this, 20, false);
  }
})

function loadPatient(that, num, init) {
  that.setData({
    isLoading: true
  })

  if (init) {
    db.collection("blacklist").limit(num)
      .get({
        success(res) {
          // res.data 包含该记录的数据
          var patient = [];
          for (var i = 0; i < res.data.length; ++i) {
            patient.push(res.data[i].openid);
          }
          that.setData({
            skip: res.data.length,
            patient: patient,
            isEnd: res.data.length < num ? true : false
          })

          const _ = db.command;
          db.collection('userInfo').where({
            _id: _.in(patient)
          })
            .get({
              success(res) {
                // 已有用户数据
                that.setData({
                  patientInfo: res.data,
                  isLoading: false
                })
                wx.stopPullDownRefresh();
              },
              fail(res) {
                // 查询失败
                wx.showToast({
                  title: '加载失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
        },
        fail(res) {
          that.setData({
            isLoading: false
          })
          // 读取失败
          wx.showToast({
            title: '黑名单加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
  } else {
    db.collection("blacklist")
      .skip(that.data.skip).limit(num)
      .get({
        success(res) {
          // res.data 包含该记录的数据
          var patient = [];
          for (var item in res.data){
            patient.push(item.openid);
          }
          that.setData({
            skip: res.data.length,
            patient: that.data.patient.concat(patient),
            isEnd: res.data.length < num ? true : false
          })

          const _ = db.command;
          db.collection('userInfo').where({
            _id: _.in(patient)
          })
            .get({
              success(res) {
                // 已有用户数据
                that.setData({
                  patientInfo: that.data.patientInfo.concat(res.data),
                  isLoading: false
                })
              },
              fail(res) {
                // 查询失败
                wx.showToast({
                  title: '加载失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
        },
        fail(res) {
          that.setData({
            isLoading: false
          })
          // 读取失败
          wx.showToast({
            title: '黑名单加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
  }
}