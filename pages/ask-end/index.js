// pages/ask-end/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topTips: '',
    todo: '',
    amount: '',
    doctorInfo: null,
    formData: {
      problemId: '',
      satisfactionDegree: 1, // 0一般 1满意 2不满意
      evaluate: ''
    }
  },
  // 顶部显示错误信息
  showTopTips: function (topTips = '') {
    this.setData({
      topTips
    })

    clearTimeout(this.toptipTimeid)
    this.toptipTimeid = setTimeout(() => {
      this.setData({
        topTips: ''
      })
    }, 3000)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      todo: options.todo,
      amount: options.amount || '',
      'formData.problemId': options.pbid || ''
    })
    if (options.todo === 'evaluate') {
      this.getDoctorInfo(options.dcid)
    }
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
  // 打分数
  markScore: function (e) {
    this.setData({
      'formData.satisfactionDegree': e.currentTarget.dataset.score || 1
    })
  },
  // 评价内容
  bindInput: function (e) {
    this.setData({
      'formData.evaluate': e.detail.value.trim()
    })
  },
  // 提交评价
  submitEvaluate: function () {
    if (this.data.formData.evaluate.length < 10) {
      this.showTopTips('请输入评价内容')
      return
    }
    
    wx.showLoading({
      mask: true,
      title: '提交中...'
    })
    app.post(app.config.evaluate, that.data.formData).then(({data}) => {
      wx.showToast({
        title: '评价成功',
        duration: 2000,
        success: res => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 2
            })
          }, 2000)
        }
      })
    })
  }
})