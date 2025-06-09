import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const explore = () => {
  return (
    <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text className="text-6xl font-bold">
            <Text className="text-primary">Explore</Text>
          </Text>
        </View> 
  )
}

export default explore

const styles = StyleSheet.create({})