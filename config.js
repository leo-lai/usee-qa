/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

var baseUrl = "http://api.usee1.com.cn/useeproject/eyeinterface"

var config = {
  // 野狗配置
  wilddog: {
    syncURL: 'https://wd5822510528sjwblr.wilddogio.com',
    authDomain: '<wd5822510528sjwblr.wilddog.com>'
  },

  // 注册/登录 返回用户信息
  login: `${baseUrl}/diagnose/login`,
  // 获取用户信息
  userInfo: `${baseUrl}/diagnose/refreshMyInfo`,
  // 余额明细
  balanceList: `${baseUrl}/diagnose/balanceDetails`,
  // 提现申请
  withdrawal: `${baseUrl}/diagnose/eyeWithdrawals`,
  //提现申请记录
  withdrawList: `${baseUrl}/diagnose/withdrawalsList`,
  // 问题列表，搜索
  problemList: `${baseUrl}/diagnose/problemList`,
  // 问题详情
  problemInfo: `${baseUrl}/diagnose/checkBeforInfo`,
  // 结束问题
  endProblem: `${baseUrl}/diagnose/endProblem`,
  // 医生抢答
  problemRob: `${baseUrl}/diagnose/robProblem`,
  // 我提交的问题
  myAsks: `${baseUrl}/diagnose/myInterrogations`,
  // 我看过的问题
  mySees: `${baseUrl}/diagnose/myCheck`,
  // 问题提交
  putQuestions: `${baseUrl}/diagnose/putQuestions`,
  // 问题订单
  createOrder: `${baseUrl}/diagnose/createOrder`,
  // 支付配置信息
  payConfig: `${baseUrl}/eyeAppPay/pay/prepare`,
  // 医生申请
  doctorApply: `${baseUrl}/diagnose/applyToDoctor`,
  // 医生擅长标签
  doctorLabels: `${baseUrl}/diagnose/getLabels`,
  // 医生列表
  doctorList: `${baseUrl}/diagnose/doctorList`,
  // 医生详情
  doctorInfo: `${baseUrl}/diagnose/doctorInfo`,
  // 医生更新个人信息
  doctorInfoUpdate: `${baseUrl}/diagnose/doctorInfoUpdate`,
  // 手机验证码 phoneNumber
  phoneCode: `${baseUrl}/diagnose/phoneVerifyCode`,
  // 上传图片 img_file
  uploadImage: `${baseUrl}/diagnose/uploadImage`,
  // 发送消息
  sendMessage: `${baseUrl}/diagnose/sendMessage`,
  // 评价
  evaluate: `${baseUrl}/diagnose/evaluate`,


  // 下面的地址配合云端 Server 工作
  baseUrl
};

module.exports = config
