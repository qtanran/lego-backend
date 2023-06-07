import { Application } from 'egg'
import Dysmsapi from '@alicloud/dysmsapi20170525'
import * as $OpenApi from '@alicloud/openapi-client'

const ALCLIENT = Symbol('Application#ALClient')

export default {
  get ALClient(): Dysmsapi {
    const { accessKeyId, accessKeySecret, endpoint } = (this as Application).config.aliCloudConfig
    if (!this[ALCLIENT]) {
      const config = new $OpenApi.Config({
        accessKeyId,
        accessKeySecret
      })
      config.endpoint = endpoint
      this[ALCLIENT] = new Dysmsapi(config)
    }
    return this[ALCLIENT]
  }
}
