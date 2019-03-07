App({
  globalData: {
    appID: 'wxc8e55628d4b7396c',
    unionid: null,
    openid: null,
    userInfo: null,
    encryptedData: null,
    vi: null
  },

  onLaunch: function() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'test-199cdb'
      })
    }

    // 获取openid
    var that = this;

    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success(res) {
        that.globalData.openid = res.result.openid;
        that.globalData.unionid = res.result.unionid;

        checkUser(that.globalData.openid, that.globalData.unionid);
      },
      fail(res) {
        // to be done
      }
    })
  }
})

function checkUser(openid, unionid) {
  const db = wx.cloud.database();
  /**//////////////////////////////////
  // 临时插入管理员
  db.collection('administrator').doc(openid).get({
    success(res) {
      // 已有用户数据
      console.log(res);
    },
    fail(res) {
      db.collection('administrator').add({
        data: {
          _id: openid,
          unionid: unionid,
          wechatInfo: {
            nickName: null,
            avatarUrl: null,
            gender: null, // 性别 0：未知、1：男、2：女
            province: null,
            city: null,
            country: null
          },
        },
      })
    }
  })
  /**///////////////////////////////////

  // 查询openid，新用户则插入
  db.collection('userInfo').doc(openid).get({
    success(res) {
      // 已有用户数据
      console.log(res);
    },
    fail(res) {
      // 插入新用户openid
      db.collection('userInfo').add({
        data: {
          _id: openid,
          unionid: unionid,
          registrationDate: new Date(),
          wechatInfo: {
            nickName: null,
            avatarUrl: null,
            gender: null, // 性别 0：未知、1：男、2：女
            province: null,
            city: null,
            country: null
          },
          name: null,
          gender: null,
          phoneNumber: null,
          age: null,
          permissionAppointment: false,
          permissionQuestion: false,
          appointment: []
        },
        success(res) {
          console.log(res);
        },
        fail(res) {
          // insert fail
          // to be done
        }
      })
    }
  })
}