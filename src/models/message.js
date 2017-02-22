import mongoose from 'mongoose'

mongoose.promise = global.Promise
const messageSchema = new mongoose.Schema({
  wwsId: { type: String },
  spaceWwsId: { type: String },
  authorWwsId: { type: String },
  authorName: { type: String },
  createdBy: { type: Object },
  content: { type: String },
  created: { type: Date },
  annotations: { type: Array }
})

module.exports = mongoose.model('Message', messageSchema)
