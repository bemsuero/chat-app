const socket = io()

// socket.on("countUpdated", (count) => {
//   console.log("the count has been updated.", count)
// })

// document.querySelector("#add").addEventListener("click", () => {
//   console.log("clicking the click button")
//   socket.emit("adding")
// })
//////////////////////////////////////////////
// socket.on("message", (message) => {
//   console.log(message)
// })

const messageForm = document.querySelector("#sendMessage")
const messageInput = messageForm.querySelector("input")
const messageButton = messageForm.querySelector("button")
const messages = document.querySelector("#messages")
const sidebar = document.querySelector("#sidebar")
const locationButton = document.querySelector("#send-location")

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  const newMessage = messages.lastElementChild

  const newMessageStyles = getComputedStyle(newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  const visibleHeight = messages.offsetHeight

  const containerHeight = messages.scrollHeight

  const scrollOffset = messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight
  }
}

socket.on("getMessage", (message) => {
  // console.log(`Chat: ${message}`)
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  })
  messages.insertAdjacentHTML("beforeend", html)
  autoscroll()
})

socket.on("locationMessage", (message) => {
  // console.log(`Chat: ${message}`)
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    message: message.url,
    createdAt: moment(message.createdAt).format("h:mm a")
  })
  messages.insertAdjacentHTML("beforeend", html)
  autoscroll()
})

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  sidebar.innerHTML = html
})



messageForm.addEventListener("submit", (event) => {
  event.preventDefault()

  messageButton.setAttribute("disabled", "disabled")

  let tempInput = event.target.elements.message.value

  socket.emit("sendMessage", tempInput, (error) => {
    messageButton.removeAttribute("disabled", "disabled")
    messageForm.reset()
    if (error) {
      return console.log(error)
    }
    console.log("Message delivered")
  })
})

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return console.log("Browser does not support Geolocation")
  }
  locationButton.setAttribute("disabled", "disabled")
  navigator.geolocation.getCurrentPosition((position) => {
    // this was my solution but it was way more code.
    // let latitude = position["coords"]["latitude"]
    // let longitude = position["coords"]["longitude"]
    // let location = `Latitude is ${latitude}. Longitude is ${longitude}.`
    // socket.emit("sendLocation", location)
  // })
    socket.emit("sendLocation", {
    latitude: position["coords"]["latitude"],
    longitude: position["coords"]["longitude"]
    }, () => {
      locationButton.removeAttribute("disabled", "disabled")
      console.log("location shared")
    })
  })
})

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error)
    location.href = "/"
  }
})
