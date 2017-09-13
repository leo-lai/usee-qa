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
    }, 50)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.scrollHeightFix()

    app.onReady(userInfo => {
      this.setData({
        userInfo: userInfo
      })

      // 获取问题详情
      this.getProblemInfo(options.pbid)
    })
  },
  // 用户发送消息
  sendChat: function () {
    const that = this

    // 禁止发送空内容
    if (!that.data.send.content || that.data.send.content.trim().length === 0) {
      return
    }
    
    // 发送内容
    let problemId = that.data.problemInfo.problemId
    let sendContent = {
      problemId,
      fromUserRoles: that.data.userInfo.isDoctor,
      fromUserId: that.data.userInfo.userId,
      fromUserName: that.data.userInfo.userName,
      fromUserAvatar: that.data.userInfo.avatarUrl,
      msgType: 1,
      msgState: 0,
      msgDatetime: (new Date()).format('yyyy-MM-dd hh:mm:ss'),
      msgContent: that.data.send.content,
      tick: Date.now()
    }

    // 用户发给医生
    if (that.data.userInfo.isDoctor === 0) {
      sendContent.toUserId = that.data.doctor.doctorId
      sendContent.toUserName = that.data.doctor.doctorName
      sendContent.toUserAvatar = that.data.doctor.avatarThumb
    } else if (that.data.userInfo.isDoctor === 1) {
      sendContent.toUserId = that.data.problemInfo.interrogationId
      sendContent.toUserName = ''
      sendContent.toUserAvatar = ''
    }
    
    that.setData({
      'send.content': '',
      'chat.data': that.data.chat.data.concat(sendContent)
    })
    that.scrollToBottom()

    // 提交给后台
    let formData = Object.assign({}, sendContent, { msgState: 2 })
    app.post(app.config.sendMessage, formData).then(({data}) => {
      sendContent.msgChatId = data.messageChatId
      sendContent.msgDatetime = data.msgDatetime
      sendContent.msgState = 1

      // 推送到野狗
      app.ref_problemChat.child(problemId).set(sendContent)
    }).catch(() => {
      sendContent.msgState = -1
    }).finally(() => {
      that.chatSyncView(sendContent, 'tick')
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
  // 隐藏功能菜单
  bindHideChatMenu: function () {
    this.setData({
      'chat.hideMenu': !this.data.chat.hideMenu,
      'chat.inputFocus': !this.data.chat.hideMenu,
      'chat.disabled': this.data.chat.hideMenu,
    })
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

      data.doctor.avatarThumb = app.utils.formatHead(data.doctor.headPortrait)
      that.setData({
        'isNeedPay': data.isNeedPay,
        'problemInfo': data.problemInfo,
        'evaluate': data.evaluate,
        'doctor': data.doctor,
        'chat.data': data.chatList.reverse(),
        'chat.page': data.page,
        'chat.more': data.total > 1
      })

      that.scrollToBottom()

      // 改变页面标题
      if (data.problemInfo.problemState === 1) {
        let title = 'U视问答'
        title = `等待医生回复`
        if (!data.doctor.doctorId){
          title = `等待医生抢答`
        }
        wx.setNavigationBarTitle({
          title
        })
      } else if (data.problemInfo.problemState === 2)  {
        wx.setNavigationBarTitle({
          title: `与${data.doctor.doctorName}交谈中` 
        })
      }

      // 野狗监听节点problemChat/[problemId]
      let ref_key = 'ref_chat_' + data.problemInfo.problemId
      that[ref_key] = app.wilddog.sync().ref('/problemChat/' + data.problemInfo.problemId)
      that[ref_key].on('value', function (snapshot) {
        let value = snapshot.val()
        if (value) {
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
      }, function (error) {
        console.error(error)
      })

    }).finally(() => {
      wx.hideLoading()
    })
  }
})