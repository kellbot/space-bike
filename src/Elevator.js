class Elevator {
    constructor() {
        this.phase = 1;
        this.height = 0;
        this.batteries = [];
        this.players = [];
        this.mass = 100; //kg

        this.addBattery('basic');
    }

    addBattery(type) {
        this.batteries.push(new Battery(type));
    }

    getTotalMass() {
        return this.mass; //TODO: add player mass
    }

    // raise the height based on the power provided (kJ)
    ascend(power) {
        if (power.isNaN()) {
            console.log("Error: power is not a number");
            return;
        }
        const height = (power * 1000) / (this.getTotalMass() * this.calculateGravity());

    }

    // height in meters
    calculateGravity() {
        const G = 6.6743 * Math.pow(10,-11);
        const M = 5.9722 * Math.pow(10,24); //mass of earth in kg
        const R = 6.371 * Math.pow(10,6); //radius of earth in m
    
        //G M / R^2
        const gravity = G * M / Math.pow(R + this.height, 2); 
        return gravity;
    }
    
}

class Battery {
    // Types: basic
    constructor(type) {
        this.capacity = 100; // kJ
        this.dischargeRate = 0.5; // per hour 
    }
}