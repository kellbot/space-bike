class Elevator {
    constructor(saveData = false) {
        if (!saveData) {
            this.phase = 1;
            this.height = 0;
            this.batteries = [];
            this.players = [];
            this.mass = 100; //kg
            this.status = 'stopped';

            this.addBattery('basic');
        } else {
            this.phase = saveData.phase;
            this.height = saveData.height;
            this.batteries = saveData.batteries;
            this.players = saveData.players;
            this.mass = saveData.mass;
            this.status = 'stopped';
        }
    }

    addBattery(type) {
        this.batteries.push(new Battery(type));
    }

    fullBatteries() {
        for (let i = 0; i < this.batteries.length; i++) {
            let battery = this.batteries[i];
            if (battery.charge < battery.capacity) return false;
        }
        return true;
    }

    getTotalMass() {
        return this.mass; //TODO: add player mass
    }

    // raise the height based on the power provided (kJ)
    ascend(power) {
        if (Number.isNaN(power)) {
            console.log("Error: power is not a number");
            return;
        }
        this.status = 'climbing';
        this.height += (power * 1000) / (this.getTotalMass() * this.calculateGravity());
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

    // applies energy to the various systems in the elevator
    energize(power) {
        let remainingPower = power;
        for (let i = 0; i < this.batteries.length; i++) {
            let battery = this.batteries[i];
            if (battery.charge < battery.capacity) {
                this.status = 'charging';
                // if it's not enough power to fill the battery then use what there is and exit the loop
                if (remainingPower < battery.capacity - battery.charge) {
                    battery.charge += remainingPower;
                    remainingPower = 0;
                    break;
                } else {
                    remainingPower = remainingPower - (battery.capacity - battery.charge);
                    battery.charge = battery.capacity;
                }
            }
        }

        // use whatever's left to ascend
        if (remainingPower > 0 ) this.ascend(remainingPower);
    }
    
}

class Battery {
    // Types: basic
    constructor(type) {
        this.capacity = 100; // kJ
        this.dischargeRate = 0.5; // per hour 
        this.charge = 0;
        this.type = type;
    }
}

export default Elevator;