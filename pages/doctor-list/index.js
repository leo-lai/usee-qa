// doctor-list/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    doctor: {
      loading: false,
      more: true,
      page: 1,
      data: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onReady(userInfo => {
      this.getDoctorList(1)
    })
  },
  onReachBottom: function () { // 加载更多
    this.getDoctorList(this.data.doctor.page + 1)
  },
  onPullDownRefresh: function () { // 下拉刷新
    this.setData({
      'doctor.more': true
    })
    this.getDoctorList(1, () => {
      wx.stopPullDownRefresh()
    })
  },
  getDoctorList: function (page = 1, callback = function () { }) {
    if (!this.data.doctor.more || this.data.doctor.loading) {
      callback(this.data.doctor.data)
      return
    }

    this.setData({
      'doctor.loading': true
    })

    app.post(app.config.doctorList, {
      page
    }).then(({data}) => {
      this.setData({
        'doctor.more': data.problems.length >= data.rows,
        'doctor.page': data.page,
        'doctor.data': data.page === 1 ? data.problems : this.data.doctor.data.concat(data.problems)
      })
    }).finally(() => {
      this.setData({
        'doctor.loading': false
      })
      callback(this.data.doctor.data)
    })
  }
})