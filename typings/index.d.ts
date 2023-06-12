import 'egg'
import 'egg-jwt'
import 'egg-redis'
import 'egg-mongoose'

declare module 'egg' {
  interface Application {
    ALClient: any
  }
}
