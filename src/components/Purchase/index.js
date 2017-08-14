import React from 'react'
import {View, StyleSheet, WebView, Image, Text, FlatList, Alert, TouchableOpacity, ActivityIndicator, Linking} from 'react-native'
import api from '../../api'


const logo = require('../../assets/logo.png')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2ecc71'
  }
})

const itemStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600'
  },
  amount: {
    color: '#FFF',
    fontSize: 12
  },
  buyButton: {

  },
  itemImage: {
    width: 40,
    height: 40,
    marginHorizontal: 10
  },
  buyButton: {
    width: 150,
    height: 50,
    paddingTop: 10,
    marginRight: 10,
    justifyContent: 'flex-end'
  }
})

function formatReal(n) {
return "R$ " + n.toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
}


const ItemListItem = ({
  id,
  description,
  amount,
  onPressBuy
}) => (
  <View style={itemStyles.container}>
    <Image source={logo} resizeMode="contain" style={itemStyles.itemImage}/>
    <View style={{flex: 1}}>
      <Text style={itemStyles.description}>
        {description}
      </Text>
      <Text style={itemStyles.amount}>
        {formatReal(amount)}
      </Text>
    </View>

    <TouchableOpacity onPress={() => onPressBuy(id)}>
      <Image
        source={{uri: 'http://static.wixstatic.com/media/5d4948_eba8dfa08a9a425a80db19c218c75dbc~mv2.png_srz_862_170_85_22_0.50_1.20_0.00_png_srz'}}
        resizeMode="contain"
        style={itemStyles.buyButton}
      />
    </TouchableOpacity>
  </View>
)
export default class Purchase extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      items: [],
      checkoutUrl: null,
      loading: true,
    }

    this.handlePressBuy = this.handlePressBuy.bind(this)
  }
  handleError(caller, err) {
    console.log(err)
    Alert.alert(`Erro em ${caller}`, err.toString())
  }

  async componentDidMount() {
    // Alert.alert("Atenção!", 'Ainda estamos tendo problemas com a operadora de telefonia. Não compre créditos ainda.')

    try {
      const response = await api.getItems()
      this.setState({
        items: response.items,
      })
    }
    catch(err) {
      this.handleError('componentDidMount', err)
    }
    finally {
      this.setState({
        loading: false
      })
    }


  }

  async handlePressBuy(itemId) {
    console.log(itemId)

    try {
      this.setState({
        loading: true
      })
      const response = await api.getCheckoutUrl(itemId)

      if (response.error) {
        throw new Error(response.error)
      }

      if (response.url) {
        Linking.openURL(response.url)
      } else {
        throw new Error('Nenhuma URL obtida')
      }
    }
    catch(err) {
      this.handleError('handlePressBuy', err)
    }
    finally {
      this.setState({
        loading: false
      })
    }
  }
  render() {
    const {
      items,
      loading
    } = this.state

    const LoadingOverlay = (
      <View style={{position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <ActivityIndicator />
      </View>
    )
    return (
      <View style={styles.container}>


        {loading
        ? (
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator color="#FFF"/>
            <Text style={{color: '#FFF'}}>Obtendo link para checkout da compra...</Text>
          </View>
        )
        : <FlatList
            ItemSeparatorComponent={() => <View style={{height: 1, opacity: 0.5, marginVertical: 15, backgroundColor: '#ecf0f1'}} />}
            data={this.state.items}
            keyExtractor={(item, index) => `${item.id}`}
            renderItem={({item}) => (
              <ItemListItem
                {...item}
                onPressBuy={this.handlePressBuy}
              />
            )}
          />
      }
      </View>
    )
  }
}
