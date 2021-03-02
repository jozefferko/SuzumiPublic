import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {dk} from './dk';
import {en} from './en';

// console.log('translate', dk);
i18n.use(initReactI18next).init(
    {
        lng: 'en',
        fallbackLng: 'en',
        // debug: true,
        resources: {
            en,
            dk,
        },
    }
);
export default i18n;
