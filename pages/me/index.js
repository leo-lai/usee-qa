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
    app.onReady(userInfo => {
      this.setData({
        userInfo: userInfo
      })

      if (userInfo.isDoctor === 0) { // 用户

      } else if (userInfo.isDoctor === 1) { // 医生

      }
    })
  }
})