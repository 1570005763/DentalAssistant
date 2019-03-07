// pages/appointmentTime/appointmentTime.js
var app = getApp();
const db = wx.cloud.database();
Page({
  data: {
    year: 0,
    month: 0,
    date: 0,
    day: 0,
    today: 0,
    idx: '',
    dayStr: ['日', '一', '二', '三', '四', '五', '六'],
    thisMonthDayNum: 0,
    lastMonthDayNum: 0,
    reservedTime: null,
    disabled: [],
    checked: false,
    time: ['9:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'],
    index: [
      { timeId: 0, reserved: 0, total: 0 },
      { timeId: 1, reserved: 0, total: 0 },
      { timeId: 2, reserved: 0, total: 0 },
      { timeId: 3, reserved: 0, total: 0 },
      { timeId: 4, reserved: 0, total: 0 },
      { timeId: 5, reserved: 0, total: 0 }
    ],
    range: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    showModalStatus: false,
    name: '',
    gender: null,
    age: '',
    phoneNumber: '',
    permission: null
  },
  
  onLoad: function (options) {
    this.setData({
      year: parseInt(options.year),
      month: parseInt(options.month),
      date: parseInt(options.date),
      day: parseInt(options.day),
      today: new Date()
    });
    this.dateInit(this.data.year, this.data.month - 1);
  },

  dateInit: function (setYear, setMonth) {
    var that = this;

    let lastDayNums = new Date(setYear, setMonth, 0).getDate();
    let nextMonth = (setMonth + 1) > 11 ? 1 : (setMonth + 1);
    let thisDayNums = new Date(setYear, nextMonth, 0).getDate();
    let nextYear = 0;
    if (setMonth + 1 > 11) {
      nextYear = setYear + 1;
      thisDayNums = new Date(nextYear, nextMonth, 0).getDate();
    }

    that.setData({
      thisMonthDayNum: thisDayNums,
      lastMonthDayNum: lastDayNums,
      idx: '' + that.data.year + '/' + that.data.month + '/' + that.data.date
    });

    db.collection('appointment').doc(that.data.idx).get({
      success(res) {
        // 查询成功
        let dis = []
        for (let i = 0; i < 6; ++i) {
          dis[i] = res.data.index[i].reserved < res.data.index[i].total ? false : true;
        }

        that.setData({
          index: res.data.index,
          disabled: dis
        })
      },
      fail(res) {
        // 未设置
        for (let i = 0; i < 6; ++i) {
          let indexTotal = 'index[' + i + '].total';
          let indexReserved = 'index[' + i + '].reserved';
          that.setData({
            [indexTotal]: 0,
            [indexReserved]: 0
          })
        }

        that.setData({
          disabled: [true, true, true, true, true, true]
        })
      }
    })
  },

  lastDay: function () {
    let year = (this.data.date == 1 && this.data.month - 2 < 0) ? this.data.year - 1 : this.data.year;
    let month = this.data.date == 1 ? (this.data.month - 2 < 0 ? 11 : this.data.month - 2) : this.data.month - 1;
    let date = this.data.date == 1 ? (this.data.lastMonthDayNum) : this.data.date - 1;
    let day = this.data.day == 1 ? 7 : this.data.day - 1;

    // 检验时间有效性
    if (year == this.data.today.getFullYear() && month == this.data.today.getMonth() && date == this.data.today.getDate()) {
      wx.showToast({
        title: '不可预约的时间',
        icon: 'none',
        duration: 1500
      })
      return;
    }

    this.setData({
      year: year,
      month: month + 1,
      date: date,
      day: day,
      checked: false
    })
    this.dateInit(year, month);
  },

  nextDay: function () {
    let year = (this.data.date == this.data.thisMonthDayNum && this.data.month > 11) ? this.data.year + 1 : this.data.year;
    let month = this.data.date == this.data.thisMonthDayNum ? (this.data.month > 11 ? 0 : this.data.month) : this.data.month - 1;
    let date = this.data.date == this.data.thisMonthDayNum ? 1 : this.data.date + 1;
    let day = this.data.day == 7 ? 1 : this.data.day + 1;
    this.setData({
      year: year,
      month: month + 1,
      date: date,
      day: day,
      checked: false
    })
    this.dateInit(year, month);
  },

  radioChange(e) {
    this.setData({
      reservedTime: e.detail.value
    })
  },

  bindSubmit: function () {
    var that = this;

    // 检查数据是否合法
    // 检验空数据
    if (that.data.reservedTime == null) {
      wx.showToast({
        title: '没有选定预约时间',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    wx.showLoading({
      title: '核对中',
    })

    // 检查用户是否已有预约
    db.collection('userInfo').doc(app.globalData.openid).get({
      success(res) {
        // 获取用户信息
        that.setData({
          name: res.data.name,
          gender: res.data.gender,
          age: res.data.age,
          phoneNumber: res.data.phoneNumber,
          permission: res.data.permissionAppointment
        })

        var reservedDate, avaliable = false;
        if (res.data.appointment.length > 0) {
          reservedDate = new Date(res.data.appointment[0].date);
          avaliable = res.data.appointment[0].avaliable;
        }
        if (res.data.appointment.length > 0 && avaliable && reservedDate > that.data.today) {
          wx.hideLoading();
          wx.showModal({
            title: '预约失败',
            content: '您在' + reservedDate.getFullYear() + '年' + (reservedDate.getMonth() + 1) + '月' + reservedDate.getDate() + '日' + that.data.time[res.data.appointment[0].time] + '已有预约，是否查看？',
            success(res) {
              if (res.confirm) {
                // 用户点击确定
                wx.redirectTo({
                  url: "/pages/myAppointment/myAppointment"
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
        } else if (that.data.permission == true) {
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
        } else {
          // 用户个人信息填写
          wx.hideLoading();
          that.setData({
              showModalStatus: true
          });
        }
      },
      fail(res) {
        // 无用户数据
        wx.hideLoading();
        wx.showModal({
          title: '预约失败',
          content: '请在网络稳定后重新预约。',
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

  bindConfirm: function () {
    var that = this;
    // 检查输入内容
    if (that.data.name == '') {
      wx.showToast({
        title: '姓名不能为空!',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.gender == null) {
      wx.showToast({
        title: '性别不能为空!',
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
    if (that.data.phoneNumber == '') {
      wx.showToast({
        title: '手机号不能为空!',
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
    if (that.data.phoneNumber.length != 11) {
      wx.showToast({
        title: '手机号长度有误!',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    that.setData({
      showModalStatus: false
    });

    wx.showLoading({
      title: '预约中',
    })

    // 提交更新用户信息
    db.collection('userInfo').doc(app.globalData.openid).update({
      data: {
        name: that.data.name,
        gender: that.data.gender,
        age: that.data.age,
        phoneNumber: that.data.phoneNumber
      },
      success(res) {
        // 更新成功
        // 检查预约人数是否已满
        const _ = db.command;
        db.collection('appointment').doc(that.data.idx).get({
          success(res) {
            // 更新页面数据
            let dis = []
            for (let i = 0; i < 6; ++i) {
              dis[i] = res.data.index[i].reserved < res.data.index[i].total ? false : true;
            }
            that.setData({
              index: res.data.index,
              disabled: dis
            })

            // 检查是否约满
            if (that.data.index[that.data.reservedTime].reserved == that.data.index[that.data.reservedTime].total) {
              wx.hideLoading();
              wx.showModal({
                title: '预约失败',
                content: '当前时段已约满，请重新预约。',
                showCancel: false,
                success(res) {
                  if (res.confirm) {
                    // 用户点击确定
                  }
                }
              })
              return;
            }

            // 更新页面数据
            dis[that.data.reservedTime] = that.data.index[that.data.reservedTime].reserved + 1 < that.data.index[that.data.reservedTime].total ? false : true;
            let index = 'index[' + that.data.reservedTime + '].reserved';
            that.setData({
              [index]: that.data.index[that.data.reservedTime].reserved + 1,
              disabled: dis
            })

            // 提交更新
            wx.cloud.callFunction({
              name: 'addAppointment',
              data: {
                reservedTime: that.data.reservedTime,
                idx: that.data.idx,
                index: that.data.index,
                openid: app.globalData.openid
              },
              success(res) {
                // 更新个人信息
                let ap = {
                  date: that.data.idx,
                  time: that.data.reservedTime,
                  avaliable: true,
                  timestamp: new Date()
                }
                db.collection('userInfo').doc(app.globalData.openid).update({
                  data: {
                    appointment: _.unshift(ap)
                  },
                  success(res) {
                    // 预约成功
                    wx.hideLoading();
                    wx.showModal({
                      title: '预约成功',
                      content: '您已预约' + that.data.year + '年' + that.data.month + '月' + that.data.date + '日\r\n' + that.data.time[that.data.reservedTime],
                      showCancel: false,
                      success(res) {
                        if (res.confirm) {
                          // 用户点击确定
                        }
                      }
                    })
                  },
                  fail(res) {
                    // 更新失败
                    wx.hideLoading();
                    wx.showModal({
                      title: '预约失败',
                      content: '请在网络稳定后重新预约。',
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
                  content: '请在网络稳定后重新预约。',
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
            // 查询失败
            wx.hideLoading();
            wx.showModal({
              title: '预约失败',
              content: '请在网络稳定后重新预约。',
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
          content: '请在网络稳定后重新预约。',
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

  bindCancel: function () {
    this.setData({
      showModalStatus: false
    });
  },

  bindNameInput: function (e) {
    this.setData({
      name: e.detail.value
    })
  },

  bindPhoneInput: function (e) {
    this.setData({
      phoneNumber: e.detail.value
    })
  },

  bindAgeInput: function (e) {
    this.setData({
      age: e.detail.value
    })
  },

  bindGenderChange: function (e) {
    this.setData({
      gender: e.detail.value
    })
  }
})
