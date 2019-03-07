// pages/index/index.js
var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    navbarActiveIndex: 0,
    navbarTitle: [
      "口腔知识",
      "医疗活动",
      "病例展示"
    ],
    dbTable: ['article_knowledge', 'article_activity', 'article_case'],
    lists: [[], [], []],
    skip: [0, 0, 0],
    isEnd: [false, false, false],
    isLoading: [true, true, true]
  },

  onLoad: function (options) {
    loadNews(this, this.data.navbarActiveIndex, 10, true);
  },

  bindPullDownRefresh: function () {
    var that = this;
    let skip = 'skip[' + that.data.navbarActiveIndex + ']';
    let lists = 'lists[' + that.data.navbarActiveIndex + ']';
    let isEnd = 'isEnd[' + that.data.navbarActiveIndex + ']';
    this.setData({
      [skip]: 0,
      [lists]: [],
      [isEnd]: false
    })

    loadNews(that, that.data.navbarActiveIndex, 10, true);
  },

  bindReachBottom: function () {
    var that = this;
    // 没有更多了
    if (that.data.isEnd[that.data.navbarActiveIndex]) {
      return;
    }

    loadNews(that, that.data.navbarActiveIndex, 20, false);
  },

  onNavBarTap: function (event) {
    var that = this;

    // 获取点击的navbar的index
    let navbarTapIndex = event.currentTarget.dataset.navbarIndex
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    that.setData({
      navbarActiveIndex: navbarTapIndex
    })

    if (that.data.lists[that.data.navbarActiveIndex].length == 0 && that.data.isEnd[that.data.navbarActiveIndex] == false) {
      loadNews(that, that.data.navbarActiveIndex, 10, true);
    }
  },

  onBindAnimationFinish: function ({ detail }) {
    var that = this;
    // 设置data属性中的navbarActiveIndex为当前点击的navbar
    that.setData({
      navbarActiveIndex: detail.current
    })

    if (that.data.lists[that.data.navbarActiveIndex].length == 0 && that.data.isEnd[that.data.navbarActiveIndex] == false) {
      loadNews(that, that.data.navbarActiveIndex, 10, true);
    }
  }
})

function loadNews(that, idx, num, init) {
  let isLoading = 'isLoading[' + idx + ']';
  that.setData({
    [isLoading]: true
  })

  if (init) {
    db.collection(that.data.dbTable[idx]).limit(num)
      .get({
        success(res) {
          // res.data 包含该记录的数据
          let skip = 'skip[' + idx + ']';
          let lists = 'lists[' + idx + ']';
          let isEnd = 'isEnd[' + idx + ']';
          let isLoading = 'isLoading[' + idx + ']';
          that.setData({
            [skip]: res.data.length,
            [lists]: that.data.lists[idx].concat(res.data),
            [isEnd]: res.data.length < num ? true : false,
            [isLoading]: false
          })
        },
        fail(res) {
          let isLoading = 'isLoading[' + idx + ']';
          that.setData({
            [isLoading]: false
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
    db.collection(that.data.dbTable[idx])
      .skip(that.data.skip[idx]).limit(num)
      .get({
        success(res) {
          // res.data 包含该记录的数据
          let skip = 'skip[' + idx + ']';
          let lists = 'lists[' + idx + ']';
          let isEnd = 'isEnd[' + idx + ']';
          let isLoading = 'isLoading[' + idx + ']';
          that.setData({
            [skip]: that.data.skip[idx] + res.data.length,
            [lists]: that.data.lists[idx].concat(res.data),
            [isEnd]: res.data.length < num ? true : false,
            [isLoading]: false
          })
          wx.stopPullDownRefresh();
        },
        fail(res) {
          let isLoading = 'isLoading[' + idx + ']';
          that.setData({
            [isLoading]: false
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