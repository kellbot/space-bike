class Player {
    constructor() {
        this.profile = {
            units: "metric"
        }
    }

    updateState(data) {
        this.state = data;
    }
}

export default Player;