// pages/setTrends/setTrends.js
const db = wx.cloud.database();
Page({
  data: {
    time: null,
    title: '',
    content: '',
    url: '',
    num: 0
  },
  
  onLoad: function (options) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();

    this.setData({
      time: '' + year + '-' + month + '-' + date
    })
  },

  bindDateChange(e) {
    this.setData({
      time: e.detail.value
    })
  },

  bindTitleChange: function (e) {
    this.setData({
      title: e.detail.value
    })
  },

  bindContentChange(e) {
    this.setData({
      content: e.detail.value,
      num: e.detail.value.length
    })
  },

  bindUrlChange: function (e) {
    this.setData({
      url: e.detail.value
    })
  },

  bindSubmit() {
    var that = this;

    if (that.data.title == ''){
      wx.showToast({
        title: '标题不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.content == '') {
      wx.showToast({
        title: '内容不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    /*
    if (that.data.url == '') {
      wx.showToast({
        title: '链接不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    */

    var time = new Date(that.data.time);
    db.collection('trends').add({
      data: {
        timestamp: time,
        year: time.getFullYear(),
        month: time.getMonth() + 1,
        date: time.getDate(),
        title: that.data.title,
        content: that.data.content,
        url: that.data.url
      },
      success(res) {
        // 提交成功
        wx.redirectTo({
          url: '/pages/success/success?title=' + that.data.title
        })
      },
      fail(res) {
        // 提交失败
        wx.showToast({
          title: '提交失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  }
})