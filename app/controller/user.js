const { Controller } = require('egg');

const userCreateRules = {
  username: 'email',
  password: { type: 'password', min: 8 }
}

class UserController extends Controller {
  async createByEmail() {
    const { ctx, service, app } = this;
    const errors = app.validator.validate(userCreateRules, ctx.request.body)
    ctx.logger.warn(errors)
    if (errors) {
      return ctx.helper.error({ ctx, errno: 10001, msg: '验证错误' })
    }
    const userData = await service.user.createByEmail(ctx.request.body)
    ctx.helper.success({ ctx, res: userData })
  }
  async show() {
    const { ctx, service } = this
    // const userData = await service.user.findById(ctx.params.id)
    // ctx.helper.success({ ctx, res: userData })
  }
}

module.exports = UserController;
