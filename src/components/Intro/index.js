import React from 'react'
import {View, Image, Text, StyleSheet} from 'react-native'
import Button from '../Button'
const logo = require('../../assets/logo.png')

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    color: '#FAFAFA'
  },
  mainTitle: {
    color: '#FFF',
    fontSize: 20,
    marginBottom: 20,
  },
  mainText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20
  },
});

export default ({
  onFacebookPress
}) => (
  <View style={styles.container}>
    <Image resizeMode="contain" source={logo} style={{flex: 1, margin: 20}} />
    <Text style={styles.mainTitle}>Gemidão do Zap!</Text>
    <Text style={styles.mainText}>Escolha duas pessoas de sua lista de contatos. O aplicativo então fará uma chamada a partir de um número escolhido (utilizando máscara de bina) e, quando a vítima atender...</Text>
    <Text style={styles.mainText}>AAAWN OOOWN NHAAA AWWWWN AAAAAH</Text>
    <Button
      title="Entrar com Facebook"
      color="#3b5998"
      onPress={onFacebookPress}
      style={{alignSelf: 'stretch', marginBottom: 20}}
    />
    <Text style={styles.bottomText}>Feito por Rafael Ribeiro Correia</Text>
    <Text style={styles.bottomText}>https://rafaelribeirocorreia.com</Text>
  </View>
)
