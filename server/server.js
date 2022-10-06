import { createServer } from 'http'
import express from 'express'
import { Server } from 'socket.io'

const app = express
const server = createServer(app)
const io = new Server(server)

let users = []
let connections = []

io.on('connection', socket => {
  socket.on('join', ({ roomId, name }) => {
    const user = users.find(user => user.roomId === roomId)
    if (user) {
      socket.emit('partner-joined', { partnerId: user.id, name: user.name })
      socket.to(user.id).emit('partner-joined', { partnerId: socket.id, name })
      connections.push({ peer1: socket.id, peer2: user.id })
      users = users.filter(u => u.id !== user.id)
    } else {
      const isThere = users.find(user => user.id === socket.id)
      if (isThere) return
      else users.push({ id: socket.id, roomId, name })
    }
  })

  socket.on('public-key', ({ partner, publicKey }) => {
    socket.to(partner).emit('public-key', publicKey)
  })

  socket.on('message', ({ to, encryptedMessage, authTag }) => {
    console.log("message", encryptedMessage);
    socket.to(to).emit('message', { encryptedMessage, authTag })
  })

  socket.on('typing', partner => {
    socket.to(partner).emit('typing')
  })

  socket.on('stopped-typing', partner => {
    socket.to(partner).emit('stopped-typing')
  })

  socket.on('disconnect', () => {
    const connection = connections.find(
      connection =>
        connection.peer1 === socket.id || connection.peer2 === socket.id
    )
    if (connection) {
      const partner =
        connection.peer1 === socket.id ? connection.peer2 : connection.peer1

      socket.to(partner).emit('partner-disconnected')
      connections = connections.filter(
        connection =>
          connection.peer1 !== socket.id && connection.peer2 !== socket.id
      )
    } else {
      users = users.filter(user => user.id !== socket.id)
    }
  })
})

const port = process.env.PORT || 5000

server.listen(port, () => console.log(`Server started at ${port}`))
