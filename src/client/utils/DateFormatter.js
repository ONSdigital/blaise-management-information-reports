import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
export default function subtractYears(numOfYears, date = new Date()) {
    return dayjs(date).subtract(numOfYears, "year").toDate();
}
export function formatDate(date) {
    return dayjs(date).tz("Europe/London").format("DD/MM/YYYY");
}
export function formatDateAndTime(date) {
    return dayjs(date).tz("Europe/London").format("DD/MM/YYYY HH:mm:ss");
}
export function formatISODate(date) {
    return dayjs(date).tz("Europe/London").format("YYYY-MM-DD");
}
//# sourceMappingURL=DateFormatter.js.map