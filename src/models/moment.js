import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  wwsId: { type: String },
  spaceWwsId: { type: String },
  authorWwsId: { type: String },
  authorName: { type: String },
  content: { type: String },
  created: { type: Date },
  annotations: { type: Array }
})

module.exports = mongoose.model('Message', messageSchema)
