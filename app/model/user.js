function initUserModel(app) {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema

  const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    nickName: { type: String },
    picture: { type: String },
    email: { type: String },
    phoneNumber: { type: String }
  }, { timestamps: true })
  return app.mongoose.model('User', UserSchema)
}

module.export = initUserModel
