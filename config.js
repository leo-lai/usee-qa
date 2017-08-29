/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

var baseUrl = "http://api.usee1.com.cn/useeproject/eyeinterface"

var config = {

    // 下面的地址配合云端 Server 工作
    baseUrl,

    // 注册/登录 返回用户信息
    userInfo: `${baseUrl}/diagnose/login`
};

module.exports = config
