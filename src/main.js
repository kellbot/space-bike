const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const WebSocket = require('ws');

import Ride from './Ride.js';
import Player from './Player.js';
const Store = require('./Store.js');


let mainWindow;
let activeRide;
let activePlayer;



// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


// user data
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'save-data',
  defaults: {
    // Stored as kJ
    totalEnergy: 666
  }
});


const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true
    },
  })



  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  let hasConfirmed = false;
  mainWindow.on('close', function(e){
    if (!hasConfirmed) {
      e.preventDefault();

      dialog.showMessageBox(this,
        {
          type: 'question',
          buttons: ['Yes', 'No', 'Cancel'],
          title: 'Confirm',
          message: 'Save progress before quitting?'
      }).then((choice) => {
        if (choice.response == 0) {
          store.set('totalEnergy', activeRide.kJ);
          hasConfirmed = true;
          mainWindow.close();
        } else if (choice.response == 1) {
          hasConfirmed = true;
          mainWindow.close();
        }
      });
    }
  });

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  ipcMain.on('counter-value', (_event, value) => {
    console.log(value) // will print value to Node console
  })
  createWindow();
 
});



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


let socket = new WebSocket('ws://192.168.11.124:1080/api/ws/events');

let subscription = {
  type: "request",
  uid: "random-request-id-5134",
  data: {
      method: "subscribe",
      arg: {
          event: "athlete/watching",
          subId: 'random-sub-id-53611'
      }
  }
}

socket.onmessage = (event) => {
  const response = JSON.parse(event.data);
  if (response.success == true && response.type == "event") {
    //stamp when the data came in, it's not in the stream apparently
    response.data.timestamp = Date.now();
    updateRider(response.data);
  } else {
    console.log(response);
  }
};
socket.onopen = (event) => {
  socket.send(JSON.stringify(subscription));
};

socket.onclose = (event) => {
  console.log("Socket closed");
}

function updateRider(sauceData) {
  
  const currentTime = sauceData.timestamp;
  if (!activeRide) {
    activeRide = new Ride(currentTime);
    activeRide.kJ = store.get('totalEnergy');
  } else {  
    activeRide.updateEnergy(currentTime, sauceData.state.power);
  }
  if (!activePlayer) activePlayer = new Player();

  activePlayer.updateState(sauceData.state);


  mainWindow.webContents.send('update-ride', activeRide);
  mainWindow.webContents.send('update-player', activePlayer);
}