import { createContext, useEffect, useState } from "react"
import io from "socket.io-client"

export const SocketContext = createContext()

const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState({})
  useEffect(() => {
    const newSocket = io("http://192.168.0.125:5000")
    setSocket(newSocket)
    return () => newSocket.close()
  }, [])
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export default SocketProvider
