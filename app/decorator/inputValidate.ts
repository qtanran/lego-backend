export default (rules: any, errorType) => {
  return function (_prototype, _key, descriptor) {
    const originalMethod = descriptor.value
    descriptor.value = async function (...args) {
      const { ctx, app } = this
      const errors = app.validator.validate(rules, ctx.request.body)
      if (errors) {
        return ctx.helper.error({ ctx, errorType, error: errors })
      }
      await originalMethod.apply(this, args)
    }
  }
}
