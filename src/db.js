var mongoose = require('mongoose')

export default callback => {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost')
	callback(mongoose)
}
