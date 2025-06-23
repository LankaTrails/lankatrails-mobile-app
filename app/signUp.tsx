import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const signUp = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/signIn')}>
        <Text style={styles.buttonText}>Go to Sign In</Text>
      </TouchableOpacity>
    </View>
  )
}

export default signUp

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
})