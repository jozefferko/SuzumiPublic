import { FSLocaleString } from "../common/types/firestore";

export const localeStringFill = (s: FSLocaleString): FSLocaleString => ({
    en: s.en ? s.en : s.dk,
    dk: s.dk ? s.dk : s.en,
});
