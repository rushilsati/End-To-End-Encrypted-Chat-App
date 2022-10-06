import { SafeAreaView, StatusBar, StyleSheet } from "react-native"
import React from "react"

import "react-native-gesture-handler"
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack"
import { NavigationContainer } from "@react-navigation/native"

import Chat from "./Screens/Chat"
import EnterChat from "./Screens/EnterChat"
import ChatProvider from "./Context/ChatContext"

const App = () => {
  const Stack = createStackNavigator()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor='hsl(0, 0%, 20%)'
        networkActivityIndicatorVisible={false}
      />
      <ChatProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            }}
          >
            <Stack.Screen name='EnterChat' component={EnterChat} />
            <Stack.Screen name='Chat' component={Chat} />
          </Stack.Navigator>
        </NavigationContainer>
      </ChatProvider>
    </SafeAreaView>
  )
}

export default App

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
