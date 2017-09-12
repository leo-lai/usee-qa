// doctor-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    problemId: '',
    isAllowPay: false,
    orderInfo: {
      orderId: '',
      amount: 0
    },
    doctorInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      problemId: options.pbid || ''
    })
    this.getDoctorInfo(options.dcid)
  },
  // 获取医生信息
  getDoctorInfo: function (doctorId = '') {
    wx.showLoading()
    app.post(app.config.doctorInfo, {
      doctorId
    }).then(({ data }) => {
      data.labelArr = data.labelName.split(',')
      this.setData({
        doctorInfo: data
      })

      // 创建订单
      if (this.data.problemId !== '') {
        this.createOrder({
          problemId: this.data.problemId,
          amount: data.collectFees,
          doctorId
        })
      } else {
        wx.hideLoading()
      }
    }).catch(() => {
      wx.hideLoading()
    })
  },
  // 创建问题订单
  createOrder: function (formData = {}) {
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