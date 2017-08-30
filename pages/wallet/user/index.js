// index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideWalletRules: true
  },
  bindShowWallerRules: function() {
    this.setData({
      hideWalletRules: !this.data.hideWalletRules
    })
  }
})