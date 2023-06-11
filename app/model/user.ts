import { Application } from 'egg'
const AutoIncrementFactory = require('mongoose-sequence');

export interface UserProps {
  username: string
  password: string
  email?: string
  nickName?: string
  picture?: string
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
  type: 'email' | 'cellphone' | 'oauth'
  provider?: 'gitee'
  oauthID?: string
}

module.exports = (app: Application) => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
  const AutoIncrement = AutoIncrementFactory(mongoose)

  const UserSchema = new Schema<UserProps>(
    {
      username: { type: String, unique: true, required: true },
      password: { type: String },
      nickName: { type: String },
      picture: { type: String },
      email: { type: String },
      phoneNumber: { type: String },
      type: { type: String, default: 'email' },
      provider: { type: String },
      oauthID: { type: String }
    },
    {
      timestamps: true,
      toJSON: {
        transform(_doc, ret) {
          delete ret.password
          delete ret.__v
        }
      }
    }
  )
  UserSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'users_id_counter' })
  return mongoose.model<UserProps>('User', UserSchema, 'user')
}
