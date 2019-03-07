// pages/myQuestion/myQuestion.js
var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    currentQuestion: [],
    historyQuestion: [],
    currentQuestionTime: [],
    historyQuestionTime: [],
    skip: 0,
    isEnd: false,
    isLoading: true
  },
  
  onLoad: function (options) {
    loadCurrentQuestion(this, app.globalData.openid);
    loadHistoryQuestion(this, app.globalData.openid, 10, true);
  },

  onPullDownRefresh: function () {
    this.setData({
      currentQuestion: [],
      historyQuestion: [],
      currentQuestionTime: [],
      historyQuestionTime: [],
      skip: 0,
      isEnd: false
    })
    loadCurrentQuestion(this, app.globalData.openid);
    loadHistoryQuestion(this, app.globalData.openid, 10, true);
  },

  onReachBottom: function () {
    if (this.data.isEnd) {
      return;
    }
    loadHistoryQuestion(this, app.globalData.openid, 20, false);
  },

  bindAskQuestion: function () {
    wx.redirectTo({
      url: "/pages/question/question"
    })
  },

  bindReadQuestion: function (event) {
    var that = this;
    wx.showLoading({
      title: '设置中',
    })
    db.collection('question').doc(event.currentTarget.id).update({
      data: {
        haveNewAnswer: false,
        isFinish: true
      },
      success(res) {
        that.setData({
          currentQuestion: [],
          historyQuestion: [],
          skip: 0,
          isEnd: false
        })
        loadCurrentQuestion(that, app.globalData.openid);
        loadHistoryQuestion(that, app.globalData.openid, 10, true);
        wx.hideLoading();
        wx.showToast({
          title: '已取消',
        })
      },
      fail(res) {
        wx.hideLoading();
        wx.showToast({
          title: '取消失败',
        })
      }
    })
  },

  bindCancelQuestion: function (event) {
    var that = this;
    wx.showLoading({
      title: '取消中',
    })
    db.collection('question').doc(event.currentTarget.id).update({
      data: {
        isCancel: true,
        isFinish: true
      },
      success(res) {
        that.setData({
          currentQuestion: [],
          historyQuestion: [],
          skip: 0,
          isEnd: false
        })
        loadCurrentQuestion(that, app.globalData.openid);
        loadHistoryQuestion(that, app.globalData.openid, 10, true);
        wx.hideLoading();
        wx.showToast({
          title: '已取消',
        })
      },
      fail(res) {
        wx.hideLoading();
        wx.showToast({
          title: '取消失败',
        })
      }
    })
  }
})

function loadCurrentQuestion(that, openid) {
  const _ = db.command;
  db.collection('question').where(_.or([
    {
      openid: openid,
      isFinish: false
    },
    {
      openid: openid,
      haveNewAnswer: true
    }
  ]))
    .get({
      success(res) {
        var time = [];
        for (var i = 0; i < res.data.length; ++i) {
          time.push({ 
            year: res.data[i].timestamp.getFullYear(),
            month: res.data[i].timestamp.getMonth() + 1,
            date: res.data[i].timestamp.getDate()
          });
        }
        that.setData({
          currentQuestion: res.data,
          currentQuestionTime: time
        })
      },
      fail(res) {
        // fail
        // to be done
      }
    })
}

function loadHistoryQuestion(that, openid, num, init) {
  that.setData({
    isLoading: true
  })

  if (init) {
    db.collection("question").where({
        openid: openid,
        isFinish: true,
        haveNewAnswer: false
      })
      .orderBy('timestamp', 'desc')
      .limit(num)
      .get({
        success(res) {
          var time = [];
          for (var i = 0; i < res.data.length; ++i) {
            time.push({
              year: res.data[i].timestamp.getFullYear(),
              month: res.data[i].timestamp.getMonth() + 1,
              date: res.data[i].timestamp.getDate()
            });
          }
          that.setData({
            skip: res.data.length,
            historyQuestion: res.data,
            historyQuestionTime: time,
            isEnd: res.data.length < num ? true : false,
            isLoading: false
          })
          wx.stopPullDownRefresh();
        },
        fail(res) {
          wx.stopPullDownRefresh();
          that.setData({
            isLoading: false
          })
          // 读取失败
          wx.showToast({
            title: '历史咨询加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
  } else {
    db.collection("question").where({
      openid: openid,
      isFinish: true,
      haveNewAnswer: false
    })
      .orderBy('timestamp', 'desc')
      .skip(that.data.skip).limit(num)
      .get({
        success(res) {
          var time = [];
          for (var i = 0; i < res.data.length; ++i) {
            time.push({
              year: res.data[i].timestamp.getFullYear(),
              month: res.data[i].timestamp.getMonth() + 1,
              date: res.data[i].timestamp.getDate()
            });
          }
          that.setData({
            skip: that.data.skip + res.data.length,
            historyQuestion: that.data.historyQuestion.concat(res.data),
            historyQuestionTime: that.data.historyQuestionTime.concat(time),
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
            title: '历史咨询加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
  }
}