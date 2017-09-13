//app.js
import config from 'config'
import utils from '/script/utils'
import wilddog from '/script/wilddog-weapp-all'

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

let _ReadyCbs = []
App({
  wilddog,
  utils,
  config,
  storage,
  onLaunch: function () {
    // 获取用户信息
    // storage.getItem('userInfo').then((value) => {
    //   if (!value) {
    //     this.login()
    //   } else {
    //     this.globalData.userInfo = value
    //     this.runReady(value)
    //   }
    // }).catch(() => {
    //   this.login()
    // })

    this.login()

    // 野狗监听
    wilddog.initializeApp(config.wilddog)
    this.ref_problemChat = wilddog.sync().ref('/problemChat')
    // this.ref_problemList.on('value', function (snapshot) {
    //   console.warn(snapshot.val())
    // }, function (error) {
    //   console.error(error)
    // })
  },
  // 页面跳转
  navigateTo: function (url = '') {
    wx.navigateTo({
      url
    })
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
            resolve(data)
            return
          }

          // session失效
          if (data.resultCode === 4002) {
            storage.removeItem('userInfo')
            let loginPromise = this.login()
            if (url.lastIndexOf('/login') === 0) {
              resolve(loginPromise)
            } else {
              wx.showModal({
                showCancel: false,
                content: '登录信息失效，请重新进入小程序'
              })
              reject(data)
            }
            return
          }
          
          // 其他错误码处理
          // switch (data.resultCode) {
          //   case 4008:
          //   case 4004:
          //   case 4005:
          //     break
          // }

          wx.showModal({
            showCancel: false,
            content: data.message
          })
          reject(data)
        },
        fail: (err) => {
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
    // 登录, 获取用户信息
    return new Promise((resolve, reject) => {
      wx.showLoading()
      wx.login({
        success: loginRes => { // 获取授权code，可以到后台换取 openId, sessionKey, unionId
          wx.getUserInfo({ // 小程序授权获取用户信息（头像，昵称等）
            withCredentials: true,
            success: userInfoRes => { // 可以将 userInfoRes 发送给后台解码出 unionId
              userInfoRes.code = loginRes.code
              this.post(config.login, userInfoRes).then((apiRes) => {
                resolve(apiRes)

                if (apiRes.data) {
                  wx.hideLoading()
                  apiRes.data.avatarThumb = utils.formatHead(apiRes.data.avatarUrl)
                  this.globalData.userInfo = apiRes.data
                  storage.setItem('userInfo', apiRes.data)

                  // 由于获取用户信息是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处触发回调函数
                  this.runReady.call(this, apiRes.data)
                }
              }).catch(err => {
                wx.hideLoading()
                reject(err)
              })
            },
            fail: (err) => {
              wx.hideLoading()
              reject(err)
            }
          })
        },
        fail: (err) => {
          wx.hideLoading()
          console.error(err.errMsg)
          reject(err)
        }
      })
    })
    
  },
  // 刷新个人信息
  refreshUserInfo: function () {
    wx.showLoading()
    let promise = this.post(config.userInfo)
    
    promise.then(({ data }) => {
      this.globalData.userInfo = data
      storage.setItem('userInfo', data)
    }).finally(() => {
      wx.hideLoading()
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
  runReady: function (userInfo) {
    _ReadyCbs.forEach((cb) => {
      cb.call(this, userInfo)
    })
  },
  onReady: function (callback) {
    if (typeof callback === 'function') {
      if (this.globalData.userInfo) {
        callback.call(this, this.globalData.userInfo)
      } else {
        _ReadyCbs.push(callback)
      }
    }
  },
  globalData: {
    userInfo: null
  }
})