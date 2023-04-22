const { app, BrowserWindow, ipcMain } = require('electron');
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
if (saveData = store.get('elevator')) saveData = JSON.parse(saveData);
let spaceElevator = new Elevator(saveData);
let activeRide;
let activePlayer;
let mainWindow;

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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function updateGameData(sauceData) {

  const currentTime = sauceData.timestamp;
  if (!activeRide) {
    activeRide = new Ride(currentTime);
    activeRide.kJ = store.get('totalEnergy');

  } else {  
    let delta = activeRide.updateEnergy(currentTime, sauceData.state.power);
    spaceElevator.energize(delta);
  }
  if (!activePlayer) activePlayer = new Player();

  activePlayer.updateStream(sauceData);


  mainWindow.webContents.send('update-ride', activeRide);
  mainWindow.webContents.send('update-player', activePlayer);
  mainWindow.webContents.send('update-elevator', spaceElevator.data());
}

/* Interface with Sauce */

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
    updateGameData(response.data);
  } else {
    console.log(response);
  }
};
socket.onopen = (event) => {
  socket.send(JSON.stringify(subscription));
  sauceConnected = true;
};

socket.onclose = (event) => {
  sauceConnected = false;
}

socket.onerror = (event) => {
  console.log(event);
}