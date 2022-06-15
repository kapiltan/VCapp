const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const cors = require('cors')
app.use(cors())
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

server.listen(3000, () => {
  console.log('listening on port 3000')
})
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})
io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.on('gotpermission', () => {
        socket.to(roomId).broadcast.emit('user-connected', userId)
    })
  
    
    socket.on('share-screen', (screenid) => {
      socket.to(roomId).broadcast.emit('share-screen', screenid, userId)
      console.log('screen broadcasted')
    })
    
    socket.on('message', (message) => {  
      socket.to(roomId).broadcast.emit('message', message)
      console.log('message received and broadcasted')
    })
    socket.on('disconnect', () => {
    socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })

})