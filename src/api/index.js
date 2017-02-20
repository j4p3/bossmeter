/*============================================================================
=            API: endpoints for handling data & api requests            =
============================================================================*/

import { Router } from 'express'
const crypto = require('crypto')

import { version } from '../../package.json'
import { ingest } from '../lib/util'
import WatsonWorkspace from '../lib/wwsService'
import User from '../models/user'
import Space from '../models/space'
import ScoreRecord from '../models/scoreRecord'
import Message from '../models/moment'

const secret = process.env.WEBHOOK_SECRET

export default ({ config, db }) => {
  let api = Router()
  const response = {
    status: 'complete',
    score: 0.55,
    tone: {
      tone_categories: [
        {
          "tones": [
            {
              "score": 0.399803,
              "tone_id": "anger",
              "tone_name": "Anger"
            },
            {
              "score": 0.051903,
              "tone_id": "disgust",
              "tone_name": "Disgust"
            },
            {
              "score": 0.002805,
              "tone_id": "fear",
              "tone_name": "Fear"
            },
            {
              "score": 0.648717,
              "tone_id": "joy",
              "tone_name": "Joy"
            },
            {
              "score": 0.003089,
              "tone_id": "sadness",
              "tone_name": "Sadness"
            }
          ],
          "category_id": "emotion_tone",
          "category_name": "Emotion Tone"
        },
        {
          "tones": [
            {
              "score": 0,
              "tone_id": "analytical",
              "tone_name": "Analytical"
            },
            {
              "score": 0,
              "tone_id": "confident",
              "tone_name": "Confident"
            },
            {
              "score": 0,
              "tone_id": "tentative",
              "tone_name": "Tentative"
            }
          ],
          "category_id": "language_tone",
          "category_name": "Language Tone"
        },
        {
          "tones": [
            {
              "score": 0.253302,
              "tone_id": "openness_big5",
              "tone_name": "Openness"
            },
            {
              "score": 0.274438,
              "tone_id": "conscientiousness_big5",
              "tone_name": "Conscientiousness"
            },
            {
              "score": 0.543856,
              "tone_id": "extraversion_big5",
              "tone_name": "Extraversion"
            },
            {
              "score": 0.599486,
              "tone_id": "agreeableness_big5",
              "tone_name": "Agreeableness"
            },
            {
              "score": 0.301259,
              "tone_id": "emotional_range_big5",
              "tone_name": "Emotional Range"
            }
          ],
          "category_id": "social_tone",
          "category_name": "Social Tone"
        }
      ]
    }
  }

  /*----------  Root  ----------*/
  api.get('/', (req, res) => {
    res.json({ version })
  })

  /*----------  Utility ingestion endpoint  ----------*/
  api.get('/ingest', (req, res) => {
    if (req.query & req.query.space) {
      // @todo: ingest all messages from this space
    } else {
      res.send(400)
    }
  })

  /*----------  User oauth callback  ----------*/
  api.get('/callback', (req, res) => {
    if (req.query && req.query.code) {
      console.log('callback initialized')
      let wws = new WatsonWorkspace()
      console.log('wws initialized')
      wws.authenticateFromCode(req.query.code).then(client => {  
        console.log('wws authenticated')
        // save user
        User.findOneAndUpdate({
          wwsId: wws.config.uid
        }, {
          $set: {
            wwsId: wws.config.uid,
            name: wws.config.displayName,
          }
        }, {
          new: true,
          upsert: true,
        }, (err, doc) => {
          if (err) {
            console.log(err)
            res.send(500)
          }
          console.log('user created or found')
          res.redirect(process.env.FRONTEND_URI + '?uid=' + doc.wwsId)
        })
      })
    } else {
      res.send(400)
    }
  })

  /*----------  Inbound new message handler  ----------*/
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

  /*----------  User information request  ----------*/
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
          res.json(Object.assign(response, {
            status: 'complete',
            space: req.params.space,
            user: req.params.user
          }))
        }
      })
    } else {
      res.send(500)
    }
  })

  return api
}
