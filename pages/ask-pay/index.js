// ask-pay/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAllowPay: false,
    problemId: '',
    orderInfo: {
      orderId: '',
      amount: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.problemId = options.pbid
    this.createOrder({
      problemId: options.pbid,
      doctorId: '',
      amount: 5
    })
  },
  // 创建问题订单
  createOrder: function (formData = {}) {
    wx.showLoading({
      mask: true
    })
    app.post(app.config.createOrder, formData).then(({ data }) => {
      this.setData({
        isAllowPay: true, 
        'orderInfo.orderId': data.orderId,
        'orderInfo.amount': data.amount
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  // 支付
  payOrder: function () {
    const that = this
    wx.showLoading({ mask: true })
    app.post(app.config.payConfig, this.data.orderInfo).then(({ data }) => {
      wx.requestPayment({
        timeStamp: data.payInfo.timeStamp,
        nonceStr: data.payInfo.nonceStr,
        package: data.payInfo.package,
        signType: data.payInfo.signType,
        paySign: data.payInfo.paySign,
        success: function (res) {
          wx.showToast({
            mask: true,
            title: '支付成功',
            icon: 'success',
            success: function () {
              app.navigateTo('/pages/ask-chat/index?pbid=' + that.data.problemId)
            }
          })
        },
        fail: function (res) {
          if (res.errMsg !== 'requestPayment:fail cancel') {
            wx.showModal({
              title: '支付失败',
              content: res.errMsg,
              showCancel: false
            })
          }
        }
      })
    }).finally(() => {
      wx.hideLoading()
    })
  }
})