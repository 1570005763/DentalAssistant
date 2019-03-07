// pages/questionnaire/questionnaire.js
Page({
  bindSuccess: function(e) {
    console.log("navigate success");
    wx.showToast({
      title: '跳转成功',
      icon: 'success',
      duration: 2000
    })
  },

  bindFail: function (e) {
    console.log(e);
    wx.showToast({
      title: '跳转失败',
      icon: 'none',
      duration: 2000
    })
  },
  
  bindCancel: function(e) {
    wx.navigateBack({
      delta: 1
    })
  }
})