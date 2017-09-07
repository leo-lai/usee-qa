// ask-pay/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAllowPay: false,
    orderInfo: {
      orderId: '',
      amount: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    wx.showLoading({ mask: true })
    app.post(app.config.payConfig, this.data.orderInfo).then(({ data }) => {
      wx.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: 'MD5',
        paySign: data.paySign,
        success: function (res) {
          console.log('pay success', res)
        },
        fail: function (res) {
          console.log('pay fail', res)
        }
      })
    }).finally(() => {
      wx.hideLoading()
    })
  }
})