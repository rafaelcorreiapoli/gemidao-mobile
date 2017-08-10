import React from 'react'

import {View, Text, Image, StyleSheet} from 'react-native'
import Button from '../Button'


const styles = StyleSheet.create({
  profileContainer: {
    margin: 10,
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 20,
  },
  name: {
    fontSize: 16,
    marginBottom: 2,
  },
  gemidoesRestantesLabel: {
    fontSize: 14,
    color: '#999'
  },
  gemidoesRestantes: {
    fontSize: 14,
    fontWeight: '900'
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  avatar: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row'
  }
});

export default ({
  name,
  gemidoesLeft,
  picture,
  onPressLogout
}) => (
  <View style={styles.profileContainer}>
    <Image source={{uri: picture}} resizeMode="contain" style={styles.avatar} />
    <View style={styles.column}>
      <Text style={styles.name}>{name}</Text>
      <View style={styles.row}>
        <Text style={styles.gemidoesRestantesLabel}>Gemidões restantes: </Text><Text style={styles.gemidoesRestantes}>{gemidoesLeft}</Text>
      </View>
    </View>
    <Button title="Sair" color="tomato" onPress={onPressLogout} style={{width: 50}} />
  </View>
)
