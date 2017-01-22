import mongoose from 'mongoose'

const spaceSchema = new mongoose.Schema({
  wwsId: { type: String }
})

module.exports = mongoose.model('Space', spaceSchema)
