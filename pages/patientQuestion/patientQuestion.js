// pages/patientQuestion/patientQuestion.js
const db = wx.cloud.database();
Page({
  data: {
    openid: null,
    currentQuestion: [],
    historyQuestion: [],
    currentQuestionTime: [],
    historyQuestionTime: [],
    skip: 0,
    isEnd: false,
    isLoading: true
  },

  onLoad: function (options) {
    this.setData({
      openid: options.openid
    })
    loadCurrentQuestion(this, this.data.openid);
    loadHistoryQuestion(this, this.data.openid, 10, true);
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
    loadCurrentQuestion(this, this.data.openid);
    loadHistoryQuestion(this, this.data.openid, 10, true);
  },

  onReachBottom: function () {
    if (this.data.isEnd) {
      return;
    }
    loadHistoryQuestion(this, app.globalData.openid, 20, false);
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