// eslint-disable-next-line import/prefer-default-export
export function convertSecondsToMinutesAndSeconds(seconds: number): string {
    const convertedMinutes = (`0${Math.floor(seconds / 60)}`).slice(-2);
    const convertedSeconds = (`0${seconds - (Math.floor(seconds / 60) * 60)}`).slice(-2);
    return `${convertedMinutes}:${convertedSeconds}`;
}
