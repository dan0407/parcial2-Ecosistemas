// gameHandlers.js

const { assignRoles } = require("../utils/helpers")

// Assuming db and io are required or passed in some way to be accessible
// const joinGameHandler = (socket, db, io) => {
//   return (user) => {
//     db.players.push({ id: socket.id, ...user })
//     console.log(db.players)
//     io.emit("userJoined", db) // Broadcasts the message to all connected clients including the sender
//   }
// }

const joinGameHandler = (socket, db, io) => {
  return (user) => {
    db.players.push({ id: socket.id, ...user, points: 0 })
    io.emit("userJoined", db)
  }
}

const startGameHandler = (socket, db, io) => {
  return () => {
    // Preserve existing points
    const existingPoints = db.players.reduce((acc, player) => {
      acc[player.id] = player.points
      return acc
    }, {})

    // Reassign roles but keep points
    db.players = assignRoles(db.players).map(player => ({
      ...player,
      points: existingPoints[player.id] || 0
    }))

    db.players.forEach((element) => {
      io.to(element.id).emit("startGame", element.role)
    })
  }
}

const notifyMarcoHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter(
      (user) => user.role === "polo" || user.role === "polo-especial"
    )

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Marco!!!",
        userId: socket.id,
      })
    })
  }
}

const notifyPoloHandler = (socket, db, io) => {
  return () => {
    const rolesToNotify = db.players.filter((user) => user.role === "marco")

    rolesToNotify.forEach((element) => {
      io.to(element.id).emit("notification", {
        message: "Polo!!",
        userId: socket.id,
      })
    })
  }
}

const onSelectPoloHandler = (socket, db, io) => {
  return (userID) => {
    const myUser = db.players.find((user) => user.id === socket.id)
    const poloSelected = db.players.find((user) => user.id === userID)

    if (poloSelected.role === "polo-especial") {
      poloSelected.points += 10
    } else {
      myUser.points += 10
    }

    io.emit("notifyGameOver", {
      message: poloSelected.role === "polo-especial" 
        ? `El marco ${myUser.nickname} ha perdido. ${poloSelected.nickname} ha ganado 10 puntos!`
        : `El marco ${myUser.nickname} ha ganado 10 punto! ${poloSelected.nickname} ha sido capturado`,
      updatedPlayers: db.players
    })
  }
}

module.exports = {
  joinGameHandler,
  startGameHandler,
  notifyMarcoHandler,
  notifyPoloHandler,
  onSelectPoloHandler,
}
