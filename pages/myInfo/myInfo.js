// pages/myInfo/myInfo.js
var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    showModalStatus: false,
    name: null,
    gender: null,
    age: null,
    phoneNumber: null,
    tmpName: null,
    tmpGender: null,
    tmpAge: null,
    tmpPhoneNumber: null
  },

  onLoad: function (options) {
    var that = this;
    db.collection('userInfo').doc(app.globalData.openid).get({
      success(res) {
        // 获取用户信息
        that.setData({
          name: res.data.name,
          gender: res.data.gender,
          age: res.data.age,
          phoneNumber: res.data.phoneNumber
        })
      },
      fail(res) {
        // 获取失败
        wx.showToast({
          title: '信息获取失败,请在网络稳定后刷新。',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  bindUpdate: function () {
    var that = this;
    that.setData({
      tmpName: that.data.name,
      tmpGender: that.data.gender,
      tmpAge: that.data.age,
      tmpPhoneNumber: that.data.phoneNumber,
      showModalStatus: true
    })
  },

  bindConfirm: function () {
    var that = this;
    // 检查输入内容
    if (that.data.tmpName == null) {
      wx.showToast({
        title: '姓名不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.tmpGender == null) {
      wx.showToast({
        title: '性别不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.tmpAge == null) {
      wx.showToast({
        title: '年龄不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.tmpPhoneNumber == null) {
      wx.showToast({
        title: '手机号不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.tmpAge.length >= 3) {
      wx.showToast({
        title: '请输入正确的年龄!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.tmpPhoneNumber.length != 11) {
      wx.showToast({
        title: '手机号长度有误!',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    wx.showLoading({
      title: '更新中',
    })

    // 提交更新用户信息
    db.collection('userInfo').doc(app.globalData.openid).update({
      data: {
        name: that.data.tmpName,
        gender: that.data.tmpGender,
        age: that.data.tmpAge,
        phoneNumber: that.data.tmpPhoneNumber
      },
      success(res) {
        // 更新成功
        that.setData({
          name: that.data.tmpName,
          gender: that.data.tmpGender,
          age: that.data.tmpAge,
          phoneNumber: that.data.tmpPhoneNumber,
          showModalStatus: false
        });
        wx.hideLoading();
        wx.showToast({
          title: '更新成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail(res) {
        wx.hideLoading();
        wx.showToast({
          title: '更新失败，请在网络稳定后更新。',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  bindCancel: function () {
    this.setData({
      showModalStatus: false
    });
  },

  bindNameInput: function (e) {
    this.setData({
      tmpName: e.detail.value
    })
  },

  bindPhoneInput: function (e) {
    this.setData({
      tmpPhoneNumber: e.detail.value
    })
  },

  bindAgeInput: function (e) {
    this.setData({
      tmpAge: e.detail.value
    })
  },

  bindGenderChange: function (e) {
    this.setData({
      tmpGender: e.detail.value
    })
  }
})