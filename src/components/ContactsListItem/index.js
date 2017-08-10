import React from 'react'
import { FlatList, View, Text, StyleSheet, TouchableOpacity, TouchableNativeFeedback, Platform } from 'react-native'

const FlatButton = (Platform.OS === 'ios') ? TouchableOpacity : TouchableNativeFeedback

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    height: 50,
  },
  number: {
    color: '#999',
    fontSize: 12
  },
  name: {
    marginBottom: 4,
  },
})

export default ({
  name,
  firstNumber,
  onClick,
}) => (
  <FlatButton  onPress={() => onClick(firstNumber)}>
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.number}>{firstNumber}</Text>
    </View>
  </FlatButton>
)
