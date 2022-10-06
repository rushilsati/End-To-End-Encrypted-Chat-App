import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import React, { useContext, useEffect, useMemo, useRef, useState } from "react"

import { createCipheriv, createDecipheriv, createECDH } from "crypto"
import io from "socket.io-client"
import IonIcons from "react-native-vector-icons/Ionicons"
import AntDesign from "react-native-vector-icons/AntDesign"
import { ChatContext } from "../Context/ChatContext"

const Chat = () => {
  const [partnerName, setPartnerName] = useState("")
  const [encryptionKey, setEncryptionKey] = useState("")
  const [partner, setPartner] = useState("")
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState(null)
  const [input, setInput] = useState("")
  const [chats, setChats] = useState([])
  const [partnerTyping, setPartnerTyping] = useState(false)

  const scrollViewRef = useRef()

  const randomNum = useMemo(() => {
    return Math.floor(50 * Math.random())
  }, [])

  const { roomId, name } = useContext(ChatContext)

  const handleEncryptMessage = message => {
    const civ = "db58eb3203692b3dffc880d9cefa42ff"
    const civBuffer = Buffer.from(civ, "hex")

    const cipher = createCipheriv(
      "aes-128-gcm",
      encryptionKey.substring(0, 16),
      civBuffer,
    )
    const encryptedMessage =
      cipher.update(message, "utf8", "hex") + cipher.final("hex")

    const authTagBuffer = cipher.getAuthTag()
    const authTag = authTagBuffer.toString("hex")

    return {
      encryptedMessage,
      authTag,
    }
  }

  const handleDecryptMessage = (encryptedMessage, authTag) => {
    const div = "db58eb3203692b3dffc880d9cefa42ff"
    const divBuffer = Buffer.from(div, "hex")

    const decipher = createDecipheriv(
      "aes-128-gcm",
      encryptionKey.substring(0, 16),
      divBuffer,
    )

    const authTagBuffer = Buffer.from(authTag, "hex")
    decipher.setAuthTag(authTagBuffer)

    const decryptedMessage =
      decipher.update(encryptedMessage, "hex", "utf8") + decipher.final("utf8")

    return decryptedMessage
  }

  useEffect(() => {
    const newSocket = io("http://192.168.0.125:5000")
    setSocket(newSocket)

    return () => newSocket.close()
  }, [])

  useEffect(() => {
    if (socket === null) return

    socket.emit("join", { roomId, name })

    socket.on("partner-joined", ({ partnerId, name: pName }) => {
      setPartner(partnerId)
      setPartnerName(pName)

      const myKeyChain = createECDH("secp256k1")
      myKeyChain.generateKeys()

      const myPublicKeyBuffer = myKeyChain.getPublicKey()
      const myPublicKey = myPublicKeyBuffer.toString("hex")

      socket.emit("public-key", { partner: partnerId, publicKey: myPublicKey })

      socket.on("public-key", publicKey => {
        const sharedSecretBuffer = myKeyChain.computeSecret(publicKey, "hex")
        const sharedSecret = sharedSecretBuffer.toString("hex")

        console.log(Platform.constants.Manufacturer, " received", sharedSecret)
        setEncryptionKey(sharedSecret)
        setLoading(false)
      })
    })
  }, [socket])

  useEffect(() => {
    if (!socket || encryptionKey.length === 0) return

    socket.on("message", ({ encryptedMessage, authTag }) => {
      const decryptedMessage = handleDecryptMessage(encryptedMessage, authTag)

      setChats(prevChats => [
        ...prevChats,
        { from: partner, message: decryptedMessage },
      ])
    })

    socket.on("typing", () => {
      setPartnerTyping(true)
    })

    socket.on("stopped-typing", () => {
      setPartnerTyping(false)
    })

    socket.on("partner-disconnected", () => {
      setLoading(true)
      socket.emit("join", { roomId, name })
    })
  }, [socket, encryptionKey, partner])

  useEffect(() => {
    if (!socket) return

    if (input.trim().length === 0) {
      socket.emit("stopped-typing", partner)
      return
    }
    socket.emit("typing", partner)
  }, [input])

  useEffect(() => {
    setChats([]);
  }, [loading])

  const handleSendMessage = () => {
    if (input.trim().length === 0) return
    else {
      const message = input.trim()
      const { encryptedMessage, authTag } = handleEncryptMessage(message)
      setChats(prevChats => [...prevChats, { from: socket.id, message }])
      socket.emit("message", { to: partner, encryptedMessage, authTag })
      setInput("")
    }
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center", flexDirection: "row" }}
        >
          <Text style={styles.waitingText}>WAITING FOR SOMEONE TO JOIN</Text>
          <ActivityIndicator size="small" color="#fff"/>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Image
                source={{
                  uri: `https://avatars.dicebear.com/api/human/${randomNum}.png`,
                }}
                style={styles.avatar}
                resizeMode='cover'
              />
            </View>
            <View style={{ marginLeft: 20 }}>
              <Text style={styles.name}>{partnerName || "ANNOYMOUS"}</Text>
              <Text style={styles.status}>
                {partnerTyping ? "TYPING..." : "ONLINE"}
              </Text>
            </View>
          </View>
          <View style={styles.body}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.chatArea}
              onContentSizeChange={() =>
                scrollViewRef.current.scrollToEnd({ animated: true })
              }
            >
              {chats.map((chat, index) => {
                return (
                  <View
                    key={index}
                    style={[
                      styles.chat,
                      chat.from === socket.id ? styles.me : styles.partner,
                    ]}
                  >
                    <Text style={styles.chatText}>{chat.message}</Text>
                  </View>
                )
              })}
            </ScrollView>
          </View>
          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.button}>
              <AntDesign name='pluscircle' color='#fff' size={25} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder='Type A Message...'
              placeholderTextColor={"#777"}
              value={input}
              onChangeText={text => setInput(text)}
            />
            <TouchableOpacity style={styles.button} onPress={handleSendMessage}>
              <IonIcons name='send' color='#fff' size={25} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

export default Chat

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "hsl(0, 0%, 10%)",
  },
  waitingText: {
    fontSize: 16,
    color: '#fff',
    marginRight: 20,
    fontWeight: "500",
  },
  header: {
    height: 70,
    width: "100%",
    elevation: 5,
    padding: 10,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "hsl(0, 0%, 20%)",
  },
  avatar: {
    width: 50,
    height: 50,
  },
  name: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  status: {
    fontSize: 14,
    fontWeight: "500",
    color: "hsl(0, 0%, 40%)",
  },
  body: {
    flex: 1,
    paddingVertical: 10,
  },
  chatArea: {
    paddingHorizontal: 20,
  },
  chat: {
    padding: 10,
    elevation: 5,
    minHeight: 30,
    minWidth: 60,
    maxWidth: "55%",
    borderRadius: 8,
    marginBottom: 20,
  },
  me: {
    alignSelf: "flex-end",
    backgroundColor: "hsl(0, 0%, 25%)",
  },
  partner: {
    alignSelf: "flex-start",
    backgroundColor: "#3b82f6",
  },
  chatText: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
  },
  inputArea: {
    gap: 20,
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    justifyContent: "space-between",
    backgroundColor: "hsl(0, 0%, 20%)",
  },
  input: {
    height: 45,
    width: "75%",
    fontSize: 14,
    color: "#fff",
    borderWidth: 2,
    borderColor: "hsl(0, 0%, 35%)",
    borderRadius: 8,
    paddingHorizontal: 20,
  },
})
