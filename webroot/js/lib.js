
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
