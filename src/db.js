import mongoose from 'mongoose'

export default callback => {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost')
  callback(mongoose)
}
