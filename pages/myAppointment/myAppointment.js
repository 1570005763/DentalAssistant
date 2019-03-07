// pages/myAppointment/myAppointment.js
var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    appointments: [],
    reservedAppointment: null,
    today: 0,
    time: ['9:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'],
    idx: ''
  },

  onLoad: function (options) {
    var that = this;
    db.collection('userInfo').doc(app.globalData.openid).get({
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
              reservedAppointment: curAppointment,
              idx: '' + reservedDate.getFullYear() + '/' + (reservedDate.getMonth() + 1) + '/' + reservedDate.getDate()
            })
          }
        }
      },
      fail(res) {
        // 加载失败
        // to be done
      }
    })
  },

  bindMakeAppointment: function () {
    wx.redirectTo({
      url: "/pages/appointment/appointment"
    })
  },

  bindCancelAppointment: function () {
    var that = this;
    let reservedDate = new Date(that.data.reservedAppointment.date);
    wx.showModal({
      title: '取消预约',
      content: '是否取消您在' + reservedDate.getFullYear() + '年' + (reservedDate.getMonth() + 1) + '月' + reservedDate.getDate() + '日' + that.data.time[that.data.reservedAppointment.time] + '的预约？',
      success(res) {
        if (res.confirm) {
          // 用户点击确定
          wx.showLoading({
            title: '正在取消',
          })

          // 查询数据
          db.collection('appointment').doc(that.data.idx).get({
            success(res) {
              // 更新数据
              var index = res.data.index;
              var patients = [res.data.patient0, res.data.patient1, res.data.patient2, res.data.patient3, res.data.patient4, res.data.patient5];
              index[that.data.reservedAppointment.time].reserved = index[that.data.reservedAppointment.time].reserved - 1;
              patients[that.data.reservedAppointment.time].splice(patients[that.data.reservedAppointment.time].indexOf(app.globalData.openid), 1);

              // 上传数据
              wx.cloud.callFunction({
                name: 'cancelAppointment',
                data: {
                  reservedTime: that.data.reservedAppointment.time,
                  idx: that.data.idx,
                  index: index,
                  patients: patients[that.data.reservedAppointment.time]
                },
                success(res) {
                  // 更新个人信息
                  let reservedAppointment = that.data.reservedAppointment;
                  reservedAppointment.avaliable = false;
                  reservedAppointment.timestamp = new Date();
                  db.collection('userInfo').doc(app.globalData.openid).update({
                    data: {
                      appointment: [].concat(reservedAppointment, that.data.appointments)
                    },
                    success(res) {
                      // 取消成功
                      that.setData({
                        reservedAppointment: null,
                        appointments: [].concat(reservedAppointment, that.data.appointments)
                      })

                      wx.hideLoading();
                      wx.showToast({
                        title: '取消成功',
                        icon: 'success',
                        duration: 2000
                      })
                    },
                    fail(res) {
                      // 更新失败
                      wx.hideLoading();
                      wx.showModal({
                        title: '取消失败',
                        content: '请在网络稳定后重试。',
                        showCancel: false,
                        success(res) {
                          if (res.confirm) {
                            // 用户点击确定
                          }
                        }
                      })
                    }
                  })
                },
                fail(res) {
                  // 更新失败
                  wx.hideLoading();
                  wx.showModal({
                    title: '预约失败',
                    content: '请在网络稳定后重试。',
                    showCancel: false,
                    success(res) {
                      if (res.confirm) {
                        // 用户点击确定
                      }
                    }
                  })
                }
              })
            },
            fail(res) {
              wx.hideLoading();
              wx.showModal({
                title: '预约失败',
                content: '请在网络稳定后重试。',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    // 用户点击确定
                  }
                }
              })
            }
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
  }
})