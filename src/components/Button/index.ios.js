import React from 'react'
import {TouchableOpacity, View, Text} from 'react-native'
export default ({
  title,
  color,
  style,
  loading,
  ...props
}) => (
  <TouchableOpacity style={[{
    backgroundColor: props.disabled ? '#d3d3d3' : color,
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  }, style]} {...props}>

    <Text style={{color: '#FFF', textAlign: 'center'}}>{loading ? 'Aguarde...' : title}</Text>


</TouchableOpacity>
)
