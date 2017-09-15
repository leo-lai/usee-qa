// doctor-apply/index.js
const app = getApp()
Page({
  data: {
    topTips: '',
    sendCodeTime: -1,
    doctorLabels: [],
    formData: {
      doctorName: '',
      academicTitle: '',
      phoneNumber: '',
      hospital: '',
      introduce: '',
      physicianLicense: '',
      collectFees: '',
      labelIds: '',
      labelName: '',
      phoneCode: ''
    },
    files: [],
    tempFilePaths: []
  },
  onLoad: function () {
    app.onLogin(userInfo => {
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
  // 选择图片
  chooseImage: function (e) {
    const that = this
    wx.chooseImage({
      count: 6 - that.data.files.length,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        let files = res.tempFiles.map((item, index) => {
          item.progress = 0
          item.status = -1

          // 上传图片到服务器
          item.uploadTask = wx.uploadFile({
            url: app.config.uploadImage,
            filePath: item.path,
            name: 'img_file',
            success: function (res) {
              console.log('uploadFile:', res)
              that.data.files.forEach(fileItem => {
                if (fileItem.path === item.path) {
                  fileItem.onlinePath = res.data
                  fileItem.status = 1
                }
              })
              that.setData({
                files: that.data.files
              })
            },
            fail: function (res) {
              console.log('uploadFile:', res)
              that.data.files.forEach(fileItem => {
                if (fileItem.path === item.path) {
                  fileItem.status = 0
                }
              })
              that.setData({
                files: that.data.files
              })
            }
          })
          
          // 上传进度
          item.uploadTask.onProgressUpdate(res => {
            that.data.files.forEach(fileItem => {
              if (fileItem.path === item.path) {
                fileItem.progress = res.progress
              }
            })
            that.setData({
              files: that.data.files
            })
          })
          return item
        })

        that.setData({
          tempFilePaths: that.data.tempFilePaths.concat(res.tempFilePaths),
          files: that.data.files.concat(files)
        })
      }
    })
  },
  // 预览图片
  previewImage: function (e) {
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: this.data.tempFilePaths // 需要预览的图片http链接列表
    })
  },
  // 删除图片
  deleteImage: function () {

  },
  // 表单输入
  bindInput: function (e) {
    let formData = {}
    formData['formData.' + e.target.id] = e.detail.value
    this.setData(formData)
  },
  // 获取手机验证码
  getPhoneCode: function () {
    if (this.data.sendCodeTime > -1) {
      return
    }

    if (!/^1\d{10}/g.test(this.data.formData.phoneNumber)) {
      this.showTopTips('请输入正确的手机号码')
      return
    }

    let sendCodeTime = 60
    this.setData({
      sendCodeTime: sendCodeTime
    })
    clearInterval(this.sendCodeTimeId)
    this.sendCodeTimeId = setInterval(() => {
      if (sendCodeTime > -1) {
        this.setData({
          sendCodeTime: --sendCodeTime
        })
      } else {
        clearInterval(this.sendCodeTimeId)
      }
    }, 1000)
    
    app.post(app.config.phoneCode, {
      phoneNumber: this.data.formData.phoneNumber
    })
  },
  // 获取医生擅长标签
  getDoctorLabels: function () {
    wx.showLoading()
    app.post(app.config.doctorLabels).then(({data}) => {
      this.setData({
        doctorLabels: data
      })
    }).finally(() => {
      wx.hideLoading()
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
        doctorLabels: this.data.doctorLabels,
        'formData.labelIds': labelIds.join(','),
        'formData.labelName': labelName.join(',')
      })
    }
  },
  submitApply: function () {
    if (!this.data.formData.doctorName) {
      this.showTopTips('请输入真实姓名')
      return
    }
    if (!this.data.formData.phoneNumber) {
      this.showTopTips('请输入手机号码')
      return
    }
    if (!this.data.formData.phoneCode) {
      this.showTopTips('请输入手机验证码')
      return
    }
    if (!this.data.formData.hospital) {
      this.showTopTips('请输入所在医院')
      return
    }
    if (!this.data.formData.academicTitle) {
      this.showTopTips('请输入职务')
      return
    }
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

    let physicianLicense = []
    let allUpload = true
    this.data.files.forEach(item => {
      if (item.status === 1) {
        physicianLicense.push(item.onlinePath)
      } else {
        allUpload = false
        return false
      }
    })
    if (!allUpload) {
      this.showTopTips('请等待图片上传完毕')
      return
    }
    if (physicianLicense.length === 0) {
      this.showTopTips('请上传身份凭证')
      return
    }
    this.data.formData.physicianLicense = physicianLicense.join(',')

    wx.showLoading({
      mask: true
    })
    app.post(app.config.doctorApply, this.data.formData).then(() => {
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
});