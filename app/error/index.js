module.exports = {
  userValidateFail: {
    errno: 101001,
    message: '输入信息验证失败'
  },
  // 创建用户，用户已经存在
  createUserAlreadyExists: {
    errno: 101002,
    message: '该邮箱已经被注册，请直接登录'
  },
  // 用户不存在或者密码错误
  loginCheckFailInfo: {
    errno: 101003,
    message: '该用户不存在或者密码错误'
  },
  loginValidateFail: {
    errno: 101004,
    message: '登录校验失败'
  },
  // 发送短信验证码过于频繁
  sendVeriCodeFrequentlyFailInfo: {
    errno: 101005,
    message: '请勿频繁获取短信验证码'
  }
}
