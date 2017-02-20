import mongoose from 'mongoose'

mongoose.promise = global.Promise
const spaceSchema = new mongoose.Schema({
  wwsId: { type: String }
})

module.exports = mongoose.model('Space', spaceSchema)
