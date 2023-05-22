function initUserModel(app) {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const UserSchema = new Schema(
    {
      username: { type: String, unique: true, required: true },
      password: { type: String, required: true },
      nickName: { type: String },
      picture: { type: String },
      email: { type: String },
      phoneNumber: { type: String }
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
  return mongoose.model('User', UserSchema, 'user')
}

module.exports = initUserModel
