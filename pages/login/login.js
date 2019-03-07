// pages/login/login.js
var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  bindGetDentistInfo: function (e) {
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '登录中',
      })

      //用户按了允许授权按钮
      app.globalData.userInfo = e.detail.userInfo;
      app.globalData.encryptedData = e.detail.encryptedData;
      app.globalData.vi = e.detail.vi;

      db.collection('administrator').doc(app.globalData.openid).get({
        success(res) {
          // 更新管理员信息
          db.collection('administrator').doc(app.globalData.openid).update({
            data: {
              wechatInfo: {
                nickName: app.globalData.userInfo.nickName,
                avatarUrl: app.globalData.userInfo.avatarUrl,
                gender: app.globalData.gender, // 性别 0：未知、1：男、2：女
                province: app.globalData.userInfo.province,
                city: app.globalData.userInfo.city,
                country: app.globalData.userInfo.country,
              },
            },
            success(res) {
              // 转到管理员页面
              wx.hideLoading();
              wx.redirectTo({
                url: "/pages/dentist/dentist",
              })
            },
            fail(res) {
              // update fail
              // to be done
            }
          })
        },
        fail(res) {
          // 更新用户信息
          db.collection('userInfo').doc(app.globalData.openid).update({
            data: {
              wechatInfo: {
                nickName: app.globalData.userInfo.nickName,
                avatarUrl: app.globalData.userInfo.avatarUrl,
                gender: app.globalData.gender, // 性别 0：未知、1：男、2：女
                province: app.globalData.userInfo.province,
                city: app.globalData.userInfo.city,
                country: app.globalData.userInfo.country,
              },
            },
            success(res) {
              wx.hideLoading();
              // 用户不是管理员
              wx.showModal({
                title: '警告',
                content: '您未注册为医生，将以用户身份登录。',
                success(res) {
                  if (res.confirm) {
                    // 跳转进入用户首页
                    wx.switchTab({
                      url: "/pages/index/index",
                    })
                  } else if (res.cancel) {
                    // 用户点击取消
                  }
                }
              })
            },
            fail(res) {
              // update fail
              // to be done
            }
          })
        }
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '授权后才可登录',
        showCancel: false,
        confirmText: '返回',
        success(res) {
          if (res.confirm) {
            console.log('用户点击了“返回”')
          }
        }
      })
    }
  },

  bindGetPatientInfo: function (e) {
    if (e.detail.userInfo) {
      wx.showLoading({
        title: '登录中',
      })

      //用户按了允许授权按钮
      app.globalData.userInfo = e.detail.userInfo;
      app.globalData.encryptedData = e.detail.encryptedData;
      app.globalData.vi = e.detail.vi;

      db.collection('userInfo').doc(app.globalData.openid).update({
        data: {
          wechatInfo: {
            nickName: app.globalData.userInfo.nickName,
            avatarUrl: app.globalData.userInfo.avatarUrl,
            gender: app.globalData.gender, // 性别 0：未知、1：男、2：女
            province: app.globalData.userInfo.province,
            city: app.globalData.userInfo.city,
            country: app.globalData.userInfo.country,
          },
        },
        success(res) {
          // 更新成功
          // 授权成功后，跳转进入用户首页
          wx.hideLoading();
          wx.switchTab({
            url: "/pages/index/index",
          })
        },
        fail(res) {
          // update fail
          // to be done
          console.log(res)
        }
      })
    } else {
      // 用户按了拒绝按钮
      wx.showModal({
        title:'警告',
        content:'授权后才可登录',
        showCancel:false,
        confirmText:'返回',
        success(res){
          if (res.confirm) {
            console.log('用户点击了“返回”')
          }
        }
      })
    }
  }
})