
const { assignRoles } = require("../utils/helpers")

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
    let winner = null

    if (poloSelected.role === "polo-especial") {
      // Marco catches Polo Especial
      myUser.points += 50 // Marco gains 50 points
      poloSelected.points -= 10 // Polo Especial loses 10 points
      message = `El marco ${myUser.nickname} ha atrapado al polo especial ${poloSelected.nickname}. Marco gana 50 puntos, Polo Especial pierde 10 puntos.`
    } else if (poloSelected.role === "polo") {
      // Marco fails to catch Polo Especial
      myUser.points -= 10 // Marco loses 10 points
      poloEspecial.points += 10 // Polo Especial gains 10 points
      message = `El marco ${myUser.nickname} no logró atrapar al polo especial. Marco pierde 10 puntos, Polo Especial gana 10 puntos.`
    }

    // Check if anyone has reached 100 points
    const players = [myUser, poloSelected, poloEspecial];
    winner = players.find(player => player.points >= 100);

    if (winner) {
      message = `¡${winner.nickname} ha ganado el juego con ${winner.points} puntos! 🏆`
    }

    io.emit("notifyGameOver", {
      message: message,
      updatedPlayers: db.players,
      winner: winner
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
