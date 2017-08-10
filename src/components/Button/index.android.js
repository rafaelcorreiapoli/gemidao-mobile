import React from 'react'
import {TouchableNativeFeedback, View, Text} from 'react-native'
export default ({
  title,
  color,
  style,
  loading,
  ...props
}) => (
  <TouchableNativeFeedback elevation={3} {...props}>
  <View style={[{
    backgroundColor: props.disabled ? '#d3d3d3' : color,
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  }, style]}>
    <Text style={{color: '#FFF'}}>{loading ? 'Aguarde...' : title}</Text>
  </View>

  </TouchableNativeFeedback>
)
