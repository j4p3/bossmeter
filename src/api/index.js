import { version } from '../../package.json'
import { Router } from 'express'

export default ({ config, db }) => {
	let api = Router()
  const response = {
      "score": 0.50
  }

	api.get('/', (req, res) => {
		res.json({ version })
	})

  api.post('/message', (req, res) => {
    console.log(req)
    res.json(response)
  })

  api.get('/:space/:user', (req, res) => {
    if (req.params && req.params.space == 'usa') {
      // special case for Donald demo
    } else if (req.params && req.params.space && req.params.user) {
      res.json(Object.assign(response, {
        name: req.params.user,
        space: req.params.space
      }))
    } else {
      res.json(response)
    }
  })

	return api
}
