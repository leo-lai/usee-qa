// pages/doctor-rob/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    score: ['有待提高', '一般', '满意'],
    isNeedPay: true,
    problemInfo: {},
    evaluate: {},
    doctor: {},
    chatList: {
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
    this.getProblemInfo(options.pbid)
  },
  // 问题详情
  getProblemInfo: function (problemId = '') {
    wx.showLoading({
      mask: true
    })

    app.post(app.config.problemInfo, {
      problemId
    }).then(({ data }) => {
      this.setData({
        'isNeedPay': data.isNeedPay,
        'problemInfo': data.problemInfo,
        'evaluate': data.evaluate,
        'doctor': data.doctor,
        'chatList.data': data.chatList,
        'chatList.page': data.page,
        'chatList.more': data.total > 1
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },
  // 抢答问题
  robProblem: function () {
    wx.showLoading({ 
      mask: true,
      title: '抢答中...'
    })

    let problemId = this.data.problemInfo.problemId
    app.post(app.config.problemRob, { 
      problemId 
    }).then(({data}) => {
      wx.showToast({
        title: '抢答成功',
        duration: 2000,
        success: res => {
          setTimeout(() => {
            app.navigateTo('/pages/ask-chat/index?pbid=' + problemId)
          }, 2000)
        }
      })
    }).catch(() => {
      wx.navigateBack({
        delta: 1
      })
    })
  }
})