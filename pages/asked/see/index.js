// asked/see/index.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    problem: {
      state: [
        {
          cls: '',
          msg: '未支付'
        }, {
          cls: 'l-text-theme',
          msg: '等待医生抢答'
        }, {
          cls: 'l-text-green',
          msg: '等待医生回复'
        }, {
          cls: 'l-text-blue',
          msg: '交谈中'
        }, {
          cls: 'l-text-gray',
          msg: '已完成'
        }, {
          cls: '',
          msg: '已拒绝'
        }
      ],
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
    app.onLogin(userInfo => {
      this.getProblemList(1)
    })
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

    app.post(app.config.mySees, {
      page
    }).then(({ data }) => {
      data.list = data.list.map(item => {
        item.createDateStr = app.utils.formatTime2chs(item.createDate)
        return item
      })

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