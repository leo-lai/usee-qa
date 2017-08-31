//index/index.js
const app = getApp()

Page({
  data: {
    problem: {
      loading: false,
      more: true,
      page: 1,
      data: []
    },
    userInfo: null
  },
  onLoad: function () {
    app.onReady(userInfo => {
      this.setData({
        userInfo: userInfo
      })

      if (userInfo.isDoctor === 0) { // 用户
        this.getProblemList(1)
      } else if (userInfo.isDoctor === 1) { // 医生

      }
    })
  },
  onReachBottom: function () { // 加载更多
    if (this.data.userInfo) {
      if (this.data.userInfo.isDoctor === 0) { // 用户
        this.getProblemList(this.data.problem.page + 1)
      } else if (this.data.userInfo.isDoctor === 1) { // 医生

      }
    }
  },
  onPullDownRefresh: function () { // 下拉刷新
    if (this.data.userInfo) {
      if (this.data.userInfo.isDoctor === 0) { // 用户
        this.setData({
          'problem.more': true
        })
        this.getProblemList(1, () => {
          wx.stopPullDownRefresh()
        })
      } else if (this.data.userInfo.isDoctor === 1) { // 医生

      }
    } else {
      wx.stopPullDownRefresh()
    }
  },
  getProblemList: function (page = 1, callback = function(){}) {
    if (!this.data.problem.more || this.data.problem.loading) {
      callback(this.data.problem.data)
      return
    }

    this.setData({
      'problem.loading': true
    })

    app.post(app.config.problemList, {
      page,
      problemState: 2
    }).then(({ data }) => {
      if (data.problems.length > 0) {
        this.setData({
          'problem.more': data.problems.length >= data.rows,
          'problem.page': data.page,
          'problem.data': data.page === 1 ? data.problems : this.data.problem.data.concat(data.problems)
        })
      }
    }).finally(() => {
      this.setData({
        'problem.loading': false
      })
      callback(this.data.problem.data)
    })
  }
})
