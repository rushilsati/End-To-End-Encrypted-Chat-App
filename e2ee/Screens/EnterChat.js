import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import React, { useContext } from "react"
import { ChatContext } from "../Context/ChatContext"
import { useNavigation } from "@react-navigation/native"
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"

const EnterChat = () => {
  const { roomId, setRoomId, name, setName } = useContext(ChatContext)

  const navigation = useNavigation()

  const handlePress = () => {
    if (roomId.trim().length === 0) return
    navigation.navigate("Chat")
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>ENTER CHAT</Text>
        <View style={styles.inputContainer}>
          <View style={styles.label}>
            <MaterialCommunityIcons
              name='account'
              size={25}
              color='hsl(0, 0%, 55%)'
            />
          </View>
          <TextInput
            value={name}
            style={styles.input}
            placeholderTextColor='#777'
            placeholder='Enter Name'
            onChangeText={text => setName(text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.label}>
            <AntDesign
              name='heart'
              size={20}
              color='hsl(0, 0%, 55%)'
            />
          </View>
          <TextInput
            value={roomId}
            style={styles.input}
            placeholderTextColor='#777'
            placeholder='Enter interest'
            onChangeText={text => setRoomId(text)}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.6}
          onPress={handlePress}
        >
          <Text style={styles.buttonText}>ENTER</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default EnterChat

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "hsl(0, 0%, 10%)",
  },
  card: {
    padding: 20,
    width: "95%",
    elevation: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "hsl(0, 0%, 20%)",
  },
  heading: {
    fontSize: 25,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  inputContainer: {
    gap: 5,
    height: 50,
    width: "95%",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "hsl(0, 0%, 55%)",
    justifyContent: "space-between",
  },
  label: {
    width: "15%",
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingHorizontal: 20,
  },
  button: {
    height: 50,
    width: "95%",
    elevation: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
  },
  buttonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "500",
  },
})
