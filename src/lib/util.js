
import WatsonWorkspace from './wwsService'
import Message from '../models/message'

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
  console.log('running ingest utility on ' + spaceId)
  let wws = new WatsonWorkspace()
  return wws.authenticate().then(client => {
    console.log('authenticated client, getting messages')
    return getMessages(client, spaceId, null).then(result => {
      return result
    })
  })
}

function getSentiment(workspace) {
  console.log('getSentiment called')
  let messages = Message.where({ wwsSpaceId: workspace }, (e, docs) => {
    if (e) {
      return false
    }

    console.log('found messages for tone analysis')

    let wws = new WatsonWorkspace()
    for (msg in docs) {
      let tone = wws.getSentiment(docs[msg])
      docs[msg].tone = tone
      console.log('updated msg tone')
      docs[msg].save(e => {
        if (e) {
          console.log(e)
        } else {
          console.log('saved msg tone')
        }
      })
    }
  }) 
}

function getMessages(client, workspace, cursor) {
  console.log('getting messages page')
  let options = null
  if (cursor) {
    options = {
      after: cursor
    }
  }
  return client.getMessages(workspace, options).then(msgs => {
    console.log('got messages')
    msgs.items.map(msg => {
      msg.spaceWwsId = workspace
      msg.authorWwsId = msg.createdBy.id
    })
    createMessages(msgs.items)
    if (msgs.pageInfo && msgs.pageInfo.hasNextPage) {
      console.log('getting next page')
      getMessages(client, workspace, msgs.pageInfo.endCursor)
    } else {
      console.log('finished getting messages')
      getSentiment(workspace)
      return true
    }
  }).catch(e => {
    return false
  })
}

function createMessages(messages) {
  console.log('creating messages')
  Message.create(messages, (e, docs) => {
    if (e) {
      console.log('message creation failed')
    }
    console.log('messages created')
  })
}
