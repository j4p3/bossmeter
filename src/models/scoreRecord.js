import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  score: { type: Number },
  user: mongoose.Schema.ObjectId
})

module.exports = mongoose.model('ScoreRecord', userSchema)
