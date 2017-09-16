// ask-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    score: ['有待提高', '一般', '满意'],
    isNeedPay: null,
    problemInfo: null,
    evaluate: null,
    doctor: null,
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
  getProblemInfo: function (problemId = '') {
    wx.showLoading({
      mask: true
    })

    app.post(app.config.problemInfo, { 
      problemId 
    }).then(({ data }) => {
      data.doctor.avatarThumb = data.doctor.headPortrait ? app.utils.formatHead(data.doctor.headPortrait) : app.config.doctorAvatar

      data.problemInfo.createDateStr = app.utils.formatTime2chs(data.problemInfo.createDate, true)
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
  }
})