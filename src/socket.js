import io from 'socket.io-client'
let endpoint
import { Alert } from 'react-native'
if (__DEV__) {
  endpoint = 'http://192.168.1.40:3000'
} else {
  endpoint = 'https://gemidao-api.herokuapp.com'
}

export const WAITING = 'WAITING'
export const RINGING = 'RINGING'
export const TALKING = 'TALKING'
export const FINISHED = 'FINISHED'

class SocketAPI {
  token = null
  constructor(endpoint) {
    this.endpoint = endpoint
  }
  setGemidoesLeftListener(onGemidoesLeft) {
    this.onGemidoesLeft = onGemidoesLeft
  }
  setCreditsLeftListener(onCreditsLeft) {
    this.onCreditsLeft = onCreditsLeft
  }
  setCallStatusListener(callStatusListener) {
    this.callStatusListener = callStatusListener
  }

  setToken(token) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  disconnect() {
    if (this.socket) {
      // Alert.alert('Socket', 'disconnecting')
      this.socket.disconnect()
    }
  }

  connect() {
    const socket = io(`${this.endpoint}?token=${this.token}`)

    socket.on('connect', () => {
      // Alert.alert('connect', 'ok')
      this.socket = socket
    })

    socket.on('error', error => {
      // Alert.alert('error', JSON.stringify(error))
    })

    socket.on('gemidoesLeft', message => {
      // Alert.alert('message', message.toString())
      this.onGemidoesLeft && this.onGemidoesLeft(message)
    })

    socket.on('creditsLeft', message => {
      // Alert.alert('message', message.toString())
      this.onCreditsLeft && this.onCreditsLeft(message)
    })

    socket.on('callStatus', message => {
      this.callStatusListener && this.callStatusListener(message)
    })
  }
}


export default new SocketAPI(endpoint)
