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
import updateViewport from './ui/viewport';
import populateRust from './ui/rust';
import showStory from './ui/dialog';


const riderStats = document.getElementById('rider-stats');

const elemET = document.getElementById('stat-elapsedTime');
const elemKJ = document.getElementById('stat-energy');
const elemHeight = document.getElementById('stat-height');

const elemStatus = document.getElementById('stat-status');

const ed = document.getElementById('elevator');

window.electronAPI.initializeGame((event, data) => {
    showStory(data);
});


window.electronAPI.handlePlayer((event, player) => {

    riderStats.innerText = `Power: ${player.stream.state.power}  Cadence: ${player.stream.state.cadence}`;
})


window.electronAPI.handleMilestone((event, args)  => {
    showStory(args);
});

window.electronAPI.handleRide((event, value) => {

    const et = value.elapsedTime;
    const duration = moment.duration(et);
    elemET.innerText = duration.minutes() + ':' + duration.seconds().toString().padStart(2, '0');
    elemKJ.innerText = `Energy: ${value.kJ.toFixed(2)} kJ`;
});

function createBattery(label, name, charge) {
    const batteryHTML = `
    <div class="label">${label}</div>
    <div class="progress charging">
    <div class="track" data-charge="${charge}">
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
    placeholder.id = name;
    placeholder.innerHTML = batteryHTML;

    return placeholder;

}


window.electronAPI.handleElevator((event, elevator) => {
    elemHeight.innerText = `Height: ${Math.round(elevator.height)} m`;
    elemStatus.innerHTML = `Status: ${elevator.status}`;
    if (elevator.status == 'charging') {
        ed.classList.add('powered-down');
    } else {
        ed.classList.remove('powered-down');
        updateViewport('spaceView', elevator.height);
    }

    const rustbox = document.getElementById('rustbox');
    if (rustbox.children.length < elevator.rust) {
        populateRust(elevator.rust - rustbox.children.length);
    }

    const batteryBox = document.getElementById('batteries');
    // look for existing system gauges
    for (let i = 0; i < elevator.systems.length; i++) {
        let system = elevator.systems[i];
        let gauge = batteryBox.querySelector('#' + system.id);
        const chargePCT = system.power.charge / system.power.capacity * 100;

        // check if it already exists
        if (!gauge) {
            gauge = createBattery(system.label, system.id, chargePCT);
            batteryBox.appendChild(gauge)
        }

        gauge.querySelector('.track').width = chargePCT + '%';

        if (gauge.dataset.charge == chargePCT) { 
            // Not actively charging
            gauge.classList.remove('charging');
            continue;

        } else if (gauge.dataset.charge > chargePCT) {
            // discharging
            gauge.classList.remove('charging')

        } else {
            gauge.classList.add('charging');
            const trackWidth = chargePCT+ '%';
            gauge.querySelector('.track').style.width = trackWidth;
            // this really belongs elsewhere
            if (system.id == 'life-support') ed.style.filter = `brightness(${chargePCT}%)`;
        }
    }

})

