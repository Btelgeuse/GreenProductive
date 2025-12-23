const path = require("path");
const { spawn } = require("child_process");
const {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  dialog,
} = require("electron");
const fs = require("fs");

let win;
let speechProcess = null;

function startSpeechService() {
  if (speechProcess) {
    console.log("Speech service already running");
    return;
  }
  console.log("Starting speech service...");
  const speechBinaryPath = path.join("dist", "speech_service");
  if (!fs.existsSync(speechBinaryPath)) {
    console.error("Speech binary not found:", speechBinaryPath);
    return;
  }

  console.log("Binary path: ", speechBinaryPath);
  // Spawn the speech engine
  speechProcess = spawn(speechBinaryPath, [], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  console.log("Speech process spawned, PID:", speechProcess.pid);

  // Listen for output
  // Listen for output (robust multi-line handler)
  let buffer = "";

  speechProcess.stdout.on("data", (data) => {
    buffer += data.toString();

    // Split on newlines
    const lines = buffer.split("\n");

    // Keep the last partial line in the buffer
    buffer = lines.pop();

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      console.log("RAW STDOUT:", line);

      // Final recognized text
      if (line.startsWith("Text:")) {
        const text = line.replace("Text:", "").trim();
        console.log("Sending FINAL text to renderer:", text);

        if (win && !win.isDestroyed()) {
          win.webContents.send("speech-final", text);
        } else {
          console.error("win not available!");
        }
      }

      // Partial recognized text
      if (line.startsWith("Partial:")) {
        const partial = line.replace("Partial:", "").trim();
        console.log("⚡ Sending PARTIAL text to renderer:", partial);

        if (win && !win.isDestroyed()) {
          win.webContents.send("speech-partial", partial);
        } else {
          console.error("win not available!");
        }
      }
    }
  });

  // Listen for errors
  speechProcess.stderr.on("data", (data) => {
    const errMsg = data.toString();
    console.log("Speech service stderr:", errMsg);
  });

  // Handle exit
  speechProcess.on("close", (code) => {
    console.log("Speech service stopped with code", code);
    speechProcess = null;
  });

  speechProcess.on("error", (error) => {
    console.error("Speech process error:", error);
    speechProcess = null;
  });
}

function stopSpeechService() {
  if (speechProcess) {
    console.log("Stopping speech service...");
    speechProcess.kill();
    speechProcess = null;
  }
}

ipcMain.handle("start-speech-service", async () => {
  console.log("IPC start-speech-service called");
  startSpeechService();
  return { success: true };
});

ipcMain.handle("stop-speech-service", async () => {
  console.log("IPC: stop-speech-service called");
  stopSpeechService();
  return { success: true };
});

function createWindow() {
  win = new BrowserWindow({
    width: 550,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.removeMenu();
  win.loadFile("index.html");
  //win.webContents.openDevTools();

  ipcMain.on("load-page", (event, page) => {
    win.loadFile(page);
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  stopSpeechService();
});
