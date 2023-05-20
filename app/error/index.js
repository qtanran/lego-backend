module.exports = {
  createUserValidateFail: {
    errno: 101001,
    message: '创建用户验证失败'
  },
  // 创建用户，用户已经存在
  createUserAlreadyExists: {
    errno: 101002,
    message: '该邮箱已经被注册，请直接登录'
  }
}
