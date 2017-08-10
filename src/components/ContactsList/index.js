import React from 'react'
import { FlatList, View, Text } from 'react-native'
import ContactsListItem from '../ContactsListItem'

export default ({
  contacts,
  onClickContact
}) => (
  <FlatList
    data={contacts}
    keyExtractor={(item, index) => `${item.id}${index}`}
    renderItem={({item}) => (
      <ContactsListItem
        {...item}
        onClick={onClickContact}
      />
    )}
  />
)
