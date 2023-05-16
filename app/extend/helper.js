module.exports = {
  success({ ctx, res, msg }) {
    ctx.body = {
      errno: 0,
      data: res ? res : null,
      message: msg ? msg : '请求成功'
    }
    ctx.status = 200
  }
}
