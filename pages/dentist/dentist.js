// pages/dentist/dentist.js
var app = getApp();
Page({
  data: {
    userInfo: null,
  },

  onLoad: function (options) {
    var that = this;
    // 检测是否存在用户信息
    if (app.globalData.userInfo != null) {
      that.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      // app.getUserInfo()
    }
  }
})