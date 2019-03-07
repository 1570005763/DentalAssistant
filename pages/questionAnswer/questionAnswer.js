// pages/questionAnswer/questionAnswer.js
const db = wx.cloud.database();
Page({
  data: {
    id: null,
    userInfo: null,
    question: null,
    url: [],
    files: [],
    fileId: [],
    uploadStatus: [],
    maxFile: 3,
    time: { year: ' ', month: ' ', date: ' ' },
    num: 0,
    maxNum: 500,
    timestamp: ''
  },

  onLoad: function (options) {
    var now = new Date();
    this.setData({
      id: options.id,
      timestamp: '' + now.getFullYear() + '.' + (now.getMonth() + 1) + '.' + now.getDate() + '_' + now.getHours() + '.' + now.getMinutes() + '.' + now.getSeconds()
    })
    loadQuestion(this);
  },

  bindPreview: function (event) {
    var url = this.data.url.concat(this.data.files)
    var urls = [];
    for (var i = 0; i < url.length; ++i) {
      urls.push(url[i].tempFileURL)
    }
    wx.previewImage({
      current: event.currentTarget.id,
      urls: urls
    })
  },

  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },

  bindContentChange(e) {
    this.setData({
      content: e.detail.value,
      num: e.detail.value.length
    })
  },

  chooseImage: function (e) {
    var that = this;
    wx.chooseImage({
      count: that.data.maxFile - that.data.files.length,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var filePath = res.tempFilePaths;
        var fileName = res.tempFiles;
        var fileLen = that.data.files.length;
        that.setData({
          files: that.data.files.concat(filePath)
        });
        for (var i = 0; i < filePath.length; ++i) {
          that.setData({
            uploadStatus: that.data.uploadStatus.concat({ progress: 0, error: false })
          });
          uploadCloudFile(that, fileLen + i, filePath[i], fileName[i]);
        }
      }
    })
  },

  bindSubmit() {
    var that = this;

    if (that.data.content == '') {
      wx.showToast({
        title: '内容不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    wx.showLoading({
      title: '提交中',
    })
    db.collection('question').doc(that.data.id).get({
      success(res) {
        if (res.data.isCancel) {
          wx.hideLoading();
          wx.showModal({
            title: '提交失败',
            content: '用户刚刚取消了此咨询',
          })
        } else {
          wx.cloud.callFunction({
            // 云函数名称
            name: 'setQuestion',
            // 传给云函数的参数
            data: {
              id: that.data.id,
              content: that.data.content,
              files: that.data.fileId
            },
            success(res) {
              // 提交成功
              wx.hideLoading();
              wx.redirectTo({
                url: '/pages/success/success?title=' + that.data.question.title
              })
            },
            fail(res) {
              // 提交失败
              wx.hideLoading();
              wx.showToast({
                title: '提交失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      },
      fail(res) {
        // fail
        wx.hideLoading();
        wx.showToast({
          title: '提交失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  bindIgnore: function () {
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
              id: that.data.id
            },
            success(res) {
              that.setData({
                'question.isIgnored': true
              })
              wx.hideLoading();
              wx.showToast({
                title: '已忽略',
              })
            },
            fail(res) {
              // fail
              wx.showToast({
                title: '操作失败，请重试',
                icon: 'none',
                duration: 2000
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

      db.collection('userInfo').doc(that.data.question.openid).get({
        success(res) {
          that.setData({
            userInfo: res.data.wechatInfo
          })
        },
        fail(res) {
          wx.showToast({
            title: '用户加载失败',
            icon: 'none',
            duration: 2000
          })
        }
      })

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
            url: res.fileList
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
            files: res.fileList
          })
        },
        fail(res) {
          // fail
          var urls = [];
          for (var i = 0; i < that.data.question.answer.files.length; ++i) {
            urls.push("/images/image-load-error.png");
          }
          that.setData({
            files: urls
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

function uploadCloudFile(that, idx, path, name) {
  var uploadTask = wx.cloud.uploadFile({
    cloudPath: 'answer/' + that.data.timestamp + '/' + name.path.slice(11),
    filePath: path, // 文件路径
    success(res) {
      // get resource ID
      let fileId = 'fileId[' + idx + ']';
      that.setData({
        [fileId]: res.fileID
      })
    },
    fail(res) {
      // handle error
      let uploadStatusError = 'uploadStatus[' + idx + '].error';
      that.setData({
        [uploadStatusError]: true
      })
      var p = 'answer/' + that.data.timestamp + '/' + name.path.slice(11);
    }
  })
  uploadTask.onProgressUpdate((res) => {
    let uploadStatusProgress = 'uploadStatus[' + idx + '].progress';
    that.setData({
      [uploadStatusProgress]: res.progress
    })
  })
}