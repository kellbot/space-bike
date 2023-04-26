import  {updateViewport} from './ui/viewport.js';
import {populateRust} from './ui/rust.js';
import {showStory} from './ui/dialog.js';
import {Timer} from './timer.js';


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
    const duration = new Timer(et);
    elemET.innerText = `${duration.hours().toString().padStart(2, 0)}:${duration.minutes().toString().padStart(2, 0)}:${duration.seconds().toString().padStart(2, 0)}`;
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