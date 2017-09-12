// asked/ask/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    problem: {
      state: ['未支付', '已支付', '进行中', '已完成', '已拒绝'],
      loading: false,
      more: true,
      page: 1,
      data: []
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProblemList(1)
  },
  onReachBottom: function () { // 加载更多
    this.getProblemList(this.data.problem.data.length > 0 ? this.data.problem.page + 1 : 1)
  },
  onPullDownRefresh: function () { // 下拉刷新
    this.setData({
      'problem.more': true
    })
    this.getProblemList(1, () => {
      wx.stopPullDownRefresh()
    })
  },
  getProblemList: function (page = 1, callback = function () { }) {
    if (!this.data.problem.more || this.data.problem.loading) {
      callback(this.data.problem.data)
      return
    }

    this.setData({
      'problem.loading': true
    })

    app.post(app.config.myAsks, {
      page
    }).then(({data}) => {
      this.setData({
        'problem.more': data.list.length >= data.rows,
        'problem.page': data.page,
        'problem.data': data.page === 1 ? data.list : this.data.problem.data.concat(data.list)
      })
    }).finally(() => {
      this.setData({
        'problem.loading': false
      })
      callback(this.data.problem.data)
    })
  }
})