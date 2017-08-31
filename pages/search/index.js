// search/index.js
const app = getApp()

Page({
  data: {
    searchKey: '',
    history: {
      data: []
    },
    result: {
      ajax: false,
      more: true,
      loading: false,
      page: 1,
      data: []
    }
  },
  onLoad: function () {
    // 获取搜索历史记录
    app.storage.getItem('search_history').then((value) => {
      this.setData({
        'history.data': value || []
      })
    })
  },
  clearInput: function () {
    this.setData({
      searchKey: ''
    })
  },
  bindKeyInput: function (e) {
    this.setData({
      searchKey: e.detail.value
    })
  },
  // 清除搜索历史记录
  clear: function () {
    app.storage.removeItem('search_history')
    this.setData({
      'history.data': []
    })
  },
  // 搜索
  search: function (e) {
    // 本地记录搜索关键词
    if (!this.data.history.data.includes(this.data.searchKey)) {
      let historyData = this.data.history.data.concat(this.data.searchKey)
      this.setData({
        'history.data': historyData
      })
      app.storage.setItem('search_history', historyData)
    }
    
  }
});