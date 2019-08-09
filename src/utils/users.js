const users = []

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase(),
  room = room.trim().toLowerCase()

  if (!username || !room) {
    return {
      error: "Username and room are required."
    }
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  if (existingUser) {
    return {
      error: "Username in use"
    }
  }

  const user = { id, username, room }
  users.push(user)

  return { user }
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => {
  const found = users.find((user) => user.id === id)
  return found
}

const getUsersInRoom = (room) => {
  const array = users.filter((user) => user.room === room.toString())
  return array
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}

// addUser({
//   id: 1,
//   username: "greg",
//   room: "room"
// })
//
// console.log(users)
// console.log(getUser(1))
