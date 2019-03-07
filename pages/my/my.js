// pages/my/my.js
var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    userInfo: null,
    gridList: [
      { enName: 'myQuestionnaire', zhName: '趣问卷', icon: '/images/myQuestionnaire.png' },
      { enName: 'myAppointment', zhName: '我的预约', icon: '/images/myAppointment.png' },
      { enName: 'myQuestion', zhName: '我的咨询', icon: '/images/myQuestion.png' },
      { enName: 'myInfo', zhName: '我的信息', icon: '/images/myInfo.png' },
      { enName: 'mySetting', zhName: '设置', icon: '/images/mySetting.png' }
    ],
    newAnswer: 0
  },

  onLoad: function (options) {
    var that = this;
    // 检测是否存在用户信息
    if (app.globalData.userInfo != null) {
      that.setData({
        userInfo: app.globalData.userInfo
      })
    } else {
      // app.getUserInfo()
    }
  },
  
  onTabItemTap: function () {
    checkNewAnswer(this, app.globalData.openid);
  },

  viewGridDetail: function (e) {
    var data = e.currentTarget.dataset;
    if (data.idx == 2) {
      this.setData({
        newAnswer: 0
      })
    }
    wx.navigateTo({
      url: "/pages/" + data.url + '/' + data.url
    })
  }
})

function checkNewAnswer(that, openid) {
  db.collection('question').where({
      openid: openid,
      haveNewAnswer: true
    })
    .get({
      success(res) {
        console.log(res.data.length);///////////////
        that.setData({
          newAnswer: res.data.length
        })
      },
      fail(res) {
        // fail
        // to be done
      }
    })
}