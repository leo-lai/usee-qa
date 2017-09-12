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
    chat: {
      loading: false,
      more: true,
      page: 1,
      data: [],
      hideMenu: true,
      disabled: false,
      inputFocus: false
    },
    userInfo: null
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

    this.problemId = options.pbid
    app.onReady(userInfo => {
      this.setData({
        userInfo: userInfo
      })

      if (userInfo.isDoctor === 0) { // 用户
        this.getProblemInfo(options.pbid)
      } else if (userInfo.isDoctor === 1) { // 医生
        
      }
    })
  },
  // 用户发送消息
  sendChat: function () {
    if (this.data.send.content.trim().length === 0) {
      return
    }

    let sendContent = {
      fromUserId: this.data.userInfo.userId,
      fromUserName: this.data.userInfo.userName,
      fromUserAvatar: this.data.userInfo.avatarUrl,
      toUserId: 'u00001',
      toUserName: '系统消息',
      toUserAvatar: '',
      msgType: 1,
      msgState: 1,
      msgDatetime: (new Date()).format('yyyy-MM-dd hh:mm:ss'),
      msgContent: this.data.send.content
    }

    this.setData({
      'send.content': '',
      'chat.data': [].concat(this.data.chat.data, sendContent)
    })

    this.scrollToBottom()

    this.listenChat(sendContent.msgContent)
  },
  // 监听回复消息
  listenChat: function (msgContent = '') {
    clearTimeout(systemSendTimeId)
    switch (this.data.send.answerType) {
      case 1:
        if (msgContent > 0) {
          formData.age = msgContent
          this.systemSend('请尽量详细描述患者的【主要症状】，【持续时间】，是否医院确诊及【检查结果】等，这样更容易获得医生的专业解答并节省交流时间', 2)
        } else {
          this.systemSend('请输入真实的【年龄】，回复数字即可', 1)
        }
        break
      case 2:
        if (msgContent.trim() == 1) {
          if (problemRemarks.length === 0) {
            this.systemSend('请详细描述病症，回复数字【1】确认完成描述', 2)
          } else {
            systemSendTimes = 0
            formData.problemRemarks = problemRemarks.join(',')
            this.submitProblem()
          }
        } else {
          problemRemarks.push(msgContent)
          systemSendTimeId = setTimeout(() => {
            this.systemSend('还有其他要补充说明吗？回复数字【1】确认完成描述', 2)
          }, ++systemSendTimes * 500 + 5000)
        }
        break
    }
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
        'chat.data': data.chat,
        'chat.page': data.page,
        'chat.more': data.total > 1
      })
    }).finally(() => {
      wx.hideLoading()
    })
  }
})