// ask/index.js
let problemChat = [
  {
    fromUserId: 'u00001',
    fromUserName: '系统消息',
    fromUserAvatar: '',
    toUserId: '',
    toUserName: '',
    toUserAvatar: '',
    msgType: 1,  // 1文本 2图片 3语音
    msgState: 0, // -1未发送成功 0发送中 1已发送 2未读 3已读
    msgContent: '您好，请根据提示输入基本信息帮助我们为您推荐最佳医生',
    msgDatetime: ''
  }, {
    fromUserId: 'u00001',
    fromUserName: '系统消息',
    fromUserAvatar: '',
    msgContent: '请输入患者【年龄】'
  }, {
    fromUserId: 'u00001',
    fromUserName: '系统消息',
    fromUserAvatar: '',
    msgContent: '请尽量详细描述患者的【主要症状】，【持续时间】，是否医院确诊及【检查结果】等，这样更容易获得医生的专业解答并节省交流时间，描述完成请回复数字【1】'
  }, {
    fromUserId: 'u00001',
    fromUserName: '系统消息',
    fromUserAvatar: '',
    msgContent: '还有其他要补充说明吗？没有的话请回复数字【1】'
  }
]

const app = getApp()
Page({
  data: {
    chat: {
      data: [],
      hideMenu: true,
      inputFocus: false
    },
    send: {
      content: ''
    },
    userInfo: null
  },
  onReady: function () {
    app.onReady(userInfo => {
      this.setData({
        userInfo: userInfo
      })

      setTimeout(this.systemSend, 1000)
      setTimeout(this.systemSend, 2000)
    })
  },
  systemSend: function () {
    let sendContent = this.problemChat.shift()

    sendContent.msgType = 1
    sendContent.msgState = 1
    sendContent.msgDatetime = (new Date()).format('yyyy-MM-dd hh:mm:ss')
    sendContent.toUserId = this.data.userInfo.userId
    sendContent.toUserName = this.data.userInfo.userName
    sendContent.toUserAvatar = this.data.userInfo.avatarUrl
    
    this.setData({
      'chat.data': [].concat(this.data.chat.data, sendContent)
    })
  },
  sendChat: function () {

  },
  bindInputFocus: function () {
    this.setData({
      'chat.hideMenu': true
    })
  },
  bindInputBlur: function () {

  },
  bindHideChatMenu: function() {
    this.setData({
      'chat.hideMenu': !this.data.chat.hideMenu,
      'chat.inputFocus': !this.data.chat.hideMenu
    })
  },
  problemChat: [
    {
      fromUserId: 'u00001',
      fromUserName: '系统消息',
      fromUserAvatar: '',
      toUserId: '',
      toUserName: '',
      toUserAvatar: '',
      msgType: 1,  // 1文本 2图片 3语音
      msgState: 0, // -1未发送成功 0发送中 1已发送 2未读 3已读
      msgContent: '您好，请根据提示输入基本信息帮助我们为您推荐最佳医生',
      msgDatetime: ''
    }, {
      fromUserId: 'u00001',
      fromUserName: '系统消息',
      fromUserAvatar: '',
      msgContent: '请输入患者【年龄】'
    }, {
      fromUserId: 'u00001',
      fromUserName: '系统消息',
      fromUserAvatar: '',
      msgContent: '请尽量详细描述患者的【主要症状】，【持续时间】，是否医院确诊及【检查结果】等，这样更容易获得医生的专业解答并节省交流时间，描述完成请回复数字【1】'
    }, {
      fromUserId: 'u00001',
      fromUserName: '系统消息',
      fromUserAvatar: '',
      msgContent: '还有其他要补充说明吗？没有的话请回复数字【1】'
    }
  ]
})