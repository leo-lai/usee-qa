// ask-info/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollIntoView: 'scroll-bottom',
    score: ['有待提高', '一般', '满意'],
    isNeedPay: '',
    problemInfo: {},
    evaluate: {},
    doctor: {},
    chat: {
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
  // 滚动到底部
  scrollToBottom: function () {
    clearTimeout(this.scrollTimeId)
    this.scrollTimeId = setTimeout(() => {
      this.setData({
        scrollIntoView: 'scroll-bottom'
      })
    }, 200)
  },
  // 问题详情
  getProblemInfo: function (problemId = '') {
    const that = this

    wx.showLoading({ mask: true })
    app.post(app.config.problemInfo, { 
      problemId 
    }).then(({ data }) => {
      wx.hideLoading()
      
      data.problemInfo.createDateStr = app.utils.formatTime2chs(data.problemInfo.createDate, true)
      data.evaluate.evaluateDateStr = app.utils.formatTime2chs(data.evaluate.evaluateDate, true)
      data.doctor.avatarThumb = data.doctor.headPortrait ? app.utils.formatHead(data.doctor.headPortrait) : app.config.doctorAvatar

      that.setData({
        'isNeedPay': data.isNeedPay,
        'problemInfo': data.problemInfo,
        'evaluate': data.evaluate,
        'doctor': data.doctor
      })

      that.scrollToBottom()
    })
  },
  // 支付
  payOrder: function (formData = {}) {
    const that = this
    wx.showLoading({ mask: true })
    app.post(app.config.payConfig, formData).then(({ data }) => {
      wx.hideLoading()
      wx.requestPayment({
        timeStamp: data.payInfo.timeStamp,
        nonceStr: data.payInfo.nonceStr,
        package: data.payInfo.package,
        signType: data.payInfo.signType,
        paySign: data.payInfo.paySign,
        success: res => {
          wx.showToast({
            mask: true,
            title: '支付成功',
            icon: 'success'
          })

          that.setData({
            'isNeedPay': true
          })
          that.getChatList(1)
        },
        fail: res => {
          if (res.errMsg !== 'requestPayment:fail cancel') {
            wx.showModal({
              title: '支付失败',
              content: res.errMsg,
              showCancel: false
            })
          }
        }
      })
    })
  },
  // 偷偷查看答案
  seeAnswer: function () {
    const that = this
    wx.showLoading({ mask: true })
    app.post(app.config.createOrder, {
      problemId: that.data.problemInfo.problemId,
      amount: 1
    }).then(({ data }) => {
      that.payOrder(data)
    })
  },
  // 获取聊天记录
  getChatList: function (page = 1, callback = app.noop) {
    if (!this.data.chat.more || this.data.chat.loading) {
      callback(this.data.chat.data)
      return
    }
    this.setData({
      'chat.loading': true
    })
    app.post(app.config.messageList, {
      page,
      problemId: this.data.problemInfo.problemId,
      sort: 'asc'
    }).then(({ data }) => {
      data.list = data.list.map((item, index) => {
        if (item.msgType === 2) {
          item.imageSrc = item.msgContent
          item.msgContent = app.utils.formatThumb(item.msgContent, 100)
        }

        // 两条信息时间相差半小时则显示时间
        if (index === 0) {
          item.showDate = true
        } else if (data.list[index - 1]) {
          if (item.tick - data.list[index - 1].tick >= 1000 * 60 * 10) {
            item.showDate = true
          }
        }
        item.msgDateStr = app.utils.formatTime2chs(item.msgDatetime, true)

        return item
      })
      this.setData({
        'chat.more': data.list.length >= data.rows,
        'chat.page': data.page,
        'chat.data': data.page === 1 ? data.list : this.data.chat.data.concat(data.list)
      })
    }).finally(() => {
      this.setData({
        'chat.loading': false
      })
      callback(this.data.chat.data)
    })
  },
  // 滚动到底部获取更多聊天记录
  bindReachBottom: function () {
    if (this.data.problemInfo.problemId) {
      this.getChatList(this.data.chat.data.length > 0 ? this.data.chat.page + 1 : 1)
    }
  }
})