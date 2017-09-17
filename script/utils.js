Promise.prototype.done = Promise.prototype.done || function (onFulfilled, onRejected) {
  this.then(onFulfilled, onRejected)
    .catch(reason => setTimeout(() => { throw reason }, 0))
}
Promise.prototype.finally = Promise.prototype.finally || function (callback) {
  let P = this.constructor
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  )
}

// 金钱格式 100000.11 -> 100,000.11
Number.prototype.toMoney = function (places, symbol = '', thousand = ',', decimal = '.') {
  places = !isNaN(places = Math.abs(places)) ? places : 2
  var number = this,
    negative = number < 0 ? '-' : '',
    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + '',
    j = (j = i.length) > 3 ? j % 3 : 0
  return symbol + negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : '')
}

/** 
 *  对Date的扩展，将 Date 转化为指定格式的String * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
    可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) * eg: * (new
    Date()).pattern("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423      
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04      
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04      
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04      
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18      
 */
Date.prototype.format = Date.prototype.format || function (fmt = 'yyyy-MM-dd HH:mm') {
  var o = {
    'M+': this.getMonth() + 1, //月份         
    'd+': this.getDate(), //日         
    'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时         
    'H+': this.getHours(), //小时         
    'm+': this.getMinutes(), //分         
    's+': this.getSeconds(), //秒         
    'q+': Math.floor((this.getMonth() + 3) / 3), //季度         
    'S': this.getMilliseconds() //毫秒         
  }
  var week = {
    '0': '/u65e5',
    '1': '/u4e00',
    '2': '/u4e8c',
    '3': '/u4e09',
    '4': '/u56db',
    '5': '/u4e94',
    '6': '/u516d'
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '/u661f/u671f' : '/u5468') : '') + week[this.getDay() + ''])
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

// dateStr  "yyyy-MM-dd hh:mm:ss" 转成Date对象
const str2date = (dateStr = '') => {
  return dateStr ? new Date(Date.parse(dateStr.replace(/-/gi, '/'))) : new Date()
}

// JS转换时间戳为“刚刚”、“1分钟前”、“2小时前”
// dateStr  "yyyy-MM-dd hh:mm:ss"
const formatTime2chs = (dateStr = '', fmt) => {

  if (!dateStr) return ''

  // 将时间字符串转化成毫秒ms
  let date = str2date(dateStr)
  let dateMs = date.getTime()
  let nowDate = new Date()
  
  let diffMs = nowDate.getTime() - dateMs
  let minute = 1000 * 60
  let hour = minute * 60
  let day = hour * 24
  let halfamonth = day * 15
  let month = day * 30
  let monthC = diffMs / month
  let weekC = diffMs / (7 * day)
  let dayC = diffMs / day
  let hourC = diffMs / hour
  let minC = diffMs / minute

  if (fmt) {
    if (dayC > 2) {
      return date.format('yyyy年M月d日 HH:mm')
    } else {
      let diffDay = nowDate.getDate() - date.getDate()
      if (diffDay === 0) {
        return date.format('HH:mm')
      } else {
        return '昨天 ' + date.format('HH:mm')
      }
    }
  }

  const week = {
    '0': '/u65e5',
    '1': '/u4e00',
    '2': '/u4e8c',
    '3': '/u4e09',
    '4': '/u56db',
    '5': '/u4e94',
    '6': '/u516d'
  }

  let result = ''
  if (monthC >= 1) { // 大于一个月则显示日期
    result = date.format('yyyy年M月d')
  }
  else if (weekC > 1) {
    result = parseInt(weekC) + '周前'
  }
  else if (weekC == 1) { // 星期几
    result = '/u661f/u671f' + week[date.getDay()] + ' ' + date.format('HH:mm')
  }
  else if (dayC >= 2) { // 大于48小时
    result = parseInt(dayC) + '天前'
  }
  else if (hourC >= 1) {
    result = parseInt(hourC) + '小时前'
  }
  else if (minC >= 1) {
    result = parseInt(minC) + '分钟前'
  }
  else {
    result = '刚刚'
  }

  return result
}

// 微信头像
const formatHead = (src, size = 132) => {
  if (!src) {
    return `https://placeholdit.imgix.net/~text?txtsize=16&bg=999&txtclr=fff&txt=%E5%9B%BE%E7%89%87%E7%BC%BA%E5%A4%B1&w=${size}&h=${size}`
  }
  if (src.indexOf('wx.qlogo.cn') === -1) {
    return src
  }
  // 有0、46、64、96、132数值可选，0代表640*640正方形头像
  return src.replace(/\/0$/, '/' + size)
}

// 七牛缩略图
const formatThumb = (src = '', width, height) => {
  width = width || 320
  if (!src) {
    // return `https://placeholdit.imgix.net/~text?txtsize=20&bg=ffffff&txtclr=999&txt=image&w=${width}&h=${width}` 
    return ''
  }
  if (src.indexOf('clouddn.com') === -1) {
    return src
  }

  // return src += '?imageMogr2/gravity/Center/crop/'+width+'x'+height;
  src += `?imageMogr2/format/jpg/interlace/1/quality/60/gravity/Center/thumbnail/${width}x`
  if (height) {
    src += `/crop/x${height}`
  }
  return src
}

module.exports = {
  str2date,
  formatTime2chs,
  formatHead,
  formatThumb
}
