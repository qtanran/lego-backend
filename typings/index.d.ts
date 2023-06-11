import 'egg'
import 'egg-jwt'
import 'egg-redis'
import 'egg-mongoose'
import '@types/mongoose-sequence'

declare module 'egg' {
  interface Application {
    ALClient: any
  }
}
