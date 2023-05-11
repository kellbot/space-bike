// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer  } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
handlePlayer: (callback) => ipcRenderer.on('update-player', callback),
handleRide: (callback) => ipcRenderer.on('update-ride', callback),
handleElevator: (callback) => ipcRenderer.on('update-elevator', callback),
initializeGame: (callback) => ipcRenderer.on('game-init', callback),
handleMilestone: (callback) => ipcRenderer.on('trigger-milestone', callback),
removeRust: (callback) => ipcRenderer.invoke('remove-rust', callback),
})