// pages/detail/detail.js
Page({
  data: {
    url: null
  },

  onLoad(options) {
    var that = this;
    that.setData({
      url: options.url
    })
  }
})