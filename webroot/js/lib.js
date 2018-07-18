
export function FromNowAgo(timeString) {
	let time = new Date(timeString).getTime();

	if(time <= 0) {
		return 'NaN';
	}

	time = (new Date().getTime()) - time;

	time /= 1000;
	if (Math.abs(time) < 60) {
		return Math.round(time) + ' s';
	}
	time /= 60;
	if (Math.abs(time) < 60) {
		return Math.round(time) + ' m';
	}
	time /= 60;
	if (Math.abs(time) < 24) {
		return Math.round(time) + ' h';
	}
	time /= 24;
	return Math.round(time) + ' d';
}


/// Suppresses multiple rapid calls to a function, and instead calls the target function when a timeout has elapsed.
export class Debouncer {
	constructor (timeoutMsec, description) {
		this.timeoutMsec = timeoutMsec;
		this.desc = description;

		this.timer = null;
		this.numCallsSkipped = 0;
	}

	run (actualFunction) {
		if (this.timer == null) {
			actualFunction();
			this.timer = window.setTimeout(() => {
				this.timer = null;
				if (this.numCallsSkipped > 0) {
					console.log("skipped " + this.numCallsSkipped + " " + this.desc + " calls; running " + this.desc + " now");
					this.numCallsSkipped = 0;
					this.run(actualFunction);
				}
			}, this.timeoutMsec);
		} else {
			this.numCallsSkipped++;
		}
	}
};
