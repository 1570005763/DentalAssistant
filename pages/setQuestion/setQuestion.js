// pages/setQuestion/setQuestion.js
const db = wx.cloud.database();
Page({
  data: {
    question: [],
    questionTime: [],
    skip: 0,
    isEnd: false,
    isLoading: true
  },

  onLoad: function (options) {
    loadQuestion(this, 10, true);
  },

  onPullDownRefresh: function () {
    this.setData({
      question: [],
      questionTime: [],
      skip: 0,
      isEnd: false
    })
    loadQuestion(this, 20, true);
  },
  
  onReachBottom: function () {
    if (this.data.isEnd) {
      return;
    }
    loadQuestion(this, 20, false);
  },

  bindIgnore: function (event) {
    var that = this;
    wx.showModal({
      title: '警告',
      content: '忽略后将不再提醒并加入历史咨询，但仍可作答，是否忽略？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '提交请求',
          })
          wx.cloud.callFunction({
            name: 'ignoreQuestion',
            data: {
              id: event.currentTarget.id
            },
            success(res) {
              wx.hideLoading();
              wx.showToast({
                title: '已忽略',
              })
              that.setData({
                question: [],
                questionTime: [],
                skip: 0,
                isEnd: false
              })
              loadQuestion(that, 10, true);
            },
            fail(res) {
              // fail
              wx.showToast({
                title: '操作失败，请重试',
              })
            }
          })
        } else if (res.cancel) {
          // cancel
        }
      }
    })
  }
})

function loadQuestion(that, num, init) {
  that.setData({
    isLoading: true
  })

  if (init) {
    db.collection("question").where({
      isFinish: false,
      isIgnored: false
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
            question: res.data,
            questionTime: time,
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
            title: '咨询加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })
  } else {
    db.collection("question").where({
      isFinish: false,
      isIgnored: false
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
            question: that.data.question.concat(res.data),
            questionTime: that.data.questionTime.concat(time),
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