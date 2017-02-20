import mongoose from 'mongoose'

mongoose.promise = global.Promise
const userSchema = new mongoose.Schema({
  wwsId: { type: String },
  space: mongoose.Schema.ObjectId,
  name: { type: String }
})

module.exports = mongoose.model('User', userSchema)
