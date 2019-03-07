// pages/index/index.js
const db = wx.cloud.database();
Page({
  data: {
    trends: [],
    skip: 0,
    isEnd: false,
    isLoading: true
  },

  onLoad: function (options) {
    loadTrends(this, 20, true);
  },

  onPullDownRefresh: function () {
    this.setData({
      trends: [],
      skip: 0,
      isEnd: false
    })
    loadTrends(this, 20, true)
  },

  onReachBottom: function () {
    if (this.data.isEnd) { // 没有更多了
      return;
    }
    loadTrends(this, 20, false);
  }
})

function loadTrends(that, num, init) {
  that.setData({
    isLoading: true
  })

  if (init) {
    db.collection('trends')
      .orderBy('timestamp', 'desc').limit(num)
      .get({
        success(res) {
          // res.data 包含该记录的数据
          that.setData({
            skip: that.data.skip + res.data.length,
            trends: that.data.trends.concat(res.data),
            isEnd: res.data.length < num ? true : false,
            isLoading: false
          })
          wx.stopPullDownRefresh();
        },
        fail(res) {
          that.setData({
            isLoading: false
          })
          // 读取失败
          wx.showToast({
            title: '动态加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
  } else {
    db.collection('trends')
      .orderBy('timestamp', 'desc')
      .skip(that.data.skip).limit(num)
      .get({
        success(res) {
          // res.data 包含该记录的数据
          that.setData({
            skip: that.data.skip + res.data.length,
            trends: that.data.trends.concat(res.data),
            isEnd: res.data.length < num ? true : false,
            isLoading: false
          })
        },
        fail(res) {
          that.setData({
            isLoading: false
          })
          // 读取失败
          wx.showToast({
            title: '动态加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
  }
}