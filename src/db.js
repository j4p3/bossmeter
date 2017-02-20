import mongoose from 'mongoose'

export default callback => {
  mongoose.promise = global.Promise
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ibm-hackathon-db')
  callback(mongoose)
}
