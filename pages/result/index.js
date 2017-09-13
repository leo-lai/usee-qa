// pages/result/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    resultType: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      resultType: options.type || ''
    })
  },
  backTo: function (e) {
    console.log(e)
    wx.navigateBack({
      delta: Number(e.target.dataset.delta) || 1
    })
  }
})