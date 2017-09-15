// pages/invitation/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.onLogin(userInfo => {
      this.setData({
        userInfo
      })
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: `您的好友【${this.data.userInfo.userName}】邀请您加入手机里的私人会所，随时随地帮助患者解答问题，还能赚钱丰厚佣金。`,
      path: `/pages/doctor-apply/index?uid=${this.data.userInfo.userId}`
    }
  }
})