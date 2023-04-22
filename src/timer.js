class Timer {
    constructor(milliseconds, startedAt = false) {
        this.ms = milliseconds;
        this.initialized = new Date(Date.now());
        this.offset = this.initialized.getTimezoneOffset() * 60 * 1000;

        if (!startedAt) {
            this.startedAt = new Date(0) ;
        } else {
            this.startedAt = new Date(Date.now());
        }
        this.endsAt = new Date(this.startedAt.getTime() + this.ms);
    }
    years() {
        return this.endsAt.getUTCFullYear() - 1970;
    }
    months() {
        return this.endsAt.getUTCMonth();
    }
    days() {
        return this.endsAt.getUTCDay();
    }
    hours() { 
        return this.endsAt.getUTCHours();
    }
    minutes() {
        return this.endsAt.getUTCMinutes();
    }
    seconds() {
        return this.endsAt.getUTCSeconds();
    }
   
}


export { Timer }