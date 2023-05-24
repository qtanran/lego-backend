const { Controller } = require('egg')

const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 }
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
  validateUserInput() {
    const { ctx, app } = this
    const errors = app.validator.validate(userCreateRules, ctx.request.body)
    ctx.logger.warn(errors)
    return errors
  }
  async loginByEmail() {
    const { ctx, service, app } = this
    // 检查用户的输入
    const error = this.validateUserInput()
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
