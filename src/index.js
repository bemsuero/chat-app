const path = require("path")
const http = require("http")
const express = require("express")
const socketio = require("socket.io")
const Filter = require("bad-words")
const { generateMessage, generateLocation } = require("./utils/messages")
const {   addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDir = path.join(__dirname, "../public")

// const viewsPath = path.join(__dirname, "../templates/views")

app.use(express.static(publicDir))

// let count = 0
// let message = "Welcome to the Chat"

io.on('connection', (socket) => {
  // console.log('a user connected');
//////////////////////////////
  // socket.emit("countUpdated", count)
  //
  // socket.on("adding", () => {
  //   count++
  //   io.emit("countUpdated", count)
  // })
  /////////////////////////////
  // socket.emit("message", "welcome!")
////////////////////////////////
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room })

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit("getMessage", generateMessage("Admin", "Welcome to the Chat!"))
    socket.broadcast.to(user.room).emit("getMessage", generateMessage("Admin", `${user.username} has joined the room.`))
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

  })

  socket.on("sendMessage", (message, callback) => {

    const user = getUser(socket.id)

    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback("profanity is not allowed.")
    }

    io.to(user.room).emit("getMessage", generateMessage(user.username, message))
    callback("Delivered!")
  })
  socket.on("disconnect", () => {
    const user = removeUser(socket.id)
    if (user) {
      io.to(user.room).emit("getMessage", generateMessage("Admin", `${user.username} has left the room.`))
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  })

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit("locationMessage", generateLocation(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
    callback()
  })
})
// socket.on("sendLocation", (message) => {
  //   io.emit("getMessage", `Location shared: ${message}`)
  // })

server.listen(port, () => {
  console.log(`server up on ${port}`)
})

// app.get("", (req, res) => {
//   res.render("index")
// })
