import { router, socket } from "../routes.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
        <h1>Screen 1</h1>
        <p>This is the Screen 1</p>
    `;

  socket.on("eventListenerExample", (data) => {});
}
