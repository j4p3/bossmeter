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
    status: 'complete',
    score: 0.50
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

  api.get('/:space/:user', (req, res) => {
    if (req.params && req.params.space == 'usa') {
      // @todo: get Donald ratings
    }

    if (req.params && req.params.space && req.params.user) {
      // check if exists
      let queries = []
      queries.push(Space.findOne({ wwsId: req.params.space }))
      queries.push(User.findOne({ wwsId: req.params.user }))
      Promise.all(queries).then(results => {
        let space = results[0]
        let user = result[1]
        if (space && user) {
          // @todo: if yes, return
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
          // @todo: if no, query for people in space
          //                query for actions relating to people(?)
          //                query for sentiment on action text
          //                store results
          // maybe push this off to a worker
          const peopleQuery = {
            "url": `${process.env.WWS_URL}/graphql`,
            "headers": {
              "Content-Type": "application/graphql",
              "x-graphql-view": "PUBLIC"
            },
            "method": "POST",
            "body": ""
          }
          res.json({
            status: 'pending'
          })
        }
      })
    } else {
      res.send(500)
    }
  })

  return api
}
