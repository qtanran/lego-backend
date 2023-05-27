const { Service } = require('egg')
const $Dysmsapi = require('@alicloud/dysmsapi20170525')

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

  /**
   * 调用阿里云服务，发送短信验证码
   * @param phoneNumber 手机号
   * @param veriCode 验证码
   * @returns {Promise<SendSmsResponse>}
   */
  async sendSMS(phoneNumber, veriCode) {
    const { app } = this
    // 配置参数
    const sendSMSRequest = new $Dysmsapi.SendSmsRequest({
      phoneNumbers: phoneNumber,
      signName: process.env.SIGN_NAME,
      templateCode: process.env.TEMPLATE_CODE,
      templateParam: `{\"code\":\"${veriCode}\"}`
    })
    return await app.ALClient.sendSms(sendSMSRequest)
  }

  /**
   * 通过手机号登录
   * @param cellphone 手机号
   * @returns {Promise<string>}
   */
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

  async getAccessToken(code) {
    const { ctx, app } = this
    const { cid, secret, redirectURL, authURL } = app.config.giteeOauthConfig
    const { data } = await ctx.curl(authURL, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: {
        code,
        client_id: cid,
        redirect_uri: redirectURL,
        client_secret: secret
      }
    })
    app.logger.info(data)
    return data
  }
}

module.exports = UserService
