// pages/wallet/withdraw/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: true,
    formData: {
      amount: ''
    },
    userInfo: null
  },
  onShow: function () {
    app.refreshUserInfo().then(({ data }) => {
      this.setData({
        userInfo: data
      })
    })
  },
  bindInput: function (e) {
    e.detail.value = e.detail.value.replace(/[^0-9\.]/ig, '')

    if (e.detail.value.split('.').length >= 3) {
      e.detail.value = e.detail.value.substr(0, e.detail.value.length - 1)
    }

    this.setData({
      'formData.amount': e.detail.value,
      disabled: this.data.userInfo.amount === 0 || e.detail.value == '' || e.detail.value > this.data.userInfo.amount
    })
  },
  getAllAmount: function () {
    this.setData({
      disabled: this.data.userInfo.amount > 0 ? false : true,
      'formData.amount': this.data.userInfo.amount
    })
  },
  // 提现
  withdraw: function () {
    wx.showLoading()
    this.setData({
      disabled: true
    })
    app.post(app.config.withdrawal, {
      amount: parseFloat(this.data.formData.amount)
    }).then(() => {
      app.navigateTo('/pages/result/index?type=withdraw')
    }).finally(() => {
      wx.hideLoading()
      this.setData({
        disabled: false
      })
    })
  }
})