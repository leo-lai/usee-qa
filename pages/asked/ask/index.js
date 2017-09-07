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
    }).then(response => {
      let data = {
        page: 1,
        rows: 1000,
        problems: response.data
      }

      this.setData({
        'problem.more': data.problems.length >= data.rows,
        'problem.page': data.page,
        'problem.data': data.page === 1 ? data.problems : this.data.problem.data.concat(data.problems)
      })
    }).finally(() => {
      this.setData({
        'problem.loading': false
      })
      callback(this.data.problem.data)
    })
  }
})