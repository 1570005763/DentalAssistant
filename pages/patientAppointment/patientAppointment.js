// pages/patientAppointment/patientAppointment.js
const db = wx.cloud.database();
Page({
  data: {
    openid: null,
    appointments: [],
    reservedAppointment: null,
    today: 0,
    time: ['9:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00']
  },

  onLoad: function (options) {
    var that = this;
    that.setData({
      openid: options.openid
    })
    db.collection('userInfo').doc(that.data.openid).get({
      success(res) {
        // 获取预约信息
        that.setData({
          appointments: res.data.appointment,
          today: new Date()
        })

        // 确定当前预约
        if (res.data.appointment.length > 0) {
          let curAppointment = res.data.appointment[0];
          let reservedDate = new Date(curAppointment.date)
          if (reservedDate > that.data.today && curAppointment.avaliable) {
            var newAppointments = res.data.appointment.slice(1);
            that.setData({
              appointments: newAppointments,
              reservedAppointment: curAppointment
            })
          }
        }
      },
      fail(res) {
        // 加载失败
        wx.showToast({
          title: '加载失败',
        })
      }
    })
  },

  onPullDownRefresh: function () {
    var that = this;
    that.setData({
      appointments: [],
      reservedAppointment: null,
      today: 0
    })
    db.collection('userInfo').doc(that.data.openid).get({
      success(res) {
        // 获取预约信息
        that.setData({
          appointments: res.data.appointment,
          today: new Date()
        })

        // 确定当前预约
        if (res.data.appointment.length > 0) {
          let curAppointment = res.data.appointment[0];
          let reservedDate = new Date(curAppointment.date)
          if (reservedDate > that.data.today && curAppointment.avaliable) {
            var newAppointments = res.data.appointment.slice(1);
            that.setData({
              appointments: newAppointments,
              reservedAppointment: curAppointment
            })
          }
        }
        wx.stopPullDownRefresh();
      },
      fail(res) {
        // 加载失败
        wx.showToast({
          title: '加载失败',
        })
        wx.stopPullDownRefresh();
      }
    })
  }
})