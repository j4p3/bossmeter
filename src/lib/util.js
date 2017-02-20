
import WatsonWorkspace from './wwsService'
import Message from '../models/moment'

/**  Creates a callback that proxies node callback style arguments to an Express Response object.
 *  @param {express.Response} res  Express HTTP Response
 *  @param {number} [status=200]  Status code to send on success
 *
 *  @example
 *    list(req, res) {
 *      collection.find({}, toRes(res))
 *    }
 */
export function toRes(res, status=200) {
  return (err, thing) => {
    if (err) return res.status(500).send(err)

    if (thing && typeof thing.toObject==='function') {
      thing = thing.toObject()
    }
    res.status(status).json(thing)
  }
}

export function toJSON(req) {
  try {
    return JSON.parse(req.rawBody.toString())
  } catch (e) {
    return {}
  }
}

export function ingest(spaceId) {
  let wws = new WatsonWorkspace()
  wws.authenticate()
  getMessages(wws, spaceId, null)
}

function getMessages(client, workspace, cursor) {
  console.log('getting messages')
  let options = null
  if (cursor) {
    options = {
      after: cursor
    }
  }
  client.getMessages(workspace, options).then(msgs => {
    createMessages(msgs.items)
    if (msgs.pageInfo && msgs.pageInfo.hasNextPage) {
      getMessages(client, workspace, msgs.pageInfo.endCursor)
    }
  })
}

function createMessages(messages) {
  for (msg in messages) {
    Message.create(messages[msg], e => {
      console.log(e)
    })
  }
}
