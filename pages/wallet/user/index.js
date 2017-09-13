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
  onShow: function () {
    app.refreshUserInfo().then(({data}) => {
      this.setData({
        userInfo: data
      })
    })
  },
  // 收益规则
  bindShowWallerRules: function() {
    this.setData({
      hideWalletRules: !this.data.hideWalletRules
    })
  }
})