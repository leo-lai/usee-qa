// search/index.js
const app = getApp()

Page({
  data: {
    searchKey: '',
    history: {
      data: []
    },
    problem: {
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
  onReachBottom: function () { // 加载更多
    this.getProblemList(this.data.problem.page + 1)
  },
  clearInput: function () {
    this.setData({
      searchKey: ''
    })
  },
  bindKeyInput: function (e) {
    if (e.detail.value === '') {
      this.setData({
        'problem.ajax': false
      })
    }
    this.setData({
      searchKey: e.detail.value
    })
  },
  historySearch: function (e) {
    this.setData({
      'searchKey': e.target.dataset.val,
      'problem.more': true
    })

    this.getProblemList(1)
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
    
    this.setData({
      'problem.more': true
    })
    this.getProblemList(1)
  },
  getProblemList: function (page = 1, callback = function () { }) {
    if (!this.data.problem.more || this.data.problem.loading) {
      callback(this.data.problem.data)
      return
    }

    this.setData({
      'problem.loading': true
    })

    app.post(app.config.problemList, {
      page,
      problemState: 2,
      problemRemarks: this.data.searchKey
    }).then(({ data }) => {
      this.setData({
        'problem.more': data.problems.length >= data.rows,
        'problem.page': data.page,
        'problem.data': data.page === 1 ? data.problems : this.data.problem.data.concat(data.problems)
      })
    }).finally(() => {
      this.setData({
        'problem.ajax': true,
        'problem.loading': false
      })
      callback(this.data.problem.data)
    })
  }
});