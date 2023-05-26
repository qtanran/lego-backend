const { default: Client } = require('@alicloud/dysmsapi20170525')
const { Config } = require('@alicloud/openapi-client')

const ALCLIENT = Symbol('Application#ALClient')

module.exports = {
  get ALClient() {
    const { accessKeyId, accessKeySecret, endpoint } = this.config.aliCloudConfig
    if (!this[ALCLIENT]) {
      const config = new Config({
        accessKeyId,
        accessKeySecret
      })
      config.endpoint = endpoint
      this[ALCLIENT] = new Client(config)
    }
    return this[ALCLIENT]
  }
}
