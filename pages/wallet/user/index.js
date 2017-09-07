// wallet/user/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideWalletRules: true,
    userInfo: null
  },
  onLoad: function () {
    app.onReady(userInfo => {
      this.setData({
        userInfo: userInfo
      })
    })
  },
  bindShowWallerRules: function() {
    this.setData({
      hideWalletRules: !this.data.hideWalletRules
    })
  }
})