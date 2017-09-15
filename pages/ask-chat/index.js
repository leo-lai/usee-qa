// pages/ask-chat/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollIntoView: 'scroll-bottom',
    scrollHeight: 999,
    score: ['有待提高', '一般', '满意'],
    isNeedPay: true,
    problemInfo: {},
    evaluate: {},
    doctor: {},
    send: {
      answerType: '',
      content: ''
    },
    chat: {
      loading: false,
      more: true,
      page: 1,
      rows: 20,
      data: [],
      hideMenu: true,
      disabled: false,
      inputFocus: false
    },
    userInfo: null
  },
  // 聊天记录数据同步视图
  chatSyncView: function (objectItem = {}, key = 'tick') {
    if (!objectItem[key]) return

    for (let i = this.data.chat.data.length - 1; i >= 0; i--) {
      if (this.data.chat.data[i][key] === objectItem[key]) {
        this.data.chat.data[i] = objectItem
        this.setData({
          'chat.data': this.data.chat.data
        })
        break
      }
    }
  },
  // 滚动区域高度修正
  scrollHeightFix: function () {
    wx.createSelectorQuery()
      .select('#chat-scroll').boundingClientRect()
      .select('#chat-bar').boundingClientRect()
      .exec((res) => {
        this.setData({
          scrollHeight: res[0].height
        })
      })
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.scrollHeightFix()

    app.onLogin(userInfo => {
      this.setData({
        userInfo: userInfo
      })

      // 获取问题详情
      this.getProblemInfo(options.pbid)
    })
  },
  // 获取发送消息体
  getSendContent: function (content = '', msgType = 1) {
    // 发送内容
    let sendContent = {
      problemId: this.data.problemInfo.problemId,
      problemState: this.data.problemInfo.problemState,
      fromUserRoles: this.data.userInfo.isDoctor,
      fromUserId: this.data.userInfo.userId,
      fromUserName: this.data.userInfo.userName,
      fromUserAvatar: this.data.userInfo.avatarUrl,
      msgType,
      msgState: 0,
      msgDatetime: (new Date()).format('yyyy-MM-dd hh:mm:ss'),
      msgContent: content.trim(),
      tick: Date.now()
    }

    // 用户发给医生
    if (this.data.userInfo.isDoctor === 0) {
      sendContent.toUserId = this.data.doctor.doctorId
      sendContent.toUserName = this.data.doctor.doctorName
      sendContent.toUserAvatar = this.data.doctor.avatarThumb
    } else if (this.data.userInfo.isDoctor === 1) {
      sendContent.toUserId = this.data.problemInfo.interrogationId
      sendContent.toUserName = ''
      sendContent.toUserAvatar = ''
    }

    return sendContent
  },
  // 保存消息记录到服务器
  saveSendContent: function (formData = {}, sendContent = {}) {
    app.post(app.config.sendMessage, formData).then(({ data }) => {
      sendContent.msgChatId = data.messageChatId
      sendContent.msgDatetime = data.msgDatetime
      sendContent.msgState = 1

      // 推送到野狗
      app.ref_problemChat.child(sendContent.problemId).set(formData)
    }).catch((error) => {
      sendContent.msgState = -1
    }).finally(() => {
      this.chatSyncView(sendContent, 'tick')
    })
  },
  // 发送文本消息
  sendChat: function () {
    const that = this

    // 获取发送内容
    let sendContent = that.getSendContent(that.data.send.content, 1)
    // 禁止发送空内容
    if (sendContent.content === '') {
      return
    }

    that.setData({
      'send.content': '',
      'chat.data': that.data.chat.data.concat(sendContent)
    })
    that.scrollToBottom()

    // 提交给后台
    let formData = Object.assign({}, sendContent, { msgState: 2 })
    that.saveSendContent(formData, sendContent)
  },
  // 发送图片信息
  sendImage: function (e) {
    const that = this
    let sourceType = [e.currentTarget.dataset.type || 'album'] // camera
    wx.chooseImage({
      count: 9,
      sourceType, 
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        res.tempFiles.forEach(item => {
          let sendContent = that.getSendContent(item.path, 2)
          let formData = Object.assign({}, sendContent, { msgState: 2 })

          sendContent.imageSrc = item.path
          sendContent.progress = 0

          that.setData({
            'chat.data': that.data.chat.data.concat(sendContent)
          })
          that.hideChatMenu()
          that.scrollToBottom()

          // 上传图片到服务器
          item.uploadTask = wx.uploadFile({
            url: app.config.uploadImage,
            filePath: item.path,
            name: 'img_file',
            success: function (res) {
              formData.msgContent = res.data
              that.saveSendContent(formData, sendContent)
            },
            fail: function (res) {
              sendContent.msgState = -1
              that.chatSyncView(sendContent, 'tick')
            }
          })
          // 上传进度
          item.uploadTask.onProgressUpdate(res => {
            sendContent.progress = res.progress
          })
        })
      }
    })
  },
  // 预览图片
  previewImage: function (e) {
    let urls = []
    this.data.chat.data.reverse().forEach(item => {
      if (item.msgType === 2) {
        urls.push(item.imageSrc)
      }
    })

    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls
    })
  },
  // 监听聊天内容输入
  bindInputChange: function (e) {
    this.setData({
      'send.content': e.detail.value
    })
  },
  bindInputFocus: function () {
    this.setData({
      'chat.disabled': false,
      'chat.inputFocus': true,
      'chat.hideMenu': true
    })

    // setTimeout(() => {
    //   let systemInfo  = wx.getSystemInfoSync()
    //   this.setData({
    //     scrollHeight: systemInfo.windowHeight - 200
    //   })
    // }, 500)
  },
  bindInputBlur: function () {
    // setTimeout(this.scrollHeightFix, 500)
  },
  // 打开隐藏功能菜单
  toggleHideChatMenu: function () {
    this.setData({
      'chat.hideMenu': !this.data.chat.hideMenu,
      'chat.disabled': this.data.chat.hideMenu,
      'chat.inputFocus': !this.data.chat.hideMenu
    })
  },
  hideChatMenu: function () {
    if (!this.data.chat.hideMenu) {
      this.setData({
        'chat.hideMenu': true,
        'chat.disabled': false
      })
    }
  },
  // 获取问题详情
  getProblemInfo: function (problemId = '') {
    let that = this
    wx.showLoading({
      mask: true
    })
    app.post(app.config.problemInfo, {
      problemId,
      page: that.data.chat.page,
      rows: that.data.chat.rows,
    }).then(({ data }) => {
      // 修正一些数据
      let chatList = data.chatList.reverse().map(item => {
        if (item.msgType === 2) {
          item.imageSrc = item.msgContent
          item.msgContent = app.utils.formatThumb(item.msgContent, 100)
        }
        return item
      })
      data.doctor.avatarThumb = app.utils.formatHead(data.doctor.headPortrait)

      // 同步视图
      that.setData({
        'isNeedPay': data.isNeedPay,
        'problemInfo': data.problemInfo,
        'evaluate': data.evaluate,
        'doctor': data.doctor,
        'chat.data': chatList,
        'chat.page': data.page,
        'chat.more': data.total > 1
      })
      that.scrollToBottom()

      // 改变页面标题
      let title = ''
      switch (data.problemInfo.problemState) {
        case 1:
          title = '等待医生抢答' 
          break
        case 2:
          title = '等待医生回复'
          break
        case 3:
          title = '交谈中'
          break
        default:
          title = 'U视问答'
      }
      wx.setNavigationBarTitle({ title })

      // 野狗监听节点problemChat/[problemId]
      app.ref_problemChat.child(problemId).on('value', snapshot => {
        let value = snapshot.val()
        if (value) {
          if (value.problemState == 4) { // 咨询已结束
            if (that.data.userInfo.isDoctor === 0) {
              that.setData({
                'problemInfo.problemState': value.problemState
              })
              setTimeout(() => {
                app.navigateTo(`/pages/ask-end/index?todo=evaluate&&dcid=${that.data.doctor.doctorId}&pbid=${problemId}`)
              }, 500)
            }
            return
          }
          
          if (value.fromUserId !== that.data.userInfo.userId) {
            if (that.data.chat.data.length === 0 || 
              that.data.chat.data[that.data.chat.data.length-1].tick !== value.tick) {
              that.setData({
                'chat.data': that.data.chat.data.concat(value)
              })
              that.scrollToBottom()
            }
          }
        }
      })

    }).finally(() => {
      wx.hideLoading()
    })
  },
  // 结束交谈
  endProblem: function () {
    const that = this
    wx.showModal({
      title: '结束咨询',
      content: '请确认是否解决了患者问题，点击取消可返回继续交谈',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            mask: true,
            title: '正在结束中'
          })
          app.post(app.config.endProblem, {
            problemId: that.data.problemInfo.problemId
          }).then(({data}) => {
            that.hideChatMenu()
            // 结束问题
            let sendContent = that.getSendContent('咨询已结束', 0)
            sendContent.problemState = 4
            app.ref_problemChat.child(that.data.problemInfo.problemId).set(sendContent, err => {
              wx.hideLoading()
              app.navigateTo('/pages/ask-end/index?todo=end&&amount=' + that.data.problemInfo.amount)
            })
          })
        } else if (res.cancel) {
          that.hideChatMenu()
        }
      }
    })
  }
})