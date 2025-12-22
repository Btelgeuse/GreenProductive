const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadPage: (page) => ipcRenderer.send("load-page", page),

  // Speech Service
  startSpeechService: () => ipcRenderer.invoke("start-speech-service"),
  stopSpeechService: () => ipcRenderer.invoke("stop-speech-service"),

  onSpeechFinal: (callback) => {
    ipcRenderer.removeAllListeners("speech-final");
    ipcRenderer.on("speech-final", (_, text) => callback(text));
  },

  onSpeechPartial: (callback) => {
    ipcRenderer.removeAllListeners("speech-partial");
    ipcRenderer.on("speech-partial", (_, text) => callback(text));
  },

  removeAllSpeechListeners: () => {
    ipcRenderer.removeAllListeners("speech-final");
    ipcRenderer.removeAllListeners("speech-partial");
  },
});
