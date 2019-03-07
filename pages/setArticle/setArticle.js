// pages/setArticle/setArticle.js
const db = wx.cloud.database();
Page({
  data: {
    articleType: ["口腔知识", "医疗活动", "病例展示"],
    selectedType: 0,
    title: '',
    abstract: '',
    url: '',
    cover: '',
    dbTable: ['article_knowledge', 'article_activity', 'article_case']
  },

  bindPickerChange: function (e) {
    this.setData({
      selectedType: e.detail.value
    })
  },

  bindUrlChange: function (e) {
    this.setData({
      url: e.detail.value
    })
  },

  bindTitleChange: function (e) {
    this.setData({
      title: e.detail.value
    })
  },

  bindAbstractChange: function (e) {
    this.setData({
      abstract: e.detail.value
    })
  },

  bindCoverChange: function (e) {
    this.setData({
      cover: e.detail.value
    })
  },

  bindSubmit: function () {
    var that = this;

    if (that.data.url == '') {
      wx.showToast({
        title: '链接不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (that.data.title == '') {
      wx.showToast({
        title: '标题不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (that.data.abstract == '') {
      wx.showToast({
        title: '摘要不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (that.data.cover == '') {
      wx.showToast({
        title: '封面链接不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var time = new Date();
    db.collection(that.data.dbTable[that.data.selectedType]).add({
      data: {
        timestamp: time,
        url: that.data.url,
        title: that.data.title,
        abstract: that.data.abstract,
        cover: that.data.cover
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