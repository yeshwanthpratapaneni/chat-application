const socket = io()

const form = document.querySelector('form')
const message = document.querySelector('#message')

const messages = document.querySelector('#messages')


const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

console.log('Parsed ',Qs.parse(location.search, {ignoreQueryPrefix : true}))

socket.emit('join', {username , room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData' , ({room , users}) => {
    const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
    const sidebarHtml = document.querySelector('#sidebar')
    const html = Mustache.render(sidebarTemplate, {
        room ,
        users
    })
    sidebarHtml.innerHTML = html
})

const autoscroll = () => {
    const newMessage = messages.lastElementChild

    // height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = messages.offsetHeight

    // height of messages container
    const containerHeight = messages.scrollHeight

    // how far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('clientMessage', (message) => {
    console.log('Recieved Message ', message)
    const messageTemplate = document.querySelector('#message-template').innerHTML
    const html = Mustache.render(messageTemplate, {
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a'),
        username : message.username
    })
    console.log('HTML ',html)
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (location) => {
    const locationTemplate = document.querySelector('#location-template').innerHTML
    const html = Mustache.render(locationTemplate, {
        location : location.text,
        createdAt: moment(location.createdAt).format('h:mm a'),
        username : message.username
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})



form.addEventListener('submit', (e) => {
    e.preventDefault()
    document.querySelector('button').setAttribute('disabled', 'disabled')
    socket.emit('serverMessage', message.value, (ack) => {
        document.querySelector('button').removeAttribute('disabled')
        document.querySelector('input').value = ''
        document.querySelector('input').focus()
        if (ack) {
            alert(ack)
        }
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Not supported')
    }

    document.querySelector('#send-location').setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            document.querySelector('#send-location').removeAttribute('disabled')
            console.log('Location Shared !')
        })
    })
})
