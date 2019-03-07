// pages/patientInfo/patientInfo.js
const db = wx.cloud.database();
Page({
  data: {
    openid: null,
    userInfo: null,
    name: null,
    gender: null,
    age: null,
    phoneNumber: null,
    permissionAppointment: null,
    permissionQuestion: null,
    registrationDate: null,
    year: null,
    month: null,
    date: null
  },

  onLoad: function (options) {
    var that = this;
    that.setData({
      openid: options.openid
    })

    db.collection('userInfo').doc(that.data.openid).get({
      success(res) {
        that.setData({
          userInfo: res.data.wechatInfo,
          name: res.data.name,
          gender: res.data.gender,
          age: res.data.age,
          phoneNumber: res.data.phoneNumber,
          permissionAppointment: res.data.permissionAppointment,
          permissionQuestion: res.data.permissionQuestion,
          registrationDate: res.data.registrationDate,
          year: res.data.registrationDate.getFullYear(),
          month: res.data.registrationDate.getMonth() + 1,
          date: res.data.registrationDate.getDate()
        })
      },
      fail(res) {
        // 查询失败
        wx.showToast({
          title: '加载失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  bindAppointmentChange: function (e) {
    var that = this;
    that.setData({
      permissionAppointment: e.detail.value
    })
    if (e.detail.value == true) {
      wx.showModal({
        title: '警告',
        content: '将禁止 ' + that.data.userInfo.nickName + ' 进行预约',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '提交中',
            })
            wx.cloud.callFunction({
              name: 'setPermission',
              data: {
                openid: that.data.openid,
                permissionAppointment: true,
                permissionQuestion: that.data.permissionQuestion
              },
              success(res) {
                updateBlacklist(that);
                wx.hideLoading();
                wx.showToast({
                  title: '已禁止',
                  icon: 'none',
                  duration: 2000
                })
              },
              fail(res) {
                // 查询失败
                that.setData({
                  permissionAppointment: false
                })
                wx.hideLoading();
                wx.showToast({
                  title: '禁止失败，请检查网络后重试',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          } else if (res.cancel) {
            that.setData({
              permissionAppointment: false
            })
          }
        }

      })
    } else {
      wx.showLoading({
        title: '提交中',
      })
      wx.cloud.callFunction({
        name: 'setPermission',
        data: {
          openid: that.data.openid,
          permissionAppointment: false,
          permissionQuestion: that.data.permissionQuestion
        },
        success(res) {
          updateBlacklist(that);
          wx.hideLoading();
          wx.showToast({
            title: '解除禁止',
            icon: 'none',
            duration: 2000
          })
        },
        fail(res) {
          // 查询失败
          that.setData({
            permissionAppointment: true
          })
          wx.hideLoading();
          wx.showToast({
            title: '解禁失败，请检查网络后重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },

  bindQuestionChange: function (e) {
    var that = this;
    that.setData({
      permissionQuestion: e.detail.value
    })
    if (e.detail.value == true) {
      wx.showModal({
        title: '警告',
        content: '将禁止 ' + that.data.userInfo.nickName + ' 进行咨询',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '提交中',
            })
            wx.cloud.callFunction({
              name: 'setPermission',
              data: {
                openid: that.data.openid,
                permissionAppointment: that.data.permissionAppointment,
                permissionQuestion: true
              },
              success(res) {
                updateBlacklist(that);
                wx.hideLoading();
                wx.showToast({
                  title: '已禁止',
                  icon: 'none',
                  duration: 2000
                })
              },
              fail(res) {
                // 查询失败
                that.setData({
                  permissionQuestion: false
                })
                wx.hideLoading();
                wx.showToast({
                  title: '禁止失败，请检查网络后重试',
                  icon: 'none',
                  duration: 2000
                })
              }
            })
          } else if (res.cancel) {
            that.setData({
              permissionQuestion: false
            })
          }
        }

      })
    } else {
      wx.showLoading({
        title: '提交中',
      })
      wx.cloud.callFunction({
        name: 'setPermission',
        data: {
          openid: that.data.openid,
          permissionAppointment: that.data.permissionAppointment,
          permissionQuestion: false
        },
        success(res) {
          updateBlacklist(that);
          wx.hideLoading();
          wx.showToast({
            title: '解除禁止',
            icon: 'none',
            duration: 2000
          })
        },
        fail(res) {
          // 查询失败
          that.setData({
            permissionQuestion: true
          })
          wx.hideLoading();
          wx.showToast({
            title: '解禁失败，请检查网络后重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  }
})

function updateBlacklist(that) {
  if (that.data.permissionAppointment || that.data.permissionQuestion) {
    wx.cloud.callFunction({
      name: 'setBlacklist',
      data: {
        add: true,
        openid: that.data.openid
      },
      success(res) {
        // 成功
      },
      fail(res) {
        // 失败
      }
    })
  } else {
    wx.cloud.callFunction({
      name: 'setBlacklist',
      data: {
        add: false,
        openid: that.data.openid
      },
      success(res) {
        // 成功
      },
      fail(res) {
        // 失败
      }
    })
  }
}