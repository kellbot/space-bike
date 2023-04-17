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

export default Player;