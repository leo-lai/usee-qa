// ask/index.js
const app = getApp()
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
      replyType: '',
      content: ''
    },
    doctor: {
      problemId: '',
      isShow: false,
      data: []
    },
    userInfo: null
  },
  formData:{
    age: '',
    problemRemarks: ''
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
  onLoad: function () {
    this.scrollHeightFix()

    app.onLogin(userInfo => {
      this.setData({
        userInfo: userInfo
      })

      this.problemRemarks = []
      setTimeout(() => {
        this.systemSend('请根据提示输入基本信息，系统将为您推荐最佳医生', 0)
      }, 300)
      setTimeout(() => {
        this.systemSend('请输入患者的【年龄】', 1, 1)
      }, 800)
    })
  },
  // 系统发送消息
  systemSend: function (msgContent = '', msgType = 1, replyType = '') {
    let sendContent = {
      fromUserId: 'u00001',
      fromUserName: '系统消息',
      fromUserAvatar: '',
      toUserId: this.data.userInfo.userId,
      toUserName: this.data.userInfo.userName,
      toUserAvatar: this.data.userInfo.avatarUrl,
      msgType,  // 0提示 1文本 2图片 3语音
      msgState: 2, // -1未发送成功 0发送中 1已发送并未读 2已读
      msgContent,
      msgDatetime: new Date().format('yyyy-MM-dd hh:mm:ss')
    }
    
    this.setData({
      'send.replyType': replyType,
      'chat.data': this.data.chat.data.concat(sendContent)
    })
    this.scrollToBottom()
  },
  // 系统自动回复
  systemReply: function (sendContent = {}) {
    let msgContent = sendContent.msgContent

    clearTimeout(this.systemSendTimeId)
    switch (this.data.send.replyType) {
      case 1: // 患者年龄
        if (msgContent > 0 && msgContent <= 149) {
          this.formData.age = msgContent
          this.systemSend('请尽量详细描述患者的【主要症状】，【持续时间】，是否医院确诊及【检查结果】等，这样更容易获得医生的专业解答并节省交流时间', 1, 2)
          setTimeout(() => {
            this.systemSend('问题描述完毕后，请回复数字【1】确认', 0, 2)
          }, 500)
        } else {
          this.systemSend('您输入的年龄超出范围(0~149)，请重新输入', 0, 1)
        }
        break
      case 2: // 患者症状
        if (msgContent.trim() == 1) {
          if (this.problemRemarks.length === 0) {
            this.systemSend('您还没描述您的问题O_O', 0, 2)
          } else {
            this.formData.problemRemarks = this.problemRemarks.join(',')
            this.submitProblem()
          }
        } else {
          this.problemRemarks.push(msgContent)
          this.systemSendTimeId = setTimeout(() => {
            this.systemSend('还有其他问题需要要补充说明的吗？回复数字【1】结束问题', 1, 2)
          }, 10000)
        }
        break
    }
  },
  // 用户发送消息
  sendChat: function () {
    if (!this.data.send.content || this.data.send.content.trim().length === 0) {
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
      msgState: 2,
      msgDatetime: new Date().format('yyyy-MM-dd hh:mm:ss'),
      msgContent: this.data.send.content
    }

    this.setData({
      'send.content': '',
      'chat.data': this.data.chat.data.concat(sendContent)
    })

    this.scrollToBottom()

    this.systemReply(sendContent)
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
  // 提交问题
  submitProblem: function () {
    // this.systemSend('系统正在为您匹配专业医生...', 0)
    clearTimeout(this.systemSendTimeId)
    wx.showLoading({ mask: true })
    app.post(app.config.putQuestions, this.formData).then(({ data }) => {
      this.setData({
        'send.replyType': '',
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