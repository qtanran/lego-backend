const { Controller } = require('egg');

class UserController extends Controller {
  async createByEmail() {
    const { ctx, service } = this;
    const userData = await service.user.createByEmail(ctx.request.body)
    ctx.helper.success({ ctx, res: userData })
  }
  async show() {
    const { ctx, service } = this
    const userData = await service.user.findById(ctx.params.id)
    ctx.helper.success({ ctx, res: userData })
  }
}

module.exports = UserController;