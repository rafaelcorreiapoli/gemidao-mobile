import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {
  WAITING,
  RINGING,
  TALKING,
  FINISHED
} from '../../socket'
import Button from '../Button'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'red'
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBox: {
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    case WAITING:
      return '#3498db'
    case RINGING:
      return `#9b59b6`
    case TALKING:
      return `#16a085`
    case FINISHED:
      return `#e74c3c`
  }
}
const getTextForStatus = (status, victimName) => {
  switch (status) {
    case WAITING:
      return `Preparando ligação para ${victimName}...`
    case RINGING:
      return `O telefone de ${victimName} está tocando...`
    case TALKING:
      return `${victimName} atendeu...`
    case FINISHED:
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
