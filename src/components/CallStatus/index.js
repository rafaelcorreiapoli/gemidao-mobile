import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Button from '../Button'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBox: {
    paddingVertical: 60,
    alignSelf: 'stretch',
    marginHorizontal: 10,
    borderRadius: 10
  },
  status: {
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center'
  },
  button: {
    margin: 10,
  }
})
const getColorForStatus = (status) => {
  switch (status) {
    case 'preparing':
      return '#3498db'
    case 'ringing':
      return `#9b59b6`
    case 'answer':
      return `#16a085`
    case 'hangup':
      return `#e74c3c`
  }
}
const getTextForStatus = (status, victimName) => {
  switch (status) {
    case 'preparing':
      return `Preparando ligação para ${victimName}...`
    case 'ringing':
      return `O telefone de ${victimName} está tocando...`
    case 'answer':
      return `${victimName} atendeu...`
    case 'hangup':
      return `${victimName} desligou!`
  }
}
export default ({
  onClickBack,
  victimName,
  status
}) => (
  <View style={styles.container}>
    <View style={styles.statusContainer}>
      <View style={[styles.statusBox, {backgroundColor: getColorForStatus(status)}]}>
        <Text style={styles.status}>
          {getTextForStatus(status, victimName)}
        </Text>
      </View>

    </View>

    <Button
      title="Voltar"
      color="#f1c40f"
      onPress={onClickBack}
      style={styles.button}
    />
  </View>
)
