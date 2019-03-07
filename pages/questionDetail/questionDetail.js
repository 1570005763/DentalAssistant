// pages/questionDetail/questionDetail.js
var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    id: null,
    question: null,
    urlAsk: [],
    urlAnswer: [],
    time: { year: ' ', month: ' ', date: ' ' }
  },

  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    loadQuestion(this);
  },
  
  onPullDownRefresh: function () {
    loadQuestion(this);
  },

  bindPreview: function (event) {
    var url = this.data.urlAsk.concat(this.data.urlAnswer)
    var urls = [];
    for (var i = 0; i < url.length; ++i) {
      urls.push(url[i].tempFileURL)
    }
    wx.previewImage({
      current: event.currentTarget.id,
      urls: urls
    })
  },

  bindCancelQuestion: function () {
    var that = this;
    wx.showLoading({
      title: '取消中',
    })
    db.collection('question').doc(that.data.id).update({
      data: {
        isCancel: true,
        isFinish: true
      },
      success(res) {
        that.setData({
          'question.isCancel': true,
          'question.isFinish': true
        })
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

function loadQuestion(that) {
  db.collection('question').doc(that.data.id).get({
    success(res) {
      that.setData({
        question: res.data,
        time: {
          year: res.data.timestamp.getFullYear(),
          month: res.data.timestamp.getMonth() + 1,
          date: res.data.timestamp.getDate()
        }
      })

      // 取消新回答提醒
      if (that.data.question.haveNewAnswer) {
        db.collection('question').doc(that.data.id).update({
          data: {
            haveNewAnswer: false,
          },
          success(res) {
            // success
          },
          fail(res) {
            // fail
          }
        })
      }

      wx.cloud.getTempFileURL({
        fileList: that.data.question.files,
        success(res) {
          // fileList 是一个有如下结构的对象数组
          // [{
          //    fileID: 'cloud://xxx.png', // 文件 ID
          //    tempFileURL: '', // 临时文件网络链接
          //    maxAge: 120 * 60 * 1000, // 有效期
          // }]
          that.setData({
            urlAsk: res.fileList
          })
        },
        fail(res) {
          // fail
          var urls = [];
          for (var i = 0; i < that.data.question.files.length; ++i) {
            urls.push("/images/image-load-error.png");
          }
          that.setData({
            urlAsk: urls
          })
        }
      })
      wx.cloud.getTempFileURL({
        fileList: that.data.question.answer.files,
        success(res) {
          // fileList 是一个有如下结构的对象数组
          // [{
          //    fileID: 'cloud://xxx.png', // 文件 ID
          //    tempFileURL: '', // 临时文件网络链接
          //    maxAge: 120 * 60 * 1000, // 有效期
          // }]
          that.setData({
            urlAnswer: res.fileList
          })
        },
        fail(res) {
          // fail
          var urls = [];
          for (var i = 0; i < that.data.question.answer.files.length; ++i) {
            urls.push("/images/image-load-error.png");
          }
          that.setData({
            urlAnswer: urls
          })
        }
      })
      wx.stopPullDownRefresh();
    },
    fail(res) {
      // fail
      // to be done
    }
  })
}
