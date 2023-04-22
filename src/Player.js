class Player {
    constructor() {
        this.profile = {
            units: "metric"
        }
    }

    updateStream(data) {
        this.stream = data;
    }
}

module.exports =  Player;