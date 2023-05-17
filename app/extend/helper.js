module.exports = {
  success({ ctx, res, msg }) {
    ctx.body = {
      errno: 0,
      data: res ? res : null,
      message: msg ? msg : '请求成功'
    }
    ctx.status = 200
  },
  error({ ctx, msg, errno }) {
    ctx.body = {
      errno,
      message: msg ? msg : '请求错误'
    }
    ctx.status = 200
  }
}
