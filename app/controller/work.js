const { Controller } = require('egg')

const workCreateRules = {
  title: 'string'
}

class WorkController extends Controller {
  validateUserInput(rules) {
    const { ctx, app } = this
    const errors = app.validator.validate(rules, ctx.request.body)
    ctx.logger.warn(errors)
    return errors
  }

  async createWork() {
    const { ctx, service } = this
    const errors = this.validateUserInput(workCreateRules)
    if (errors) {
      return ctx.helper.error({ ctx, errorType: 'workValidateFail', error: errors })
    }
    const workData = await service.work.createEmptyWork(ctx.request.body)
    ctx.helper.success({ ctx, res: workData })
  }
}

module.exports = WorkController
