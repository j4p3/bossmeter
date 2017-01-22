import rp from 'request-promise'

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
};

const GraphQLOptions = {
  "url": `${process.env.WWS_URL}/graphql`,
  "headers": {
    "Content-Type": "application/graphql",
    "x-graphql-view": "PUBLIC",
    "jwt": "${jwt}"
  },
  "method": "POST",
  "body": ""
};

export default class WatsonWorkspace {
  constructor(props) {
    this.props = props;
    this.authenticate();
  }

  authenticate() {
    let _this = this
    rp(authenticationOptions).then((res) => {
      _this.accessToken = JSON.parse(res).access_token
    })
    .catch((e) => {
      console.log('WWS Auth failed')
      console.log(e)
    })
  }

  getPeople(space) {

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