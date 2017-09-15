// me/index.js
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
        userInfo: userInfo
      })
      
    })
  },
  onShow: function () {
    if (this.data.userInfo.isDoctor === 0) { // 用户

    } else if (this.data.userInfo.isDoctor === 1) { // 医生
      app.refreshUserInfo().then(({ data }) => {
        this.setData({
          userInfo: data
        })
      })
    }
  }
})