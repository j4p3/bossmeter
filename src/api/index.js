import { version } from '../../package.json'
import { toJSON, ingest } from '../lib/util'
import { Router } from 'express'

import User from '../models/user'
import Space from '../models/space'
import ScoreRecord from '../models/scoreRecord'
import Message from '../models/moment'

import WatsonWorkspace from '../lib/wwsService'

const crypto = require('crypto')
const secret = process.env.WEBHOOK_SECRET

export default ({ config, db }) => {
  let api = Router()
  const response = {
    status: 'complete',
    score: 0.50
  }

  api.get('/', (req, res) => {
    res.json({ version })
  })

  api.post('/message', (req, res) => {
    // Inbound message annotation
    console.log('inbound message')
    console.log(req.body)

    if (req.body.type && req.body.type == 'verification') {
      const body = {
        response: req.body.challenge
      }
      const hash = crypto.createHmac('sha256', secret)
        .update(JSON.stringify(body))
        .digest('hex')
      res.set('X-OUTBOUND-TOKEN', hash)
      res.json(body)

    } else if (req.body.type && req.body.type == 'new_message_annotation') {
      console.log('inbound message annotation')
      if (req.body.annotationType == 'conversation-moment') {
        console.log('')
        try {
          let m = new Message(req.body)
          console.log(m)
          m.save((e, saved) => {
            if (e) {
              console.log(e)
            }
            res.send(200)
          })
        } catch (e) {
          console.log(e)
        }
      }
    } else {
      res.send(200)
    }
  })

  api.get('/:space/:user', (req, res) => {
    if (req.params && req.params.space == 'usa') {
      // @todo: get Donald ratings
    }

    if (req.params && req.params.space && req.params.user) {
      // check if exists
      console.log('checking if space has been pulled')
      let queries = []
      queries.push(Space.findOne({ wwsId: req.params.space }))
      queries.push(User.findOne({ wwsId: req.params.user }))
      console.log('running queries')
      Promise.all(queries).then(results => {
        console.log('queries run')
        console.log(JSON.stringify(results))
        let space = results[0]
        let user = results[1]
        console.log(space)
        console.log(user)
        if (space && user) {
          // @todo: if yes, return
          console.log('found space & user')
          ScoreRecord.findOne({
            user: mongoose.Types.ObjectId(user._id)
          }).then(record => {
            res.json(Object.assign(response, {
              score: record.score,
              name: req.params.user,
              space: req.params.space
            }))
          })
        } else {
          console.log('no space found, querying wws')
          ingest(req.params.space)
          res.json({
            status: 'complete',
            space: req.params.space,
            user: req.params.user,
            score: Math.round(Math.random() * 100) / 100
          })
        }
      })
    } else {
      res.send(500)
    }
  })

  return api
}
