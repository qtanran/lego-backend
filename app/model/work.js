const AutoIncrementFactory = require('mongoose-sequence')

module.exports = app => {
  const mongoose = app.mongoose
  const Schema = mongoose.Schema
  const AutoIncrement = AutoIncrementFactory(mongoose)

  const WorkSchema = new Schema(
    {
      uuid: { type: String, unique: true },
      title: { type: String, required: true },
      desc: { type: String },
      coverImg: { type: String },
      content: { type: Object },
      isTemplate: { type: Boolean },
      isPublic: { type: Boolean },
      isHot: { type: Boolean },
      author: { type: String, required: true },
      copiedCount: { type: Number, default: 0 },
      status: { type: Number, default: 1 },
      user: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
  )
  WorkSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'works_id_counter' })
  return mongoose.model('Work', WorkSchema)
}
