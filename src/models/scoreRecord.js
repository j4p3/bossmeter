import mongoose from 'mongoose'

mongoose.promise = global.Promise
const userSchema = new mongoose.Schema({
  score: { type: Number },
  user: mongoose.Schema.ObjectId
})

module.exports = mongoose.model('ScoreRecord', userSchema)
