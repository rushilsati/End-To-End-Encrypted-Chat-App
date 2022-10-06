import { createContext, useState } from "react"

export const ChatContext = createContext()

const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useState("")
  const [name, setName] = useState("");
  return (
    <ChatContext.Provider value={{ roomId, name, setRoomId, setName }}>
      {children}
    </ChatContext.Provider>
  )
}

export default ChatProvider
