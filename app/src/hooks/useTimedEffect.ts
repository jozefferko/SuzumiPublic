import {useEffect} from 'react';

export const useTimedEffect = (
    callback: () => void,
    frequency: number = 500,
) => {
    useEffect(() => {
        callback();
        const timer = setInterval(callback, frequency);
        return () => clearInterval(timer);
    }, [frequency, callback]);
};
