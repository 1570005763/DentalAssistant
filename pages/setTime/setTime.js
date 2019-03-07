// pages/setTime/setTime.js
const db = wx.cloud.database();
Page({
  data: {
    year: 0,
    month: 0,
    day: 0,
    date: 0,
    idx: '',
    dateStr: ['日', '一', '二', '三', '四', '五', '六'],
    thisMonthDayNum: 0,
    lastMonthDayNum: 0,
    viewShow: [false, false, false, false, false, false],
    time: ['9:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'],
    index: [
      { timeId: 0, reserved: 0, total: 0 },
      { timeId: 1, reserved: 0, total: 0 },
      { timeId: 2, reserved: 0, total: 0 },
      { timeId: 3, reserved: 0, total: 0 },
      { timeId: 4, reserved: 0, total: 0 },
      { timeId: 5, reserved: 0, total: 0 }
    ],
    patient: [[], [], [], [], [], []],
    patientInfo: [[], [], [], [], [], []],
    range: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },

  onLoad: function (options) {
    this.setData({
      year: parseInt(options.year),
      month: parseInt(options.month),
      day: parseInt(options.day),
      date: parseInt(options.date)
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
      idx: '' + that.data.year + '/' + that.data.month + '/' + that.data.day
    });

    db.collection('appointment').doc(that.data.idx).get({
      success(res) {
        // 查询成功
        that.setData({
          index: res.data.index,
          patient: [res.data.patient0, res.data.patient1, res.data.patient2, res.data.patient3, res.data.patient4, res.data.patient5]
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
      }
    })
  },

  lastDay: function () {
    let year = (this.data.day == 1 && this.data.month - 2 < 0) ? this.data.year - 1 : this.data.year;
    let month = this.data.day == 1 ? (this.data.month - 2 < 0 ? 11 : this.data.month - 2) : this.data.month - 1;
    let day = this.data.day == 1 ? (this.data.lastMonthDayNum) : this.data.day - 1;
    let date = this.data.date == 1 ? 7 : this.data.date - 1;
    this.setData({
      year: year,
      month: month + 1,
      day: day,
      date: date,
      viewShow: [false, false, false, false, false, false]
    })
    this.dateInit(year, month);
  },

  nextDay: function () {
    let year = (this.data.day == this.data.thisMonthDayNum && this.data.month > 11) ? this.data.year + 1 : this.data.year;
    let month = this.data.day == this.data.thisMonthDayNum ? (this.data.month > 11 ? 0 : this.data.month) : this.data.month - 1;
    let day = this.data.day == this.data.thisMonthDayNum ? 1 : this.data.day + 1;
    let date = this.data.date == 7 ? 1 : this.data.date + 1;
    this.setData({
      year: year,
      month: month + 1,
      day: day,
      date: date,
      viewShow: [false, false, false, false, false, false]
    })
    this.dateInit(year, month);
  },

  bindPickerChange: function (e) {
    var index = 'index[' + e.currentTarget.dataset.i + '].total';
    this.setData({
      [index]: parseInt(e.detail.value)
    })
  },

  bindSubmit: function () {
    wx.showLoading({
      title: '提交中',
    })

    var that = this;

    // 检查数据是否合法
    // 检查时间
    let now = new Date();
    let curYear = now.getFullYear();
    let curMonth = now.getMonth() + 1;
    let curDay = now.getDate();
    if (that.data.year < curYear || (that.data.year == curYear && that.data.month < curMonth) || (that.data.year == curYear && that.data.month == curMonth && that.data.day <= curDay)) {
      wx.hideLoading();
      wx.showModal({
        title: '警告',
        content: that.data.year + '年' + that.data.month + '月' + that.data.day + '日数据不可修改。',
        showCancel: false,
        success(res) {
          if (res.confirm) {
            // 用户点击确定
          }
        }
      })
      return;
    }

    // 检查人数
    for (var item in that.data.index) {
      if (item.total < item.reserved) {
        wx.hideLoading();
        wx.showModal({
          title: '警告',
          content: that.data.time[item.timeId] + '可约人数必须大于已约人数。',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              // 用户点击确定
            }
          }
        })
        return;
      }
    }

    // 提交更新数据
    db.collection('appointment').doc(that.data.idx).get({
      success(res) {
        // 已有该日数据，需更新
        wx.cloud.callFunction({
          // 云函数名称
          name: 'setAppointment',
          // 传给云函数的参数
          data: {
            idx: that.data.idx,
            index: that.data.index
          },
          success(res) {
            wx.hideLoading();
            // 更新成功
            wx.navigateTo({
              url: '/pages/success/success?title=' + that.data.year + '年' + that.data.month + '月' + that.data.day + '日预约'
            })
          },
          fail(res) {
            wx.hideLoading();
            // 更新失败
            wx.showToast({
              title: '提交失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      },
      fail(res) {
        // 没有该日数据，需插入
        db.collection('appointment').add({
          data: {
            _id: that.data.idx,
            year: that.data.year,
            month: that.data.month,
            day: that.data.day,
            index: that.data.index,
            patient0: [],
            patient1: [],
            patient2: [],
            patient3: [],
            patient4: [],
            patient5: []
          },
          success(res) {
            wx.hideLoading();
            // 插入成功
            wx.navigateTo({
              url: '/pages/success/success?title=' + that.data.year + '年' + that.data.month + '月' + that.data.day + '日预约'
            })
          },
          fail(res) {
            wx.hideLoading();
            // 插入失败
            wx.showToast({
              title: '提交失败',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }
    })
  },

  toggle: function (e) {
    var that = this;

    let idx = e.currentTarget.dataset.i;
    let viewShow = 'viewShow[' + idx + ']';
    that.setData({
      [viewShow]: !that.data.viewShow[idx]
    })

    if (that.data.patient[idx].length != 0 && that.data.patientInfo[idx].length == 0) {
      queryPatientInfo(that, idx);
    }
  }
})

function queryPatientInfo(that, idx) {
  // 查询病人具体信息
  const _ = db.command;
  db.collection('userInfo').where({
    _id: _.in(that.data.patient[idx])
  })
    .get({
      success(res) {
        // 已有用户数据
        let patientInfo = 'patientInfo[' + idx + ']';
        that.setData({
          [patientInfo]: res.data
        })
      },
      fail(res) {
        // 查询失败
        wx.showToast({
          title: '查询失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
}