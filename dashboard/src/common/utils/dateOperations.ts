import { Static } from "runtypes";
import { FSBirthday, FSTimestamp } from "../types/firestore";

function formatDate(date: Date, format: string, utc: boolean) {
    let MMMM = [
        "\x00",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    let MMM = [
        "\x01",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    let dddd = [
        "\x02",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    let ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function ii(i: number, len?: number) {
        let q = i + "";
        len = len || 2;
        while (q.length < len) q = "0" + q;
        return q;
    }

    let y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    let M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    let d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    let H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    let h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    let m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    let s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    let f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    let T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    let t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    let tz = -date.getTimezoneOffset();
    let K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc) {
        tz = Math.abs(tz);
        let tzHrs = Math.floor(tz / 60);
        let tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    let day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
}

export const formatFSTimestamp = (
    timestmap: Static<typeof FSTimestamp>,
    showTime: boolean = false
): string =>
    formatDate(
        new Date(1000 * timestmap.seconds),
        showTime ? "HH:mm dd/MM/yy" : "dd/MM/yy",
        false
    );
// (showTime
//     ? new Date(1000 * timestmap.seconds).toLocaleTimeString('en-GB') + ' '
//     : '') + new Date(1000 * timestmap.seconds).toLocaleDateString('en-GB');

export const dateToFSTimestamp = (date: Date): FSTimestamp => ({
    seconds: date.getTime() / 1000,
    nanoseconds: 0,
});

export const secondsSinceFSTimestamp = (
    timestmap: Static<typeof FSTimestamp>
): number =>
    Math.floor(
        (new Date().getTime() - new Date(1000 * timestmap.seconds).getTime()) /
            1000
    );

export const fsTimestampComparator = (asc: boolean = true) => (
    a: Static<typeof FSTimestamp>,
    b: Static<typeof FSTimestamp>
) =>
    (asc ? 1 : -1) *
    (numberCompare(a.seconds, b.seconds) !== 0
        ? numberCompare(a.seconds, b.seconds)
        : numberCompare(a.nanoseconds, b.nanoseconds));

const numberCompare = (a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0);

export const fsTimestampEquals = (
    a: Static<typeof FSTimestamp>,
    b: Static<typeof FSTimestamp>
) => a.seconds === b.seconds && a.nanoseconds === b.nanoseconds;
export const currentDay = (
    addMonths: number = 0
): Static<typeof FSTimestamp> => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() + addMonths);
    return { seconds: date.getTime() / 1000, nanoseconds: 0 };
};

export const daysUntilTimestamp = (timestamp: FSTimestamp): number => {
    return Math.floor((timestamp.seconds - currentDay().seconds) / 86400);
};
export const addToTimestamp = (args: { days?: number; months?: number }) => (
    timestamp: FSTimestamp
): Static<typeof FSTimestamp> => {
    const date = new Date(1000 * timestamp.seconds);
    date.setMonth(date.getMonth() + (args.months ?? 0));
    date.setDate(date.getDate() + (args.days ?? 0));
    return { seconds: date.getTime() / 1000, nanoseconds: 0 };
};

export const fsBirthdayToDate = (birthday: Static<typeof FSBirthday>): Date =>
    new Date(birthday.year, birthday.month - 1, birthday.day, 0, 0, 0);

export const dateToFSBirthday = (date: Date): Static<typeof FSBirthday> => ({
    year: date.getFullYear(),
    day: date.getDate(),
    month: date.getMonth() + 1,
});

export const withinMonthsPredicate = (months: number) => (
    timestamp: FSTimestamp
): boolean => {
    const d = new Date();
    d.setMonth(d.getMonth() - months);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    const seconds = d.getTime() / 1000;
    return timestamp.seconds > seconds;
};
