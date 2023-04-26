const electron = require('electron');
const path = require('path');
const fs = require('fs');

class Ride {
    // start time - time in milliseconds
    constructor(){
        this.initTime = Date.now();
        this.elapsedTime = 0;
        this.lastUpdated = Date.now();
        this.kJ = 0;
        this.started = false;
    }

    // begin recording ride data
    start() {
        this.startTime = Date.now();
        this.started = true;
    }

    updateTime() {
        this.elapsedTime = Date.now() - this.startTime;
        this.lastUpdated = Date.now();
    }

    //duration in milliseconds, power in watts
    // returns energy delta 
    updateEnergy(duration, power) {
        //1 joule = 1 watt-second
        const joules = power * (duration/1000);
        this.kJ = this.kJ + joules / 1000;
        this.updateTime();
        return joules / 1000;
    }

    save() {
        const userDataPath = (electron.app || electron.remote.app).getPath('userData');
        const ridesFolder = path.join(userDataPath, 'rides');
        const path = path.join(ridesFolder, this.initTime.toString() + '.json');
        if (!fs.existsSync(ridesFolder)){
            fs.mkdirSync(ridesFolder);
        }
        fs.writeFileSync(path, JSON.stringify(this));
    }


}

module.exports =  Ride;