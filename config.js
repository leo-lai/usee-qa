/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

var baseUrl = "http://api.usee1.com.cn/useeproject/eyeinterface"

var config = {

    // 注册/登录 返回用户信息
    userInfo: `${baseUrl}/diagnose/login`,
    // 问题列表，搜索
    problemList: `${baseUrl}/diagnose/problemList`,
    // 问题详情
    problemInfo: `${baseUrl}/diagnose/checkBeforInfo`,
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


    // 下面的地址配合云端 Server 工作
    baseUrl
};

module.exports = config
