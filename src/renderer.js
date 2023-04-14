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

const cabin = document.getElementById('main-cabin');
const counter = document.getElementById('counter')

window.electronAPI.handlePlayer((event, value) => {

    cabin.innerText = `Power: ${value.state.power}  Cadence: ${value.state.cadence}`;
})

const stats = document.getElementById('stats')

window.electronAPI.handleRide((event, value) => {

    const et = value.elapsedTime;
    const duration = moment.duration(et);
    stats.innerText = duration.hours() + ':' + duration.seconds().toString().padStart(2, '0');
    stats.innerText += `\nEnergy: ${value.kJ} kJ`;
})

console.log('👋 This message is being logged by "renderer.js", included via webpack');
