// import { router, socket } from "../routes.js";

// export default function renderScreen1() {
//   const app = document.getElementById("app");
//   app.innerHTML = `
//         <h1>Screen 1</h1>
//         <p>This is the Screen 1</p>
//     `;

//   socket.on("eventListenerExample", (data) => {});
// }


import { router, socket } from "../routes.js";

export default function renderScreen1() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <h1>Screen 1</h1>
    <p>This is Screen 1</p>
    <h2>Game Results</h2>
    <ul id="scores-list"></ul>
  `;

  socket.on("notifyGameOver", (data) => {
    console.log("Received notifyGameOver event:", data);
    const scoresList = document.getElementById("scores-list");
    scoresList.innerHTML = "";
    
    data.updatedPlayers.forEach(player => {
      console.log("Player data:", player);
        const scoreItem = document.createElement("li");
      scoreItem.textContent = `${player.nickname}: ${player.points} points`;
      scoresList.appendChild(scoreItem);
    });
  });
}

