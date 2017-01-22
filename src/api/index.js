import { version } from '../../package.json'
import { toJSON } from '../lib/util'
import { Router } from 'express'

import User from '../models/user'
import Space from '../models/space'
import ScoreRecord from '../models/scoreRecord'

const crypto = require('crypto')
const secret = process.env.WEBHOOK_SECRET

export default ({ config, db }) => {
  let api = Router()
  const response = {
      "score": 0.50
  }

  api.get('/', (req, res) => {
    res.json({ version })
  })

  api.post('/message', (req, res) => {
    if (req.body.type && req.body.type == 'verification') {
      const body = {
        response: req.body.challenge
      }
      const hash = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('hex')
      res.set('X-OUTBOUND-TOKEN', hash)
      res.json(body)
    } else if (req.body.type) {
      // message. not actually needed since we'll ingest these once.
      console.log(req.body)
      res.send(200)
    } else {
      res.send(500)
    }
  })

  api.post('/space/:spaceId', (req, res) => {
    // @todo: get all people in this space & store.
  })

  api.get('/:space/:user', (req, res) => {
    if (req.params && req.params.space == 'usa') {
      // @todo: get Donald ratings
    } else if (req.params && req.params.space && req.params.user) {
      // @todo: check if exists
      // @todo: if yes, return
      // @todo: if no, query for people in space
      //                query for actions relating to people(?)
      //                query for sentiment on action text
      //                store results
      res.json(Object.assign(response, {
        name: req.params.user,
        space: req.params.space
      }))
    } else {
      res.send(500)
    }
  })

  return api
}
