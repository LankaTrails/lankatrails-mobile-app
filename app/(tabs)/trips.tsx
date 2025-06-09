import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const trips = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-6xl font-bold">
        <Text className="text-primary">Trips</Text>
      </Text>
    </View>
  )
}

export default trips

const styles = StyleSheet.create({})