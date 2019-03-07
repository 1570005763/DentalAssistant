// pages/question/question.js
var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    radioItems: [
      { name: '男', value: '1', checked: false },
      { name: '女', value: '2', checked: false }
    ],
    gender: null,
    age: '',
    title: '',
    content: '',
    files: [],
    fileId: [],
    uploadStatus: [],
    maxFile: 3,
    num: 0,
    maxNum: 500,
    time: '',
    permission: null
  },

  onLoad: function (options) {
    var that = this;

    var now = new Date();
    that.setData({
      time: '' + now.getFullYear() + '.' + (now.getMonth() + 1) + '.' + now.getDate() + '_' + now.getHours() + '.' + now.getMinutes() + '.' + now.getSeconds()
    })

    db.collection('userInfo').doc(app.globalData.openid).get({
      success(res) {
        that.setData({
          gender: res.data.gender,
          age: res.data.age,
          permission: res.data.permissionQuestion
        })
        if (that.data.gender != null) {
          var radioItems = that.data.radioItems;
          for (var i = 0, len = radioItems.length; i < len; ++i) {
            radioItems[i].checked = radioItems[i].value == that.data.gender;
          }
          that.setData({
            radioItems: radioItems
          });
        }
      },
      fail(res) {
        // fail
      }
    })
  },

  radioChange: function (e) {
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }
    this.setData({
      gender: e.detail.value,
      radioItems: radioItems
    });
  },

  bindAgeChange: function (e) {
    this.setData({
      age: e.detail.value
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

  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.files // 需要预览的图片http链接列表
    })
  },

  bindSubmit() {
    var that = this;

    if (that.data.gender == null) {
      wx.showToast({
        title: '请选择性别!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.age == '') {
      wx.showToast({
        title: '年龄不能为空!',
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
    if (that.data.content == '') {
      wx.showToast({
        title: '内容不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.age.length >= 3) {
      wx.showToast({
        title: '请输入正确的年龄!',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    wx.showLoading({
      title: '提交中',
    })
    db.collection('question').where({
      openid: app.globalData.openid,
      isFinish: false
    })
      .get({
        success(res) {
          if (res.data.length >= 3) {
            wx.hideLoading();
            wx.showModal({
              title: '提交失败',
              content: '您有' + res.data.length + '个进行中咨询，已达到上限，是否查看？',
              success(res) {
                if (res.confirm) {
                  // 用户点击确定
                  wx.redirectTo({
                    url: "/pages/myQuestion/myQuestion"
                  })
                }
                else if (res.cancel) {
                  // 用户点击取消
                }
              },
              fail(res) {
                console.log('fail');
                // to be done
              }
            })
            return
          } else if(that.data.permission == true) {
            wx.hideLoading();
            wx.showModal({
              title: '预约失败',
              content: '您没有预约权限，请联系***确认。',
              success(res) {
                if (res.confirm) {
                  // 用户点击确定
                  // to be done
                }
                else if (res.cancel) {
                  // 用户点击取消
                }
              },
              fail(res) {
                console.log('fail');
                // to be done
              }
            })
            return;
          }

          db.collection('question').add({
            data: {
              openid: app.globalData.openid,
              gender: that.data.gender,
              age: that.data.age,
              title: that.data.title,
              content: that.data.content,
              files: that.data.fileId,
              timestamp: new Date(),
              answer: {
                content: '',
                files: []
              },
              isFinish: false,
              isCancel: false,
              haveNewAnswer: false,
              isIgnored: false
            },
            success(res) {
              db.collection('userInfo').doc(app.globalData.openid).update({
                data: {
                  gender: that.data.gender,
                  age: that.data.age
                },
                success(res) {
                  // success
                },
                fail() {
                  // fail
                }
              })

              // 提交成功
              wx.hideLoading();
              wx.showModal({
                title: '提交成功',
                content: '将返回上一页',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    // 返回首页
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }
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
  }
})

function uploadCloudFile(that, idx, path, name) {
  var uploadTask = wx.cloud.uploadFile({
    cloudPath: 'question/' + app.globalData.openid + '/' + that.data.time + '/' + name.path.slice(11),
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
    }
  })
  uploadTask.onProgressUpdate((res) => {
    let uploadStatusProgress = 'uploadStatus[' + idx + '].progress';
    that.setData({
      [uploadStatusProgress]: res.progress
    })
  })
}