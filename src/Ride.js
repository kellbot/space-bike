class Ride {
    // start time - time in milliseconds
    constructor(startTime){
        this.startTime = startTime;
        this.elapsedTime = 0;
        this.lastUpdated = startTime;
        this.kJ = 0;
    }

    updateTime(timeNow) {
        this.elapsedTime = timeNow - this.startTime;
        this.lastUpdated = timeNow;
    }

    //duration in milliseconds, power in watts
    // returns energy delta 
    updateEnergy(timeNow, power) {
        const duration = timeNow - this.lastUpdated;
        //1 joule = 1 watt-second
        const joules = power * (duration/1000);
        this.kJ = this.kJ + joules / 1000;
        this.updateTime(timeNow);
        return joules / 1000;
    }

}

module.exports =  Ride;