// pages/me-info/doctor/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    disabled: true,
    topTips: '',
    doctorLabels: [],
    formData: {},
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.setData({ userInfo })
    })
  },
  onShow: function () {
    app.refreshUserInfo().then(({ data }) => {
      this.setData({
        userInfo: data,
        'formData.doctorId': data.doctorId,
        'formData.doctorName': data.doctorName,
        'formData.headPortrait': data.avatarUrl,
        'formData.hospital': data.hospital,
        'formData.academicTitle': data.academicTitle,

        'formData.introduce': data.introduce,
        'formData.collectFees': data.collectFees,
        'formData.labelIds': data.labelIds,
        'formData.labelName': data.labelName
      })
      this.getDoctorLabels()
    })
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
  // 表单输入
  bindInput: function (e) {
    let data = {
      disabled: false
    }
    data['formData.' + e.target.id] = e.detail.value
    this.setData(data)
  },
  // 获取医生擅长标签
  getDoctorLabels: function () {
    wx.showLoading()
    app.post(app.config.doctorLabels).then(({ data }) => {
      wx.hideLoading()
      
      let labelIds = []
      let doctorLabels = this.data.userInfo.labelName.split(',')
      
      data = data.map(item => {
        item.slted = doctorLabels.includes(item.labelName)
        if (item.slted) {
          labelIds.push(item.labelId)
        }
        return item
      })
      this.setData({
        doctorLabels: data,
        'formData.labelIds': labelIds.join(',')
      })
    })
  },
  // 选择标签
  sltDoctorLabel: function (e) {
    let index = e.target.dataset.index
    if (index !== '') {
      this.data.doctorLabels[index].slted = !this.data.doctorLabels[index].slted
      let labelIds = [], labelName = []
      this.data.doctorLabels.forEach((item) => {
        if (item.slted) {
          labelIds.push(item.labelId)
          labelName.push(item.labelName)
        }
      })

      this.setData({
        disabled: false,
        doctorLabels: this.data.doctorLabels,
        'formData.labelIds': labelIds.join(','),
        'formData.labelName': labelName.join(',')
      })
    }
  },
  submitSave: function () {
    if (!this.data.formData.labelIds) {
      this.showTopTips('请选择最擅长领域')
      return
    }
    if (!this.data.formData.introduce) {
      this.showTopTips('请输入自我介绍')
      return
    }
    if (this.data.formData.collectFees === '') {
      this.showTopTips('请输入咨询费')
      return
    }

    wx.showLoading({
      mask: true
    })
    app.post(app.config.doctorInfoUpdate, this.data.formData).then(() => {
      wx.showToast({
        title: '提交成功',
        duration: 2000,
        success: res => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
      })
    })
  }
})