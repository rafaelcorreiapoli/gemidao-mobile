import React from 'react';
import { StyleSheet, Text, View, Alert, AsyncStorage, ActivityIndicator, Image, FlatList, TouchableNativeFeedback, Picker, TextInput, Platform, TouchableOpacity} from 'react-native';
import Button from '../Button'

const FACEBOOK_APP_ID = '123254084969737'

import api from '../../api'

const FlatButton = (Platform.OS === 'ios') ? TouchableOpacity : TouchableNativeFeedback

const getFirstNumber = contact => contact.numbers && contact.numbers[0] && (contact.numbers[0].digits || contact.numbers[0].number) || ''
export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.handleBuyGemidao = this.handleBuyGemidao.bind(this)
    this.handleMakeGemidaoCall = this.handleMakeGemidaoCall.bind(this)
    this.authenticate = this.authenticate.bind(this)
    this.getFacebookToken = this.getFacebookToken.bind(this)
    this.validateToken = this.validateToken.bind(this)
    this.storeJWTToken = this.storeJWTToken.bind(this)
    this.getLocalJWTToken = this.getLocalJWTToken.bind(this)
    this.handleFacebookButtonPress = this.handleFacebookButtonPress.bind(this)
    this.handleTextChange = this.handleTextChange.bind(this)
    this.handleLogout = this.handleLogout.bind(this)

    this.state = {
      loggedIn: false,
      name: '',
      picture: '',
      gemidoesLeft: 0,
      contacts: [],
      loading: true,
      loadingBuy: false,
      loadingGemidaoCall: false
    }
  }

  handleTextChange(kind, text) {
    this.setState({
      [kind]: text
    })
  }

  handleError(caller, err) {
    console.log(err)
    Alert.alert(`Erro em ${caller}`, err.toString())
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
        ]
      });

      if (contacts.total > 0) {
        const contactsArray = Object.keys(contacts.data).reduce((acc, id) => [...acc, contacts.data[id]], [])

        this.setState({
          contacts: contactsArray.map(contact => ({
            id: contact.id,
            name: contact.name,
            numbers: contact.phoneNumbers && contact.phoneNumbers.map(number => ({
              digits: (number.digits || number.number),
              label: number.label
            }))
          }))
        })
      }
    }
    catch (err) {
      this.handleError('fetchContacts', err)
    }

  }
  async handleBuyGemidao() {
    this.setState({
      loadingBuy: true
    })
    const quantity = 1
    api.buyGemidao(quantity)
    .then((data) => {
      Alert.alert('Sucesso', `${quantity} gemidões comprados, divirta-se!`)
      this.setState({
        gemidoesLeft: this.state.gemidoesLeft + quantity
      })
    })
    .catch((err) => {
      this.handleError(err)
    })
    .finally(() => {
      this.setState({
        loadingBuy: false
      })
    })
  }

  async handleMakeGemidaoCall() {
    this.setState({
      loadingGemidaoCall: true
    })
    const {
      from,
      to
    } = this.state
    api.makeGemidaoCall(from, to)
    .then(data => {
      Alert.alert('Sucesso', 'Seu gemidão foi enviado!')
      this.setState({
        loadingGemidaoCall: false,
        gemidoesLeft: this.state.gemidoesLeft - 1,
        from: '',
        to: '',
      })
    })
    .catch(err => {
      this.handleError('handleMakeGemidaoCall', err)
      this.setState({
        loadingGemidaoCall: false
      })
    })
  }

  async authenticate(facebookToken) {


    await AsyncStorage.setItem('@MySuperStore:key', 'I like to save it.');
  }

  async getFacebookToken() {
    const { type, token } = await Expo.Facebook.logInWithReadPermissionsAsync(FACEBOOK_APP_ID, {
        permissions: ['public_profile'],
      });
    if (type === 'success') {
      return token
    }
    return false
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
    const token = await this.getFacebookToken()
    if (token) {
      try {
        const response = await api.loginWithFacebook(token)
        if(response.error) {
          throw new Error(error)
        }


        await this.storeJWTToken(response.token)
        api.setToken(response.token)
        this.setLoggedIn(response.user)
      }
      catch (err) {
        this.handleError('handleFacebookButtonPress', err)
      }

    }
  }

  setLoggedIn(user) {
    this.setState({
      loading: false,
      loggedIn: true,
      picture: user.picture,
      name: user.name,
      gemidoesLeft: user.gemidoesLeft
    })
  }

  async componentDidMount() {
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
        this.setLoggedIn(user)
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
  handlePressContact(kind, contact) {
    const firstNumber = getFirstNumber(contact)

    const strippedFirstNumber = firstNumber && firstNumber.replace(/-|\(|\)| /g,'').trim()

    this.setState({
      [kind]: strippedFirstNumber
    })
  }
  renderContact(kind, contact) {
    return (
      <FlatButton  onPress={() => this.handlePressContact(kind, contact)}>
        <View style={contactStyles.container}>
          <Text style={contactStyles.name}>{contact.name}</Text>
          <Text style={contactStyles.number}>{getFirstNumber(contact)}</Text>
        </View>
      </FlatButton>
    )
  }

  getHint() {
    const {
      from,
      to,
      gemidoesLeft
    } = this.state

    if (!gemidoesLeft) {
      return 'Compre mais gemidões para continuar enviado'
    }
    if (!from || !to) {
      return 'Escolha da lista ou digite os números'
    }

    return 'Pronto para enviar Gemidão!'

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
    } = this.state

    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator />
        </View>
      )
    }

    if (!loggedIn) {
      return (
        <View style={styles.container}>
          <Text style={styles.mainTitle}>Chamada Gemidão do Zap!</Text>
          <Text style={styles.mainText}>Escolha duas pessoas da lista de sua lista de contato. O aplicativo fará uma chamada a partir de um número escolhido (utilizando máscara de bina) e, quando a vítima atender...</Text>
          <Text style={styles.mainText}>AAAWN OOOWN NHAAA AWWWWN AAAAAH</Text>
          <Button title="Entrar com Facebook" color="#3b5998" onPress={this.handleFacebookButtonPress.bind(this)}/>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Image source={{uri: picture}} resizeMode="contain" style={styles.avatar} />
          <View style={styles.column}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.row}>
              <Text style={styles.gemidoesRestantesLabel}>Gemidões restantes: </Text><Text style={styles.gemidoesRestantes}>{gemidoesLeft}</Text>
            </View>
          </View>
          <Button title="Sair" color="tomato" onPress={this.handleLogout} style={{width: 50}} />
        </View>
        <View style={[styles.row]}>
          <View style={[styles.column, {marginRight: 5}]}>
            <Text style={styles.title}>De: </Text>
            <TextInput underlineColorAndroid="transparent" value={from} style={styles.textInput} keyboardType="number-pad" onChangeText={(text) => this.handleTextChange('from', text)} />
            <FlatList
              data={contacts}
              keyExtractor={item => item.id}
              renderItem={({item}) => this.renderContact('from', item)}
            />
          </View>
          <View style={[styles.column, {marginLeft: 5}]}>
            <Text style={styles.title}>Vítima: </Text>
            <TextInput underlineColorAndroid="transparent" value={to} style={styles.textInput} keyboardType="number-pad"  onChangeText={(text) => this.handleTextChange('to', text)}  />
            <FlatList
              data={contacts}
              keyExtractor={item => item.id}
              renderItem={({item}) => this.renderContact('to', item)}
            />
          </View>
        </View>
        <Text style={styles.hint}>{this.getHint()}</Text>

        <View style={{flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch'}}>
          <Button title="Enviar gemidão!"
            color="green"
            onPress={this.handleMakeGemidaoCall}
            disabled={!gemidoesLeft || !from || !to || loadingGemidaoCall}
            loading={loadingGemidaoCall}
            style={{flex: 1, marginRight: 5}}/>
          <Button
            title="Comprar mais gemidões"
            color="steelblue"
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
    backgroundColor: '#e3e3e3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    margin: 10,
    // backgroundColor: 'red',
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
    // flex: 1
  },
  hint: {
    fontSize: 16,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  mainTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  mainText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20
  },
  name: {
    fontSize: 16,
    marginBottom: 8,
  },
  gemidoesRestantesLabel: {
    fontSize: 16,
    color: '#999'
  },
  gemidoesRestantes: {
    fontSize: 16,
    fontWeight: '900'
  },
  title: {
    marginBottom: 4,
    textAlign: 'left',
    fontSize: 12,
    color: '#999'
  },
  column: {
    flex: 1,
    flexDirection: 'column',
    // paddingHorizontal: 10,
  },
  textInput: {
    paddingHorizontal: 6,
    backgroundColor: '#fff',
    height: 40,
    // flex: 1,
    // backgroundColor: 'red'
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 6,
    // marginHorizontal: 6
  },
  avatar: {
    // borderRadius: 25,
    width: 50,
    height: 50,
    marginRight: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row'
  }
});

const contactStyles = StyleSheet.create({
  contactsList: {
    // marginHorizontal: 10
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    height: 50,
    justifyContent: 'center'
  },
  number: {
    color: '#999',
    fontSize: 12
  },
  name: {
    marginBottom: 4,
  },
  digits: {

  }
})
