import rp from 'request-promise'
var ToneAnalyzer = require('watson-developer-cloud/tone-analyzer/v3')

const authenticationOptions = {
  "method": "POST",
  "url": `${process.env.WWS_URL}${process.env.AUTHORIZATION_API}`,
  "auth": {
    "user": process.env.APP_ID,
    "pass": process.env.APP_SECRET
  },
  "form": {
    "grant_type": "client_credentials"
  }
}

const tokenAuthCred = new Buffer(
  process.env.APP_ID +
  ':' +
  process.env.APP_SECRET).toString('base64')

const tokenAuthenticationOptions = {
  "method": "POST",
  "headers": {
    "Authorization": `Basic ${tokenAuthCred}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  "url": `${process.env.WWS_URL}${process.env.AUTHORIZATION_API}`,
  "body": ""
}

const GraphQLOptions = {
  "url": `${process.env.WWS_URL}/graphql`,
  "headers": {
    "Content-Type": "application/graphql",
    "x-graphql-view": "PUBLIC",
    "jwt": ""
  },
  "method": "POST",
  "body": ""
}

export default class WatsonWorkspace {
  constructor(props) {
    this.props = props
    this.config = {}
  }

  authenticate() {
    let _this = this
    return rp(authenticationOptions).then((res) => {
      _this.config.accessToken = JSON.parse(res).access_token
      return _this
    }).catch((e) => {
      console.log('WWS Auth failed')
      console.log(e)
    })
  }

  authenticateFromCode(code) {
    let _this = this
    let queryOptions = Object.assign({}, tokenAuthenticationOptions)
    queryOptions.form = {
      "grant_type": "authorization_code",
      "code": code,
      "redirect_uri": process.env.APP_REDIRECT_URI
    }
    return rp(queryOptions).then((res) => {
      console.log('wws auth passed')
      let data = JSON.parse(res)
      _this.config.accessToken = data.access_token
      _this.config.displayName = data.displayName
      _this.config.uid = data.id
      _this.config.refresh_token = data.refresh_token
      return _this
    }).catch((e) => {
      console.log('wws auth failed')
      console.log(e)
    })
  }

  getPeople(space) {

  }

  getMessages(space, options) {
    let messages = []
    let queryOptions = Object.assign({}, GraphQLOptions)
    let query = `{
      space(id: "${space}") {
        conversation {
          messages(first: 200) {
            items {
              content
              annotations
              created
              createdBy {
                displayName
                id
              }
            }
            pageInfo {
              startCursor
              endCursor
              hasNextPage
            }
          }
        }
      }
    }`
    if (options && options.after) {
      let query = `{
        space(id: "${space}") {
          conversation {
            messages(first: 200, after: "${options.after}") {
              items {
                content
                annotations
                created
                createdBy {
                  displayName
                  id
                }
              }
              pageInfo {
                startCursor
                endCursor
                hasNextPage
              }
            }
          }
        }
      }`
    }

    queryOptions.headers.jwt = this.config.accessToken
    queryOptions.body = query

    return rp(queryOptions).then((res) => {
      let data = JSON.parse(res)
      let messages = data.data.space.conversation.messages
      return messages
    }).catch((e) => {
      console.log('WWS getMessage failed')
      console.log(e)
      return false
    })
  }

  getMessageSentiment(message) {
    console.log('getting message tone')
    let toneAnalyzer = new ToneAnalyzer({
      username: process.env.WATSON_SERVICE_ID,
      password: process.env.WATSON_SERVICE_PASSWORD,
      version_date: '2016-05-19'
    });

    return tone_analyzer.tone({ text: message.content }, (err, tone) => {
      if (err) {
        console.log(err)
        return null
      }
      else {
        console.log('good tone')
        console.log(JSON.stringify(tone, null, 2))
        return tone
      }
    })
  }

  getSpace(id) {
    let queryOptions = Object.assign({}, GraphQLOptions)
    let query = `space(id: "${id}") {
      id
      title
      members {
        items {
          id
          displayName
          photoUrl
        }
      }
    }`

    queryOptions.headers.jwt = this.accessToken
    queryOptions.body = query

    return rp(queryOptions).then((res) => {
      return res
    })
    .catch((e) => {
      console.log('WWS getSpace failed')
        console.log(e)
    })
  }
}