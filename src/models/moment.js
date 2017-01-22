import mongoose from 'mongoose'

const momentSchema = new mongoose.Schema({
  wwsId: { type: String },
  spaceWwsId: { type: String },
  subjectWwsId: { type: String },
  content: { type: String }
})

module.exports = mongoose.model('Moment', momentSchema)
