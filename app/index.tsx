import { StyleSheet, Text, View } from 'react-native'
import { Redirect } from 'expo-router'
import React from 'react'

const index = () => {
    const isLoggedIn = false; // Replace with your actual authentication logic
  return (
    <Redirect
      href={isLoggedIn ? '/(tabs)/home' : '/signIn'} />
  )
}

export default index

const styles = StyleSheet.create({})