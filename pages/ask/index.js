// index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chat: {
      hideMenu: true,
      inputFocus: false
    }
  },
  bindHideChatMenu: function() {
    this.setData({
      'chat.hideMenu': !this.data.chat.hideMenu,
      'chat.inputFocus': !this.data.chat.hideMenu
    })
  }
})