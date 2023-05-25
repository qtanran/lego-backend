const { Service } = require('egg')

class UserService extends Service {
  async createByEmail(payload) {
    const { ctx } = this
    const { username, password } = payload
    const hash = await ctx.genHash(password)
    const userCreatedData = {
      username,
      password: hash,
      email: username
    }
    return ctx.model.User.create(userCreatedData)
  }
  async findById(id) {
    return this.ctx.model.User.findById(id)
  }
  async findByUsername(username) {
    return this.ctx.model.User.findOne({ username })
  }
  async loginByCellphone(cellphone) {
    const { ctx, app } = this
    const user = await this.findByUsername(cellphone)
    // 检查 user 记录是否存在
    if (user) {
      return app.jwt.sign({ username: user.username }, app.config.jwt.secret)
    }
    const newUser = await ctx.model.User.create({
      username: cellphone,
      phoneNumber: cellphone,
      nickName: `乐高${cellphone.slice(-4)}`,
      type: 'cellphone'
    })
    return app.jwt.sign({ username: newUser.username }, app.config.jwt.secret)
  }
}

module.exports = UserService
