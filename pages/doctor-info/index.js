// doctor-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    problemId: '',
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
  getDoctorInfo: function (doctorId = '') {
    wx.showLoading()
    app.post(app.config.doctorInfo, {
      doctorId
    }).then(({ data }) => {
      this.setData({
        doctorInfo: data
      })
    }).finally(() => {
      wx.hideLoading()
    })
  }
})