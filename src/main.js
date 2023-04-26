const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const WebSocket = require('ws');

const Store = require('./Store.js');

const Ride = require('./Ride.js');
const Player = require( './Player.js');
const Elevator = require( './Elevator.js');



// user data
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'save-data',
  defaults: {
    // Stored as kJ
    totalEnergy: 0,
    elevator: {},
    elevator: null
  }
});

let saveData;
if (saveData = store.get('elevator')) saveData = saveData;
console.log(saveData);
let spaceElevator = new Elevator(saveData);
let activeRide = new Ride();
let activePlayer;
let mainWindow;
let sauceSocket;

const createWindow = () => {
   mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
    },
  })

  mainWindow.webContents.on('dom-ready', function(){
    mainWindow.webContents.send('update-elevator', spaceElevator.data());
  });
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
        if (choice.response == 2) return;
        if (choice.response == 0) {
          store.set('totalEnergy', activeRide.kJ);
          store.set('elevator', spaceElevator);
          activeRide.save();
          hasConfirmed = true;
        } else if (choice.response == 1) {
          hasConfirmed = true;
        }
        if (sauceSocket.readyState !== WebSocket.CLOSED) sauceSocket.close();
        mainWindow.close();
      });
    }
  });


  mainWindow.loadFile('src/ui/index.html')
}

function removeRust() {
  spaceElevator.removeRust();
}


app.whenReady().then(() => {
  ipcMain.handle('remove-rust', removeRust);
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})




function updateGameData(sauceData) {
  if(!activeRide.started) {
    activeRide.start();
    activeRide.sauceTime = sauceData.state.worldTime;
  } else {
    const duration = sauceData.state.worldTime - activeRide.sauceTime;
    if (duration > 500) { // limit updates to twice per second
      activeRide.sauceTime = sauceData.state.worldTime;

      let delta = activeRide.updateEnergy(duration, sauceData.state.power);
      spaceElevator.energize(delta);
    }
  }


  
  if (!activePlayer) activePlayer = new Player();

  activePlayer.updateStream(sauceData);


  mainWindow.webContents.send('update-ride', activeRide);
  mainWindow.webContents.send('update-player', activePlayer);
  mainWindow.webContents.send('update-elevator', spaceElevator.data());
}

/* Interface with Sauce */
let reconnectInterval = 1000 * 30;
var sauce = function(){
  sauceSocket = new WebSocket('ws://192.168.11.124:1080/api/ws/events');

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
  sauceSocket.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response.success == true && response.type == "event") {
      //stamp when the data came in, it's not in the stream apparently
      response.data.timestamp = Date.now();
      updateGameData(response.data);
    } else {
      console.log(response);
    }
  };
  sauceSocket.onopen = (event) => {
    sauceSocket.send(JSON.stringify(subscription));
  };

  sauceSocket.onclose = (event) => {
  }

  sauceSocket.onerror = (event) => {
    console.log(event.error);
    setTimeout(sauce, reconnectInterval);
  }
}
sauce();