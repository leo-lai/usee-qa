// ask/index.js
const app = getApp()
let systemSendTimeId = 0
let systemSendTimes = 0
let problemRemarks = []  // 问题描述
let formData = {
  age: '',
  problemRemarks: ''
}

Page({
  data: {
    scrollIntoView: 'scroll-bottom',
    scrollHeight: 999,
    chat: {
      data: [],
      hideMenu: true,
      disabled: false,
      inputFocus: false
    },
    send: {
      answerType: '',
      content: ''
    },
    doctor: {
      problemId: '',
      isShow: false,
      data: []
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
  onLoad: function () {
    this.scrollHeightFix()

    app.onReady(userInfo => {
      console.warn(userInfo)
      this.setData({
        userInfo: userInfo
      })

      problemRemarks = []
      setTimeout(() => {
        this.systemSend('请输入患者的【年龄】', 1)
      }, 300)
    })
  },
  // 系统发送消息
  systemSend: function (msgContent = '', answerType = 1) {
    let sendContent = {
      fromUserId: 'u00001',
      fromUserName: '系统消息',
      fromUserAvatar: '',
      toUserId: this.data.userInfo.userId,
      toUserName: this.data.userInfo.userName,
      toUserAvatar: this.data.userInfo.avatarUrl,
      msgType: 1,  // 1文本 2图片 3语音
      msgState: 1, // -1未发送成功 0发送中 1已发送并未读 2已读
      msgContent: msgContent,
      msgDatetime: (new Date()).format('yyyy-MM-dd hh:mm:ss')
    }
    
    this.setData({
      'send.answerType': answerType,
      'chat.data': [].concat(this.data.chat.data, sendContent)
    })

    this.scrollToBottom()
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
        if (msgContent > 0 && msgContent <= 149) {
          formData.age = msgContent
          this.systemSend('请尽量详细描述患者的【主要症状】，【持续时间】，是否医院确诊及【检查结果】等，这样更容易获得医生的专业解答并节省交流时间', 2)
        } else {
          this.systemSend('请输入真实的【年龄0-149】', 1)
        }
        break
      case 2:
        if (msgContent.trim() == 1){
          if (problemRemarks.length === 0){
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
  // 提交问题
  submitProblem: function () {
    // this.systemSend('系统正在为您匹配专业医生...')
    wx.showLoading({
      mask: true
    })
    app.post(app.config.putQuestions, formData).then(({ data }) => {
      this.setData({
        'send.answerType': '',
        'doctor.isShow': true,
        'doctor.data': data.doctors,
        'doctor.problemId': data.problemId
      })

      this.scrollToBottom()
    }).finally(() => {
      wx.hideLoading()
    })
  }
})