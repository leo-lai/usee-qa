//app.js
import config from 'config'

App({
  onLaunch: function () {
    // 获取用户信息
    this.login()
  },
  post: function(url = '', data = {}) {
    return new Promise((resolve, reject) => {
      wx.request({
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        url,
        data,
        success: resolve,
        fail: reject
      })
    })
  },
  login: function () {
    // 登录, 获取用户信息
    wx.login({
      success: loginRes => {
        // 发送 loginRes.code 到后台换取 openId, sessionKey, unionId
        wx.getUserInfo({
          withCredentials: true,
          success: userInfoRes => {
            // 可以将 userInfoRes 发送给后台解码出 unionId
            userInfoRes.code = loginRes.code
            this.post(config.userInfo, userInfoRes).then((apiRes) => {
              this.globalData.userInfo = apiRes.data

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(apiRes.data)
              }
            }).catch((err) => {
              console.log('获取用户信息失败！' + err)
            })
          }
        })
      }
    })
  },
  globalData: {
    userInfo: null
  }
})