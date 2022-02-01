const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // check for exisitng user
    const exisitngUser = users.find((user) => {
        return user.username === username && user.room === room
    })

    if (exisitngUser) {
        return {
            error: 'Username is already used by another user in the given room'
        }
    }

    const user = {
        id,
        username,
        room
    }

    users.push(user)

    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)
    return {user}
}

const getUsersInRoom = (room) => {
    const usersInRoom  = users.filter((user) => user.room === room)
    return usersInRoom
}

export {removeUser , addUser , getUser, getUsersInRoom}

