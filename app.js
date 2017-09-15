//app.js
import config from 'config'
import utils from '/script/utils'
import wilddog from '/script/wilddog-weapp-all'

const noop = function () {}
const storage = {
  setItem: (key, value) => {
    try {
      wx.setStorageSync(key, value)
    } catch (err) {
      console.error('本地存储信息失败' + err)
    }
  },
  getItem: (key) => {
    return new Promise((resolve, reject) => {
      try {
        let value = wx.getStorageSync(key)
        resolve(value)
      } catch (err) {
        console.error('本地存储信息失败' + err)
        reject()
      }
    })
  },
  removeItem: (key) => {
    try {
      wx.removeStorageSync(key)
    } catch (err) {
      console.error('本地存储信息失败' + err)
    }
  }
}

const navigateTo = url => {
  url && wx.navigateTo({ url })
}

App({
  wilddog,
  utils,
  config,
  storage,
  noop,
  navigateTo,
  onLaunch: function () {
    // 获取用户信息
    storage.getItem('userInfo').then(userInfo => {
      if (userInfo) {
        this.globalData.userInfo = userInfo
        this.runLoginCbs(userInfo)
      } else {
        this.login()
      }
    }).catch(() => {
      this.login()
    })

    // 野狗监听
    wilddog.initializeApp(config.wilddog)
    this.ref_problemChat = wilddog.sync().ref('/problemChat')
    // this.ref_problemList.on('value', function (snapshot) {
    //   console.warn(snapshot.val())
    // }, function (error) {
    //   console.error(error)
    // })
  },
  // post请求
  post: function (url = '', data = {}) {
    return new Promise((resolve, reject) => {
      data.sessionId = this.globalData.userInfo ? this.globalData.userInfo.sessionId : ''
      wx.request({
        url,
        data,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: ({ data }) => {
          if (data.resultCode === 200) {
            return resolve(data)
          }

          // session失效
          if (data.resultCode === 4002) {
            storage.removeItem('userInfo')
            this.login() // 重新登录
            return reject(data)
          }
          
          // 其他错误码处理
          switch (data.resultCode) {
            case 4008:
            case 4004:
            case 4005:
              break
          }

          wx.hideLoading()
          wx.showModal({
            showCancel: false,
            content: data.message || '接口请求出错',
            success: res => {
              reject(data)
            }
          })
        },
        fail: err => {
          wx.showModal({
            showCancel: false,
            content: err.errMsg || '接口请求出错'
          })
          reject(err)
        }
      })
    })
  },
  // 登录，获取用户信息
  login: function () {
    return new Promise((resolve, reject) => {
      const that = this
      wx.showLoading()
      wx.login({
        success: loginRes => { // 获取授权code，可以到后台换取 openId, sessionKey, unionId
          wx.getUserInfo({ // 小程序授权获取用户信息（头像，昵称等）
            withCredentials: true,
            success: userInfoRes => { // 可以将 userInfoRes 发送给后台解码出 unionId
              userInfoRes.code = loginRes.code
              that.post(config.login, userInfoRes).then((apiRes) => {
                resolve(apiRes)

                if (apiRes.data) {
                  wx.hideLoading()
                  apiRes.data.avatarThumb = utils.formatHead(apiRes.data.avatarUrl)
                  that.globalData.userInfo = apiRes.data
                  storage.setItem('userInfo', apiRes.data)

                  // 由于获取用户信息是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处触发回调函数
                  that.runLoginCbs.call(that, apiRes.data)
                }
              }).catch(err => {
                wx.hideLoading()
                reject(err)
              })
            },
            fail: err => {
              wx.hideLoading()
              reject(err)
            }
          })
        },
        fail: err => {
          wx.hideLoading()
          reject(err)
        }
      })
    })
  },
  // 刷新个人信息
  refreshUserInfo: function () {
    let promise = this.post(config.userInfo)
    
    wx.showNavigationBarLoading()
    promise.then(({ data }) => {
      data.avatarThumb = utils.formatHead(data.avatarUrl)
      this.globalData.userInfo = data
      storage.setItem('userInfo', data)
    }).finally(() => {
      wx.hideNavigationBarLoading()
    })

    return promise
  },
  // 授权微信各种权限
  getAuthFunc: function (funcName = 'getUserInfo') {
    // wx.openSetting({
    //   success: (res) => {
    //     console.info(res.authSetting)
    //   }
    // })

    // wx.getSetting({
    //   success: (res) => {
    //     console.info(res.authSetting)
    //   }
    // })
  },
  // app初始化
  runLoginCbs: function (userInfo) {
    this.globalData.loginCbs.forEach(cb => {
      cb.call(this, userInfo)
    })
  },
  onLogin: function (callback) {
    if (typeof callback === 'function') {
      this.globalData.loginCbs.push(callback)
      if (this.globalData.userInfo) {
        callback.call(this, this.globalData.userInfo)
      }
    }
  },
  globalData: {
    userInfo: null,
    loginCbs: []
  }
})