const AutoIncrementFactory = require('mongoose-sequence')

function initUserModel(app) {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
  const AutoIncrement = AutoIncrementFactory(mongoose)

  const UserSchema = new Schema(
    {
      username: { type: String, unique: true, required: true },
      password: { type: String },
      nickName: { type: String },
      picture: { type: String },
      email: { type: String },
      phoneNumber: { type: String },
      type: { type: String, default: 'email' }
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
  return mongoose.model('User', UserSchema, 'user')
}

module.exports = initUserModel
