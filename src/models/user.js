import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  wwsId: { type: String },
  space: mongoose.Schema.ObjectId
})

module.exports = mongoose.model('User', userSchema)
