import express from 'express'
import path from 'path'
import { Server } from 'socket.io'
import http from 'http'
import { SocketAddress } from 'net'
import Filter from 'bad-words'
import { generateMessage } from './js/utils/generateMessage.js'
import { removeUser, addUser, getUser, getUsersInRoom } from './js/utils/users.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const port = process.env.PORT || 3000

const publicPath = path.join(path.resolve(), '/public')

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    console.log('New Websocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }
        socket.join(room)
        socket.emit('clientMessage', generateMessage('Admin', `Welcome ${username}`))
        socket.broadcast.to(user.room).emit('clientMessage', generateMessage(`${username} has joined room`))
        io.to(user.room).emit('roomData',{
            room : user.room ,
            users : getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('serverMessage', (message, callback) => {
        const filter = new Filter()

        const { error, user } = getUser(socket.id)

        if (error) {
            return callback(error)
        }

        if (filter.isProfane(message)) {
            return callback('Profanity not allowed')
        }
        io.to(user.room).emit('clientMessage', generateMessage(user.username , message))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('clientMessage', generateMessage('Admin',`${user.username} has left the room`))
            io.to(user.room).emit('roomData',{
                room : user.room ,
                users : getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (position, callback) => {
        const { error, user } = getUser(socket.id)
        if (error) {
            return callback(error)
        }
        io.to(user.room).emit('locationMessage', generateMessage('Admin',`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })
})


server.listen(port, () => {
    console.log('Server started at port 3000')
})