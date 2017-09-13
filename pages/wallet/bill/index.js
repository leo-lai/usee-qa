// pages/wallet/details/index.js
const app = getApp()
const sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({
  data: {
    tabs: ['余额明细', '提现记录'],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    balance: {
      ajax: false,
      more: true,
      loading: false,
      page: 1,
      data: []
    },
    withdrawa: {
      ajax: false,
      more: true,
      loading: false,
      page: 1,
      data: []
    }
  },
  onLoad: function () {
    const that = this
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        })
      }
    })

    this.getBalanceList()
    this.getWithdrawList()
  },
  onReachBottom: function () { // 加载更多
    if (this.data.activeIndex === 0) {
      this.getBalanceList(this.data.balance.data.length > 0 ? this.data.balance.page + 1 : 1)
    } else if (this.data.activeIndex === 1) {
      this.getWithdrawList(this.data.withdrawa.data.length > 0 ? this.data.withdrawa.page + 1 : 1)
    }
  },
  onPullDownRefresh: function () { // 下拉刷新
    if (this.data.activeIndex === 0) {
      this.setData({
        'balance.more': true
      })
      this.getBalanceList(1, () => {
        wx.stopPullDownRefresh()
      })
    } else if (this.data.activeIndex === 1) {
      this.setData({
        'withdrawa.more': true
      })
      this.getWithdrawList(1, () => {
        wx.stopPullDownRefresh()
      })
    }
  },
  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    })
  },
  // 获取余额明细
  getBalanceList: function (page = 1, callback = function () { }) {
    if (!this.data.balance.more || this.data.balance.loading) {
      callback(this.data.balance.data)
      return
    }

    this.setData({
      'balance.loading': true
    })

    app.post(app.config.balanceList, {
      page
    }).then(({data}) => {
      data.list = data.list.map(item => {
        item.money = item.amount.toMoney()
        return item
      })
      this.setData({
        'balance.more': data.list.length >= data.rows,
        'balance.page': data.page,
        'balance.data': data.page === 1 ? data.list : this.data.balance.data.concat(data.list)
      })
    }).finally(() => {
      this.setData({
        'balance.loading': false
      })
      callback(this.data.balance.data)
    })
  },
  // 提现记录
  getWithdrawList: function (page = 1, callback = function () { }) {
    if (!this.data.withdrawa.more || this.data.withdrawa.loading) {
      callback(this.data.withdrawa.data)
      return
    }

    this.setData({
      'withdrawa.loading': true
    })

    app.post(app.config.withdrawList, {
      page
    }).then(({data}) => {
      data.withdrawalsList = data.withdrawalsList.map(item => {
        item.money = item.amount.toMoney()
        return item
      })
      this.setData({
        'withdrawa.more': data.withdrawalsList.length >= data.rows,
        'withdrawa.page': data.page,
        'withdrawa.data': data.page === 1 ? data.withdrawalsList : this.data.withdrawa.data.concat(data.withdrawalsList)
      })
    }).finally(() => {
      this.setData({
        'withdrawa.loading': false
      })
      callback(this.data.withdrawa.data)
    })
  }
})