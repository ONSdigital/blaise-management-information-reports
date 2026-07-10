import { convertSecondsToMinutesAndSeconds } from "./Converters";

test("test 60 seconds is converted to 01:00", () => {
    expect(convertSecondsToMinutesAndSeconds(60)).toBe("01:00");
});

test("test 61 seconds is converted to 01:01", () => {
    expect(convertSecondsToMinutesAndSeconds(61)).toBe("01:01");
});

test("test 120 seconds is converted to 02:00", () => {
    expect(convertSecondsToMinutesAndSeconds(120)).toBe("02:00");
});

test("test 121 seconds is converted to 02:01", () => {
    expect(convertSecondsToMinutesAndSeconds(121)).toBe("02:01");
});

test("test 3600 seconds is converted to 60:00", () => {
    expect(convertSecondsToMinutesAndSeconds(3600)).toBe("60:00");
});

test("test 3601 seconds is converted to 60:01", () => {
    expect(convertSecondsToMinutesAndSeconds(3601)).toBe("60:01");
});

test("test 0 seconds is converted to 00:00", () => {
    expect(convertSecondsToMinutesAndSeconds(0)).toBe("00:00");
});
