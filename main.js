// main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");
const AutoLaunch = require("auto-launch");

const appLauncher = new AutoLaunch({
    name: "Servidor Impresora",
    path: process.execPath,
});

appLauncher.isEnabled()
    .then((isEnabled) => {
        if (!isEnabled) {
            return appLauncher.enable();
        }
    })
    .catch((err) => {
        console.error("Error al configurar auto-launch:", err);
    });

function createWindow() {
    const win = new BrowserWindow({
        width: 400,
        height: 200,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent("<h1>Servidor de impresión en ejecución</h1>")}`);
}

// Inicia el servidor Express
require(path.join(__dirname, "server.js"));

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
