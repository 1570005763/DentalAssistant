// pages/appointment/appointment.js
const db = wx.cloud.database();
Page({
  data: {
    year: 0,
    month: 0,
    today: 0,
    totalDayNum: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: 0,
  }, 

  onLoad: function (options) {
    let now = new Date()
    let year = now.getFullYear()
    let month = now.getMonth() + 1
    this.setData({
      year: year,
      month: month,
      today: now,
      isToday: '' + year + month + now.getDate(),
    })
    this.dateInit();
  },

  dateInit: function (setYear, setMonth) {
    var that = this;
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = [];
    //需要遍历的日历数组数据
    let arrLen = 0;
    //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth();
    //没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + '/' + (month + 1) + '/' + 1).getDay();
    //目标月1号对应的星期
    let dayNums = new Date(year, nextMonth, 0).getDate();
    //获取目标月有多少天
    let obj = {};
    let num = 0;
    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    that.setData({
      totalDayNum: dayNums
    })

    // 查询预约情况
    let total = [];
    let reserved = [];
    for (let i = 0; i <= that.data.totalDayNum; ++i) {
      total[i] = 0;
      reserved[i] = 0;
    }
    db.collection('appointment').where({
      year: that.data.year,
      month: that.data.month
    })
      .get({
        success(res) {
          // 查询成功
          let len = res.data.length;
          for (let i = 0; i < len; ++i) {
            let totalSum = 0;
            let reservedSum = 0;
            for (let j = 0; j < 6; ++j) {
              totalSum += res.data[i].index[j].total;
              reservedSum += res.data[i].index[j].reserved;
            }
            total[res.data[i].day] = totalSum;
            reserved[res.data[i].day] = reservedSum;
          }

          var curDate = new Date();
          arrLen = startWeek + dayNums;
          for (let i = 0; i < arrLen; i++) {
            if (i >= startWeek) {
              num = i - startWeek + 1;
              var nowDate = new Date(year, month, num);
              obj = {
                isToday: '' + year + (month + 1) + num,
                yearNum: year,
                monthNum: month + 1,
                dayNum: num,
                day: i % 7 + 1,
                isAvaliable: reserved[num] < total[num] && nowDate > curDate,
                isSet: total[num] != 0,
                reserved: reserved[num],
                total: total[num]
              }
            } else {
              obj = {};
            }
            dateArr[i] = obj;
          }
          that.setData({
            dateArr: dateArr
          })
        },
        fail(res) {
          // 查询失败
          console.log(res);
        }
      })
  },

  lastMonth: function () {
    // 限制前翻
    // to be done
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: month + 1,
    })
    this.dateInit(year, month);
  },

  nextMonth: function () {
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: month + 1
    })
    this.dateInit(year, month);
  },

  bindNavigator: function (e) {
    let item = e.currentTarget.dataset.item;
    if (item.yearNum < this.data.today.getFullYear() || (item.yearNum == this.data.today.getFullYear() && item.monthNum < this.data.today.getMonth() + 1) || (item.yearNum == this.data.today.getFullYear() && item.monthNum == this.data.today.getMonth() + 1 && item.dayNum <= this.data.today.getDate())) {
      wx.showToast({
        title: '不可预约的时间',
        icon: 'none',
        duration: 1500
      })
    }
    else {
      wx.navigateTo({
        url: '/pages/appointmentTime/appointmentTime?year=' + item.yearNum + '&month=' + item.monthNum + '&date=' + item.dayNum + '&day=' + item.day
      })
    }
  }
})