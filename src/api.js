

let endpoint

if (__DEV__) {
  endpoint = 'http://192.168.1.40:3000'
} else {
  endpoint = 'https://gemidao-api.herokuapp.com'
}



const fetchJson = (endpoint, options = {}) => fetch(endpoint, {
  ...options,
   headers: {
     ...options.headers,
     'Accept': 'application/json',
     'Content-Type': 'application/json',
   },
   body: JSON.stringify(options.body)
}).then(data => {
  console.log(data)
  return data.json()
})


class API {
  token = null
  setToken(token)  {
    this.token = token
  }
  clearToken() {
    this.token = null
  }

  test() {
    return fetchJson('https://balances-service.herokuapp.com/accounts/1/statement')
  }
  request(resource, options ={}) {
    const authHeader = this.token
    ? { 'Authorization': `${this.token}` }
    : null

    const finalOptions = {
      ...options,
      headers: {
        ...options.header,
        ...authHeader,
      }
    }
    return fetchJson(`${endpoint}${resource}`, finalOptions)
  }

  loginWithFacebook(facebookToken) {
    return this.request(`/authenticate?access_token=${facebookToken}`, {
      method: 'POST'
    })
  }

  me() {
    return this.request('/me')
  }

  validateToken() {
    return this.me()
    .catch(err => {
      this.clearToken()
    })
  }

  makeGemidaoCall(from, to) {
    return this.request('/gemidao', {
      method: 'POST',
      body: {
        from,
        to
      }
    })
  }

  buyGemidao(quantity) {
    return this.request('/buy', {
      method: 'POST',
      body: {
        quantity
      }
    })
  }
}

export default new API()
