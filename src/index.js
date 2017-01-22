import http from 'http'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import initializeDb from './db'
import api from './api'
import config from './config.json'

let app = express();

const parser = (req, res, next) => {
  let buffers = []
  req.on("data", (chunk) => {
    buffers.push(chunk);
  });
  req.on("end", () => {
    req.rawBody = Buffer.concat(buffers);
    next();
  });
}

app.server = http.createServer(app)

app.use(parser)

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
