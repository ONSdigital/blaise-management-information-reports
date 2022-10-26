function convertSecondsToMinutesAndSeconds(seconds: number): string {
    const convertedMinutes = (`0${Math.floor(seconds / 60)}`).slice(-2);
    const convertedSeconds = (`0${seconds - Math.floor(seconds / 60) * 60}`).slice(-2);
    return `${convertedMinutes}:${convertedSeconds}`;
}

export { convertSecondsToMinutesAndSeconds };
