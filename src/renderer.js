/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */
import moment from 'moment';

import './index.css';

const riderStats = document.getElementById('rider-stats');


window.electronAPI.handlePlayer((event, player) => {

    riderStats.innerText = `Power: ${player.stream.state.power}  Cadence: ${player.stream.state.cadence}`;
})

const voyageStats = document.getElementById('voyage-stats');

window.electronAPI.handleRide((event, value) => {

    const et = value.elapsedTime;
    const duration = moment.duration(et);
    voyageStats.innerText = duration.minutes() + ':' + duration.seconds().toString().padStart(2, '0');
    voyageStats.innerText += `\nEnergy: ${Math.round(value.kJ)} kJ`;
});


const ed = document.getElementById('elevator');


const batteryHTML = `<div class="progress">
<div class="track">
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
</div>
</div>`;
const placeholder = document.createElement("div");
placeholder.innerHTML = batteryHTML;
const batteryGui = placeholder.firstElementChild;

window.electronAPI.handleElevator((event, elevator) => {
    voyageStats.innerHTML += `Height: ${Math.round(elevator.height)} m`;
    const batteryElem = document.getElementById('batteries');
    if (batteryElem.children.length < 1) {
        for (let i = 0; i < elevator.batteries.length; i++) {
            let battery = elevator.batteries[i];
            batteryElem.appendChild(batteryGui);
            //ed.innerText += `\nBattery ${i+1}: ${battery.charge / battery.capacity * 100}%`;
        }
    }
})

console.log('👋 This message is being logged by "renderer.js", included via webpack');
