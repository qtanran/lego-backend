const { Controller } = require('egg')

const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 }
}

const sendCodeRules = {
  phoneNumber: { type: 'string', format: /^1[3-9]\d{9}$/, message: '手机号码格式错误' }
}

class UserController extends Controller {
  async createByEmail() {
    const { ctx, service, app } = this
    const errors = app.validator.validate(userCreateRules, ctx.request.body)
    ctx.logger.warn(errors)
    if (errors) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error: errors })
    }
    const { username } = ctx.request.body
    const user = await service.user.findByUsername(username)
    if (user) {
      return ctx.helper.error({ ctx, errorType: 'createUserAlreadyExists' })
    }
    const userData = await service.user.createByEmail(ctx.request.body)
    ctx.helper.success({ ctx, res: userData })
  }

  /**
   * 校验用户的输入
   * @param rules 校验规则
   * @returns {ValidateError[]} 校验结果
   */
  validateUserInput(rules) {
    const { ctx, app } = this
    const errors = app.validator.validate(rules, ctx.request.body)
    ctx.logger.warn(errors)
    return errors
  }

  async sendVeriCode() {
    const { ctx, app } = this
    const { phoneNumber } = ctx.request.body
    // 检查用户输入
    const error = this.validateUserInput(sendCodeRules)
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error })
    }
    // 获取 redis 的数据
    const preVeriCode = await app.redis.get(`phoneVeriCode-${phoneNumber}`)
    // 判断是否存在
    if (preVeriCode) {
      return ctx.helper.error({ ctx, errorType: 'sendVeriCodeFrequentlyFailInfo' })
    }
    const veriCode = Math.floor(Math.random() * 9000 + 1000)
    await app.redis.set(`phoneVeriCode-${phoneNumber}`, veriCode, 'ex', 60)
    ctx.helper.success({ ctx, res: veriCode })
  }

  /**
   * 通过邮箱登录
   * @returns {Promise<*>}
   */
  async loginByEmail() {
    const { ctx, service, app } = this
    // 检查用户的输入
    const error = this.validateUserInput(userCreateRules)
    if (error) {
      return ctx.helper.error({ ctx, errorType: 'userValidateFail', error })
    }
    // 根据 username 获取用户信息
    const { username, password } = ctx.request.body
    const user = await service.user.findByUsername(username)
    // 检查用户是否存在
    if (!user) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
    }
    const verifyPwd = await ctx.compare(password, user.password)
    // 验证密码是否成功
    if (!verifyPwd) {
      return ctx.helper.error({ ctx, errorType: 'loginCheckFailInfo' })
    }
    const token = app.jwt.sign({ username: user.username }, app.config.jwt.secret, {
      expiresIn: 60 * 60
    })
    ctx.helper.success({ ctx, res: { token }, msg: '登录成功' })
  }
  async show() {
    const { ctx, service } = this
    const userData = await service.user.findByUsername(ctx.state.user.username)
    ctx.helper.success({ ctx, res: userData.toJSON() })
  }
}

module.exports = UserController
