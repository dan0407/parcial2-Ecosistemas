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
    const poloEspecial = db.players.find((user) => user.role === "polo-especial")

    let message = ''

    if (poloSelected.role !== "polo-especial") {
      // If the selected player is not polo-especial, polo-especial gains points
      if (poloEspecial) {
        poloEspecial.points += 10
        message = `El marco ${myUser.nickname} ha seleccionado a ${poloSelected.nickname}. ${poloEspecial.nickname} (polo especial) ha ganado 10 puntos!`
      } else {
        // In case there's no polo-especial, the marco still gains points
        myUser.points += 10
        message = `El marco ${myUser.nickname} ha ganado 10 puntos! ${poloSelected.nickname} ha sido capturado`
      }
    } else {
      // If polo-especial is selected, all other players gain points
      db.players.forEach(player => {
        if (player.id !== poloSelected.id) {
          player.points += 10
        }
      })
      message = `El marco ${myUser.nickname} ha seleccionado al polo especial ${poloSelected.nickname}. ¡Todos los demás jugadores han ganado 10 puntos!`
    }

    io.emit("notifyGameOver", {
      message: message,
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
