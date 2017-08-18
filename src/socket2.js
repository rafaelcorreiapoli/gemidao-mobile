import io from 'socket.io-client'
if (__DEV__) {
  endpoint = 'http://192.168.1.40:3001'
} else {
  endpoint = 'https://gemidao-api.herokuapp.com'
}

export const socket = io(this.endpoint)

export const authenticate = (jwtToken) => new Promise((resolve, reject) => {
  console.log(socket)
  socket.emit('authenticate', jwtToken, response => {
    if (response.data === 'ok') {
      resolve(response.data)
    } else {
      reject(response.error)
    }
  })
})


export const subscribe = (publication, params, fn) => {
  socket.emit('subscribe', {publication, ...params}, response => {
    fn(response)
  })
}

export const unsubscribe = (publication, params) => {
  socket.emit('unsubscribe', {publication, ...params}, response => {
    console.log(response)
  })
}
