import {useEffect, useState} from 'react';
import {FSTimestamp} from '../common/types/firestore';
const padNumber = (n: number): string => n.toString().padStart(2, '0');

const formatTimeUntil = (expiryTimestamp: FSTimestamp): string => {
    const expiryDate = new Date(expiryTimestamp.seconds * 1000);
    // expiryDate.setDate(expiryDate.getDate() + offer.daysActive);
    expiryDate.setHours(0);
    expiryDate.setMinutes(0);
    expiryDate.setSeconds(0);

    const currentDate = new Date();

    var delta = Math.abs(expiryDate.getTime() - currentDate.getTime()) / 1000;

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    var seconds = Math.floor(delta % 60);
    return `${padNumber(days)} : ${padNumber(hours)} : ${padNumber(
        minutes,
    )} : ${padNumber(seconds)}`;
};

export const useTimeUntil = (date: FSTimestamp): string => {
    const [formatted, setFormatted] = useState<string>('');
    useEffect(() => {
        const secTimer = setInterval(() => {
            setFormatted(formatTimeUntil(date));
        }, 500);
        return () => clearInterval(secTimer);
    }, [date]);

    return formatted;
};
