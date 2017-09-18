//index/index.js
const app = getApp()
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
  data: {
    tabs: [{
      index: 0,
      title: '解答中',
      loading: false,
      more: true,
      page: 1,
      data: []
    }, {
      index: 1,
      title: '可抢答',
      loading: false,
      more: true,
      page: 1,
      data: []
    }],
    activeIndex: '0',
    sliderOffset: 0,
    sliderLeft: 0,
    problem: {
      loading: false,
      more: true,
      page: 1,
      data: []
    },
    userInfo: null
  },
  onLoad: function () {
    app.onLogin(userInfo => {
      console.warn(userInfo)
      this.setData({ userInfo })

      if (userInfo.isDoctor === 0) { // 用户
        this.getProblemList(1)
      } else if (userInfo.isDoctor === 1) { // 医生
        wx.getSystemInfo({
          success: res => {
            this.setData({
              sliderLeft: (res.windowWidth / this.data.tabs.length - sliderWidth) / 2,
              sliderOffset: res.windowWidth / this.data.tabs.length * this.data.activeIndex
            })
          }
        })
        this.getProblems_S23(1)
        this.getProblems_S1(1)
      }
    })
  },
  onReachBottom: function () { // 加载更多
    if (this.data.userInfo) {
      if (this.data.userInfo.isDoctor === 0) { // 用户
        this.getProblemList(this.data.problem.data.length > 0 ? this.data.problem.page + 1 : 1)
      } else if (this.data.userInfo.isDoctor === 1) { // 医生
        if (this.data.activeIndex == 0) {
          this.getProblems_S23(this.data.tabs[0].data.length > 0 ? this.data.tabs[0].page + 1 : 1)
        } else if (this.data.activeIndex == 1) {
          this.getProblems_S1(this.data.tabs[1].data.length > 0 ? this.data.tabs[1].page + 1 : 1)
        }
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
        
        if (this.data.activeIndex == 0) {
          this.setData({
            'tabs[0].more': true
          })
          this.getProblems_S23(1, () => {
            wx.stopPullDownRefresh()
          })
        } else if (this.data.activeIndex == 1) {
          this.setData({
            'tabs[1].more': true
          })
          this.getProblems_S1(1, () => {
            wx.stopPullDownRefresh()
          })
        }
      }
    } else {
      wx.stopPullDownRefresh()
    }
  },
  // 0初始 1已支付未指定医生 2指定医生等待回复(48小时) 3交谈中 4成功解答结束问题 5医生未回复结束问题
  // 已解答问题
  getProblemList: function (page = 1, callback = app.noop) {
    if (!this.data.problem.more || this.data.problem.loading) {
      callback(this.data.problem.data)
      return
    }
    this.setData({
      'problem.loading': true
    })
    app.post(app.config.problemList, {
      page,
      isIndex: true,
      problemState: 4
    }).then(({ data }) => {
      data.problems = data.problems.map(item => {
        item.createDateStr = app.utils.formatTime2chs(item.createDate)
        return item
      })
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
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    })
  },
  // 解答中问题
  getProblems_S23: function (page = 1, callback = app.noop) {
    if (!this.data.tabs[0].more || this.data.tabs[0].loading) {
      callback(this.data.tabs[0].data)
      return
    }
    this.setData({
      'tabs[0].loading': true
    })
    app.post(app.config.problemList, {
      page,
      problemStates: '2,3'
    }).then(({ data }) => {
      data.problems = data.problems.map(item => {
        item.createDateStr = app.utils.formatTime2chs(item.createDate, true)
        return item
      })
      this.setData({
        'tabs[0].more': data.problems.length >= data.rows,
        'tabs[0].page': data.page,
        'tabs[0].data': data.page === 1 ? data.problems : this.data.tabs[0].data.concat(data.problems)
      })
    }).finally(() => {
      this.setData({
        'tabs[0].loading': false
      })
      callback(this.data.tabs[0].data)
    })
  },
  // 可抢答问题
  getProblems_S1: function (page = 1, callback = app.noop) {
    if (!this.data.tabs[1].more || this.data.tabs[1].loading) {
      callback(this.data.tabs[1].data)
      return
    }
    this.setData({
      'tabs[1].loading': true
    })
    app.post(app.config.problemList, {
      page,
      problemStates: '1'
    }).then(({ data }) => {
      data.problems = data.problems.map(item => {
        item.createDateStr = app.utils.formatTime2chs(item.createDate, true)
        return item
      })
      this.setData({
        'tabs[1].more': data.problems.length >= data.rows,
        'tabs[1].page': data.page,
        'tabs[1].data': data.page === 1 ? data.problems : this.data.tabs[1].data.concat(data.problems)
      })
    }).finally(() => {
      this.setData({
        'tabs[1].loading': false
      })
      callback(this.data.tabs[1].data)
    })
  }
})
