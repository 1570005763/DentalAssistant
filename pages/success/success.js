// pages/success/success.js
Page({
  data: {
    title: null
  },

  onLoad: function (options) {
    this.setData({
      title: options.title
    })
  },

  bindComfirm: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  bindBack: function () {
    wx.reLaunch({
      url: '/pages/login/login',
    })
  }
})