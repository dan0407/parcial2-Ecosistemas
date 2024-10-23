// import { router, socket } from "../routes.js";

// export default function renderScreen1() {
//   const app = document.getElementById("app");

//   app.innerHTML = `
//     <h2>Game Results</h2>
//     <ul id="scores-list"></ul>
//   `;

//   socket.on("notifyGameOver", (data) => {
//     console.log("Received notifyGameOver event:", data);
//     const scoresList = document.getElementById("scores-list");
//     scoresList.innerHTML = "";

//     data.updatedPlayers.forEach(player => {
//       console.log("Player data:", player);
//         const scoreItem = document.createElement("li");
//       scoreItem.textContent = `${player.nickname}: ${player.points} points`;
//       scoresList.appendChild(scoreItem);
//     });
//   });
// }

import { router, socket } from '../routes.js';

export default function renderScreen1() {
	const app = document.getElementById('app');

	app.innerHTML = `
		<div class="results-container">
			<h2 class="results-title">Game Results</h2>
			<div id="winner-announcement"></div>
			<ul id="scores-list" class="scores-list"></ul>
		</div>
	`;

	socket.on('notifyGameOver', (data) => {
		console.log('Received notifyGameOver event:', data);
		const scoresList = document.getElementById('scores-list');
		const winnerAnnouncement = document.getElementById('winner-announcement');
		scoresList.innerHTML = '';

		const winner = data.updatedPlayers.find((player) => player.points >= 100);
		if (winner) {
			winnerAnnouncement.innerHTML = `
				<div class="winner-message">
					¡Felicidades ${winner.nickname}!
					🎉 ¡Has ganado el juego! 🏆
				</div>
			`;
		}

		data.updatedPlayers.forEach((player) => {
			console.log('Player data:', player);
			const scoreItem = document.createElement('li');
			scoreItem.textContent = `${player.nickname}: ${player.points} points`;
			scoresList.appendChild(scoreItem);
		});
	});
}
