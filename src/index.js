import http from 'http'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import initializeDb from './db'
import api from './api'
import config from './config.json'

let app = express();

app.server = http.createServer(app)

app.use(function(req, res, next) {
  console.log(`${req.method}\t${req.originalUrl}`)
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json())

// 3rd party middleware
// app.use(cors({
//   exposedHeaders: config.corsHeaders
// }))

// connect to db
initializeDb( db => {

  // api router
  app.use('/api', api({ config, db }))

  app.server.listen(process.env.PORT || config.port)

  console.log(`Started on port ${app.server.address().port}`)
});

export default app
