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
import updateViewport from './viewport';
import populateRust from './rust';


const riderStats = document.getElementById('rider-stats');

const elemET = document.getElementById('stat-elapsedTime');
const elemKJ = document.getElementById('stat-energy');
const elemHeight = document.getElementById('stat-height');

const elemStatus = document.getElementById('stat-status');

const ed = document.getElementById('elevator');

populateRust(300);


window.electronAPI.handlePlayer((event, player) => {

    riderStats.innerText = `Power: ${player.stream.state.power}  Cadence: ${player.stream.state.cadence}`;
})

window.electronAPI.handleRide((event, value) => {

    const et = value.elapsedTime;
    const duration = moment.duration(et);
    elemET.innerText = duration.minutes() + ':' + duration.seconds().toString().padStart(2, '0');
    elemKJ.innerText = `Energy: ${Math.round(value.kJ)} kJ`;
});

const batteryHTML = `<div class="progress charging">
<div class="track" data-charge="0">
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
    elemHeight.innerText = `Height: ${Math.round(elevator.height)} m`;
    elemStatus.innerHTML = `Status: ${elevator.status}`;
    if (elevator.status == 'charging') {
        ed.classList.add('powered-down');
    } else {
        ed.classList.remove('powered-down');
        updateViewport('spaceView', elevator.height);
    }

    const batteryElem = document.getElementById('batteries');
    if (batteryElem.children.length < 1 || batteryElem.children.length != elevator.batteries.length) {
        batteryElem.innerHTML = '';
        for (let i = 0; i < elevator.batteries.length; i++) {
            let battery = elevator.batteries[i];
            batteryElem.appendChild(batteryGui);
            const chargePCT = battery.charge / battery.capacity * 100;
            batteryGui.dataset.charge = chargePCT;
            batteryGui.querySelector('.track').width = chargePCT + '%';
        }
    } else {
        for (let i = 0; i < elevator.batteries.length; i++) {
            let battery = elevator.batteries[i];
            let gui = batteryElem.children[i];
            
            const chargePCT = battery.charge / battery.capacity * 100;

            if (gui.dataset.charge == chargePCT) { 
                // Not actively charging
                gui.classList.remove('charging');
                continue;

            } else if (gui.dataset.charge > chargePCT) {
                // discharging
                gui.classList.remove('charging')

            } else {
                gui.classList.add('charging');
            }

            const trackWidth = battery.charge / battery.capacity * 100 + '%';
            gui.querySelector('.track').style.width = trackWidth;
            ed.style.filter = `brightness(${chargePCT}%)`;
        }
    }
})

