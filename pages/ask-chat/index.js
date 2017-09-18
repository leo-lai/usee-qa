// pages/ask-chat/index.js
const app = getApp()
// 处理一下聊天记录
const reverseChatList = (list = []) => {
  let chatList = list.reverse().map((item, index) => {
    if (item.msgType === 2) {
      item.imageSrc = item.msgContent
      item.msgContent = app.utils.formatThumb(item.msgContent, 100)
    }

    // 两条信息时间相差半小时则显示时间
    if (index === 0) {
      item.showDate = true
    } else if (list[index - 1]) {
      if (item.tick - list[index - 1].tick >= 1000 * 60 * 10) {
        item.showDate = true
      }
    }
    item.msgDateStr = app.utils.formatTime2chs(item.msgDatetime, true)

    return item
  })
  return chatList
}
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
    userInfo: {}
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
  // 下拉获取更多聊天记录
  bindPullDownRefresh: function () {
    if (this.data.problemInfo.problemId) {
      this.getChatList(this.data.chat.page + 1)
    }
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
      rows: 20,
      page,
      problemId: this.data.problemInfo.problemId,
      sort: 'asc'
    }).then(({ data }) => {
      data.list = reverseChatList(data.list)
      this.setData({
        'chat.more': data.list.length >= data.rows,
        'chat.page': data.page,
        'chat.data': data.page === 1 ? data.list : [...data.list, ...this.data.chat.data]
      })
    }).finally(() => {
      this.setData({
        'chat.loading': false
      })
      callback(this.data.chat.data)
    })
  },
  // 获取发送消息体
  getSendContent: function (content = '', msgType = 1) {
    // 发送内容
    let sendDate = new Date()
    let sendContent = {
      problemId: this.data.problemInfo.problemId,
      problemState: this.data.problemInfo.problemState,
      fromUserRoles: this.data.userInfo.isDoctor,
      fromUserId: this.data.userInfo.userId,
      fromUserName: this.data.userInfo.userName,
      fromUserAvatar: this.data.userInfo.avatarUrl,
      msgType,
      msgState: 0,
      msgDatetime: sendDate.format('yyyy-MM-dd HH:mm:ss'),
      msgContent: content.trim(),
      tick: sendDate.getTime(),
      showDate: false
    }
    // 两条信息时间相差半小时则显示时间
    if (this.data.chat.data.length > 0) {
      let time1 = this.data.chat.data[this.data.chat.data.length - 1].tick
      let time2 = sendContent.tick
      if (time2 - time1 >= 1000 * 60 * 10) {
        sendContent.showDate = true
      }
    } else {
      sendContent.showDate = true
    }
    sendContent.msgDateStr = sendDate.format('HH:mm')

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
  // 重新发送
  sendAgain: function () {

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
    wx.showLoading()
    app.post(app.config.problemInfo, {
      problemId,
      page: that.data.chat.page,
      rows: that.data.chat.rows,
    }).then(({ data }) => {
      wx.hideLoading()
      // 修正一些数据
      data.chatList = reverseChatList(data.chatList)
      data.problemInfo.createDateStr = app.utils.formatTime2chs(data.problemInfo.createDate, true)
      data.doctor.avatarThumb = data.doctor.headPortrait ? app.utils.formatHead(data.doctor.headPortrait) : app.config.doctorAvatar
      
      // 同步视图
      that.setData({
        'isNeedPay': data.isNeedPay,
        'problemInfo': data.problemInfo,
        'evaluate': data.evaluate,
        'doctor': data.doctor,
        'chat.data': data.chatList,
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
        case 4:
          title = '咨询已结束'
          break
        default:
          title = 'U视问答'
      }
      wx.setNavigationBarTitle({ title })

      // 等待抢答不监听回复
      if (data.problemInfo.problemState === 1) {
        return
      }

      // 野狗监听节点problemChat/[problemId]
      app.ref_problemChat.child(problemId).on('value', snapshot => {
        let value = snapshot.val()
        if (value) {
          if (value.fromUserId !== that.data.userInfo.userId) {
            if (that.data.chat.data.length === 0 ||
              that.data.chat.data[that.data.chat.data.length - 1].tick !== value.tick) {
              that.setData({
                'chat.data': that.data.chat.data.concat(value)
              })
              that.scrollToBottom()
            }
          }

          // 如果咨询已结束并未评价
          if (value.problemState == 4 && that.data.problemInfo.isEvaluate === 0) { 
            if (that.data.userInfo.isDoctor === 0) {
              that.setData({
                'problemInfo.problemState': value.problemState
              })
              setTimeout(() => {
                app.navigateTo(`/pages/ask-end/index?todo=evaluate&&dcid=${that.data.doctor.doctorId}&pbid=${problemId}`)
              }, 500)
            }
          }
        }
      })

    })
  },
  // 结束交谈
  endProblem: function () {
    const that = this
    wx.showModal({
      title: '结束咨询',
      content: '请确认是否解决了患者的问题，随意结束问题将会影响您的评价与信用',
      cancelText: '继续交谈',
      confirmText: '结束服务',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在结束中'
          })
          app.post(app.config.endProblem, {
            problemId: that.data.problemInfo.problemId
          }).then(({data}) => {
            that.hideChatMenu()
            // 结束问题
            let sendContent = that.getSendContent('咨询已结束')
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