import React from 'react';
import { StatusBar, StyleSheet, Text as RNText, View, Alert, AsyncStorage, ActivityIndicator, Image, FlatList, TouchableNativeFeedback, Picker, TextInput, Platform, TouchableOpacity, Share} from 'react-native';
import Button from '../Button'
import ContactsList from '../ContactsList'
import Profile from '../Profile'
import Intro from '../Intro'
import Purchase from '../Purchase'
import socket, { WAITING } from '../../socket'
import CallStatus from '../CallStatus'
const FACEBOOK_APP_ID = '123254084969737'


import api from '../../api'

const Text = ({style, ...props}) => <RNText {...props} style={[{color: '#FFF'}, style]} />


const getFirstNumber = numbers => numbers && numbers[0] && (numbers[0].digits || numbers[0].number) || ''
const stripNumber = number => number && number.replace(/\+55|-|\(|\)| /g,'').trim()
export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.handleBuyGemidao = this.handleBuyGemidao.bind(this)
    this.handleMakeGemidaoCall = this.handleMakeGemidaoCall.bind(this)
    this.getFacebookToken = this.getFacebookToken.bind(this)
    this.validateToken = this.validateToken.bind(this)
    this.storeJWTToken = this.storeJWTToken.bind(this)
    this.getLocalJWTToken = this.getLocalJWTToken.bind(this)
    this.handleFacebookButtonPress = this.handleFacebookButtonPress.bind(this)
    this.handleTextChange = this.handleTextChange.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handlePressContactFrom = this.handlePressContactFrom.bind(this)
    this.handlePressContactTo = this.handlePressContactTo.bind(this)
    this.handleError = this.handleError.bind(this)
    this.handleChangeFilter = this.handleChangeFilter.bind(this)
    this.handleClickCallStatusBack = this.handleClickCallStatusBack.bind(this)
    this.handleCallStatusUpdate = this.handleCallStatusUpdate.bind(this)
    this.state = {
      loggedIn: false,
      name: '',
      picture: '',
      gemidoesLeft: 0,
      contacts: [],
      loading: true,
      loadingBuy: false,
      loadingGemidaoCall: false,
      showBuy: false,
      filterText: '',
      showCallStatus: false,
      victimName: ''
    }
  }

  handleCallStatusUpdate(status) {
    this.setState({
      callStatus: status
    })
  }

  handleClickCallStatusBack() {
    this.setState({
      showCallStatus: false
    })
  }
  handleTextChange(kind, text) {
    let setVictimName = {}

    this.setState({
      [kind]: text
    })
  }

  handleError(caller, err) {
    console.log(err)
    Alert.alert('Erro', `${err.toString()}`)
  }

  async fetchContacts() {
    const permission = await Expo.Permissions.askAsync(Expo.Permissions.CONTACTS);
    if (permission.status !== 'granted') {
      Alert.alert('Permissão não obtida para listar contatos')
      return;
    }

    const {
      PHONE_NUMBERS,
      EMAILS,
      IMAGE,
      THUMBNAIL,
      NAME_PREFIX
    } = Expo.Contacts


    try {
      const contacts = await Expo.Contacts.getContactsAsync({
        fields: [
          PHONE_NUMBERS,
          EMAILS,
          NAME_PREFIX
        ],
        pageSize: 200
      });
      if (contacts.total > 0) {
        const seenIds = {}
        const contactsArray = Object.keys(contacts.data).reduce((acc, index) => {
          const contact = contacts.data[index]
          const id = contact.id

          if (seenIds[id]) {
            return acc
          }
          seenIds[id] = true
          return [...acc, contacts.data[index]]
        }, [])
        .map(contact => {
          const numbers = contact.phoneNumbers && contact.phoneNumbers.map(number => ({
            digits: (number.digits || number.number),
            label: number.label
          }))
          return {
            id: contact.id,
            name: contact.name,
            numbers: numbers,
            firstNumber: stripNumber(getFirstNumber(numbers))
          }
        })
        const sortedArray = [...contactsArray].sort((a, b) => {
          if(a.name < b.name) return -1;
          if(a.name > b.name) return 1;
          return 0;
        })

        this.setState({
          contacts: sortedArray
        })
      }
    }
    catch (err) {
      this.handleError('fetchContacts', err)
    }

  }

  handleBuyGemidao() {
    this.setState({
      showBuy: true
    })
    // const startBuyProcess = () => {
    //   Share.share({
    //     message: 'Envie chamadas com o gemidão do zap a partir de outros números! https://play.google.com/store/apps/details?id=com.rafaelribeirocorreia.gemidaodozap&hl=pt',
    //     title: 'Gemidão do Zap',
    //     url: 'https://play.google.com/store/apps/details?id=com.rafaelribeirocorreia.gemidaodozap&hl=pt'
    //   }, {
    //     dialogTitle: 'Gemidão do Zap',
    //   })
    //   .then((action, activityType) => {
    //     if (action.action === Share.sharedAction) {
    //       this.setState({
    //         loadingBuy: true
    //       })
    //       const quantity = 1
    //       api.buyGemidao(quantity)
    //       .then((data) => {
    //         const text = quantity > 1 ? `${quantity} gemidões adquiridos` : `${quantity} gemidão adquirido`
    //         Alert.alert('Sucesso', text)
    //         this.setState({
    //           gemidoesLeft: this.state.gemidoesLeft + quantity
    //         })
    //       })
    //       .catch((err) => {
    //         this.handleError(err)
    //       })
    //       .finally(() => {
    //         this.setState({
    //           loadingBuy: false
    //         })
    //       })
    //     } else {
    //       Alert.alert('Erro', 'Tente novamente!')
    //     }
    //   })
    //   .catch(err => {
    //     this.handleError('Erro', err)
    //   })
    // }
    //
    //
    // Alert.alert(
    //   'Adquirir gemidões',
    //   'Compartilhe nas redes sociais para ganhar mais gemidões!',
    //   [
    //     {text: 'Ok!', onPress: () => startBuyProcess()},
    //     {text: 'Cancel', style: 'cancel'},
    //   ],
    //   { cancelable: true }
    // )
  }

  async handleMakeGemidaoCall() {
    this.setState({
      loadingGemidaoCall: true
    })
    const {
      from,
      to
    } = this.state

    try {
      const response = await api.makeGemidaoCall(from, to)
      if (response.error) {
        throw new Error(response.error)
      }


      // Alert.alert('Sucesso', 'Seu gemidão foi enviado!')
      const victim = this.state.contacts.find(contact => contact.firstNumber === to)

      this.setState({
        loadingGemidaoCall: false,
        gemidoesLeft: this.state.gemidoesLeft - 1,
        from: '',
        to: '',
        victimName: victim  ? victim.name : to,
        showCallStatus: true,
        callStatus: WAITING,
      })
    } catch (err) {
      this.handleError('Fazer gemidão', err)
    }
    finally {
      this.setState({
        loadingGemidaoCall: false
      })
    }
  }

  getFacebookToken() {
    // const { type, token } =

    return Expo.Facebook.logInWithReadPermissionsAsync(FACEBOOK_APP_ID, {
      permissions: ['public_profile'],
    });
  }
  async validateToken() {

  }

  async storeJWTToken(token) {
    try {
      await AsyncStorage.setItem('jwtToken', token);
    } catch (error) {
      this.handleError('storeJWTToken', error)
    }
  }

  async clearLocalJWTToken() {
    await AsyncStorage.removeItem('jwtToken')
  }
  async getLocalJWTToken() {
    try {
      const value = await AsyncStorage.getItem('jwtToken');
      return value
    } catch (error) {
      this.handleError('getLocalJWTToken', error)
    }
  }

  async handleFacebookButtonPress() {
    this.setState({
      loading: true,
    })

    try {
      const {type, token} = await this.getFacebookToken()
      if (type === 'success') {
        const response = await api.loginWithFacebook(token)
        if (response.error) {
          throw new Error(error)
        }
        await this.storeJWTToken(response.token)
        api.setToken(response.token)
        this.setLoggedIn(response.user, response.token)
      } else {
        Alert.alert('Erro', 'Não conseguiu obter credenciais do facebook.')
      }
    }
    catch (err) {
      this.handleError('handleFacebookButtonPress', err)
    }
    finally {
      this.setState({
        loading: false,
      })
    }
  }

  handleCreditsLeft(creditsLeft) {
    this.setState({
      creditsLeft
    })
  }

  handleGemidoesLeft(gemidoesLeft) {
    this.setState({
      gemidoesLeft
    })
  }

  setLoggedIn(user, token) {
    socket.setToken(token)
    socket.setCreditsLeftListener(this.handleCreditsLeft.bind(this))
    socket.setGemidoesLeftListener(this.handleGemidoesLeft.bind(this))
    socket.setCallStatusListener(this.handleCallStatusUpdate.bind(this))
    socket.connect()


    if (!user.gemidoesLeft) {
      Alert.alert('Sem Gemidões?', 'Estamos com promoções especiais para Gemidões! Clique em "+ Gemidões" para conferir')
    }
    this.setState({
      loading: false,
      loggedIn: true,
      picture: user.picture,
      name: user.name,
      gemidoesLeft: user.gemidoesLeft
    })
  }

  async componentDidMount() {
    // Alert.alert("Atenção!", 'Ainda estamos tendo problemas com a operadora de telefonia. Você não conseguirá disparar gemidões mesmo tendo saldo em nosso sistema.')

    StatusBar.setBarStyle('light-content')
    this.fetchContacts()
    const storedToken = await this.getLocalJWTToken()
    if (storedToken) {
      api.setToken(storedToken)

      try {
        const me = await api.me()
        if (me.error) {
          Alert.alert('Removendo token do localstorage', err.toString())
          api.clearToken()
          await this.clearLocalJWTToken();
        }
        const user = me.user
        this.setLoggedIn(user, storedToken)
      }
      catch (err) {
        this.handleError('componentDidMount', err)
      }
    } else {
      this.setState({
        loading: false,
      })
    }
  }

  async handleLogout() {
    api.clearToken()
    socket.clearToken()
    socket.disconnect()
    try {
      await this.clearLocalJWTToken()
      this.setState({
        loggedIn: false,
        name: '',
        picture: '',
        gemidoesLeft: 0,
      })
    }
    catch (err) {
      this.handleError('handleLogout', err)
    }
  }


  handlePressContactFrom(number) {
    const strippedNumber = stripNumber(number)
    this.setState({
      from: strippedNumber
    })
  }
  handlePressContactTo(number){
    const strippedNumber = stripNumber(number)
    this.setState({
      to: strippedNumber,
    })
  }

  getHint() {
    const {
      from,
      to,
      gemidoesLeft
    } = this.state

    if (!gemidoesLeft) {
      return 'Compre mais gemidões para continuar'
    }
    if (!from || !to) {
      return 'Escolha da lista ou digite os números'
    }

    return 'Pronto para enviar Gemidão!'

  }

  handleChangeFilter(filter) {
    this.setState({
      filter
    })
  }

  render() {
    const {
      name,
      loggedIn,
      picture,
      contacts,
      loading,
      gemidoesLeft,
      from,
      to,
      loadingBuy,
      loadingGemidaoCall,
      showCallStatus
    } = this.state

    if (showCallStatus) {
      return (
        <View style={{flex: 1, paddingTop: 30, backgroundColor: '#27ae60'}}>
          <CallStatus
            onClickBack={this.handleClickCallStatusBack}
            victimName={this.state.victimName}
            status={this.state.callStatus}
          />
        </View>
      )
    }
    if (this.state.showBuy) {
      return (
        <View style={{flex: 1, paddingTop: 30, backgroundColor: '#27ae60'}}>
        <Purchase />
        <Button color="#f1c40f" title="Voltar" onPress={() => this.setState({showBuy: false})} style={{ margin: 10}}/>
        </View>
      )
    }

    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator color="#FFF"/>
        </View>
      )
    }

    if (!loggedIn) {
      return (
        <View style={{flex: 1, paddingTop: 30, backgroundColor: '#27ae60'}}>
        <Intro
          onFacebookPress={this.handleFacebookButtonPress}
        />
        </View>
      )
    }

    const filteredContacts = contacts.filter(contact =>
      new RegExp(this.state.filter, 'gi').test(contact.name) ||
      new RegExp(this.state.filter, 'gi').test(contact.firstNumber))

    return (
      <View style={styles.container}>
        <Profile
          onPressLogout={this.handleLogout}
          name={name}
          gemidoesLeft={gemidoesLeft}
          picture={picture}
        />
        <TextInput
          value={this.state.filter}
          style={[styles.textInput, styles.filterInput]}
          placeholder="Buscar"
          underlineColorAndroid="transparent"
          onChangeText={this.handleChangeFilter}
        />
        <View style={[styles.row]}>
          <View style={[styles.column, {marginRight: 5}]}>
            <Text style={styles.title}>De: </Text>
            <TextInput
              underlineColorAndroid="transparent"
              value={from}
              style={styles.textInput}
              keyboardType="numeric"
              placeholder="DDD + Número"
              onChangeText={(text) => this.handleTextChange('from', text)} />
            <ContactsList
              contacts={filteredContacts}
              onClickContact={this.handlePressContactFrom}
            />
          </View>
          <View style={[styles.column, {marginLeft: 5}]}>
            <Text style={styles.title}>Vítima: </Text>
            <TextInput
              underlineColorAndroid="transparent"
              value={to}
              style={styles.textInput}
              keyboardType="numeric"
              placeholder="DDD + Número"
              onChangeText={(text) => this.handleTextChange('to', text)}  />
            <ContactsList
              contacts={filteredContacts}
              onClickContact={this.handlePressContactTo}
            />
          </View>
        </View>
        <Text style={styles.hint}>{this.getHint()}</Text>

        <View style={{flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch'}}>
          <Button title="Enviar gemidão!"
            color="#1abc9c"
            onPress={this.handleMakeGemidaoCall}
            disabled={!gemidoesLeft || !from || !to || loadingGemidaoCall}
            loading={loadingGemidaoCall}
            style={{flex: 1, marginRight: 5}}/>
          <Button
            title="+ Gemidões"
            color="#f1c40f"
            onPress={this.handleBuyGemidao}
            loading={loadingBuy}
            style={{flex: 1, marginLeft: 5}}
            disabled={loadingBuy}/>
        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    flex: 1,
    backgroundColor: '#27ae60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterInput: {
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  profileContainer: {
    margin: 10,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  hint: {
    fontSize: 12,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  title: {
    marginBottom: 4,
    textAlign: 'left',
    fontSize: 12,
    color: '#FFF'
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  textInput: {
    paddingHorizontal: 6,
    backgroundColor: '#fff',
    height: 40,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 6,
  },
  row: {
    flex: 1,
    flexDirection: 'row'
  }
});
