const EventEmitter = require('events');

class Elevator extends EventEmitter {
    constructor(saveData = false) {
        super();

        if (!saveData) {
            this.phase = 1;
            this.height = 0;
            this.batteries = [];
            this.players = [];
            this.mass = 100; //kg
            this.status = 'stopped';
            this.rust = 300;
            this.tools = [];
            this.systems = [
                {id: 'life-support', label: 'Life Support', power: new Battery('basic'), required: true}
            ];
            
        } else {
            Object.assign(this, saveData);
            this.systems.forEach(element => {
                element.power = Object.assign(new Battery('basic'), element.power);
            });
        }
    }

    // Returns a serializable object for the renderer
    data() {
        return {
            phase: this.phase,
            height: this.height,
            batteries: this.batteries,
            palyers: this.players,
            mass: this.mass,
            status: this.status,
            rust: this.rust,
            tools: this.tools,
            systems: this.systems,
        }
    }

    addBattery(type) {
        this.batteries.push(new Battery(type));
    }

    // Verify that all required systems have a full charge
    canAscend() {
        for (let i = 0; i < this.systems.length; i++) {
            let system = this.systems[i];
            if (!system.required) continue;
            if (system.power.charge < system.power.capacity) return false;
        }
        return true;
    }

    getTotalMass() {
        return this.mass + this.rust; //TODO: add player mass
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

        // First charge all required systems
        const essentialSystems = this.systems.filter(system => system.required);
        for (let i = 0; i < essentialSystems.length; i++){
            let system = this.systems[i];
            remainingPower = system.power.energize(remainingPower);
            if (remainingPower == 0) break;
        }

        // If the life support system is full for the first time then trigger launch
        if (this.height == 0 && this.canAscend()) this.emit('milestone', {title: 'first-launch'});

        // Whatever is left first charges the tools, then the batteries, the ascension
        if (remainingPower > 0 ) {
            for (let i = 0; i < this.tools.length; i++){
                let tool = this.tools[i];
                remainingPower = tool.battery.energize(remainingPower);
                if (remainingPower == 0) break;
            }
        }

        if (remainingPower > 0 ) {
            for (let i = 0; i < this.batteries.length; i++){
                let battery = this.batteries[i];
                remainingPower = battery.energize(remainingPower);
                if (remainingPower == 0) break;
            }
        }

        if (remainingPower > 0 ) {
            this.ascend(remainingPower);
        }
     }

    removeRust() {
        if (this.rust < 1) return false;
        this.rust = this.rust - 1;
        console.log(this.rust);
        return true;
    }
    
}

class Tool {
    constructor(type) {
        this.battery = new Battery('tool');
        this.energyCost = 1; //kJ
    }
    use() {
        this.battery.charge = this.battery.charge - this.energyCost;
    }
}

class Battery {
    // Types: basic
    constructor(type) {
        this.type = type;
        this.charge = 0;
         if (type == 'tool') {
            this.capacity = 10;
            this.charge = 0.5;
            this.dischargeRate = 0;
        } else { //basic
            this.capacity = 50; // kJ
            this.dischargeRate = 0.25; // per hour 
            this.charge = 0;
        }
    }
    // Takes available power and returns leftover power (if any)
    energize(availablePower) {
        const needed = (this.capacity - this.charge);
        if (availablePower < needed) {
            this.charge += availablePower;
            return 0;
        } else {
            this.charge = this.capacity;
            availablePower = availablePower - needed;
            return availablePower;
        }
    }
}

module.exports = Elevator;