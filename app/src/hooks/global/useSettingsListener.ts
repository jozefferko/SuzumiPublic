import {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Static} from 'runtypes';
import {RootState} from '../../redux';
import {useSafeSelector} from '../../redux/selectors';
import {
    hydrateSettings,
    setSettings,
    SettingsSliceState,
} from '../../redux/settingsSlice';
import {useLocale} from '../useLocale';
import {usePersistentRedux} from '../usePersistentRedux';
import * as RNLocalize from 'react-native-localize';

const settingsSliceInitial: Static<typeof SettingsSliceState> = {
    hideFeedback: false,
    lastOfferSeen: 0,
    language:
        RNLocalize.findBestAvailableLanguage(['en', 'dk'])?.languageTag ?? 'en',
    daysOpened: {lastDate: new Date().getTime(), streak: 1},
    firstOpen: true,
    fcmTopics: {
        unicast: '',
        broadcast: '',
    },
    notifications: false,
};

const datesAreOnSameDay = (first: Date, second: Date): boolean =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
const dateIsYesterday = (d: Date): boolean => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return datesAreOnSameDay(yesterday, d);
};

const settingsSelector = (state: RootState) => state.settings;

export default () => {
    const d = useDispatch();
    usePersistentRedux<Static<typeof SettingsSliceState>>(
        'settings',
        settingsSliceInitial,
        SettingsSliceState,
        settingsSelector,
        hydrateSettings,
    );

    const latestOpened = useSelector(
        (state: RootState) => state.settings?.daysOpened,
    );
    // useEffect(() => {
    //     return () => {
    //         logUsage;
    //     };
    // }, [latestOpened]);
    useEffect(() => {
        if (latestOpened) {
            const logStreak = () => {
                if (
                    !datesAreOnSameDay(
                        new Date(),
                        new Date(latestOpened.lastDate),
                    )
                ) {
                    d(
                        setSettings({
                            daysOpened: {
                                lastDate: new Date().getTime(),
                                streak: dateIsYesterday(
                                    new Date(latestOpened.lastDate),
                                )
                                    ? latestOpened.streak + 1
                                    : 1,
                            },
                        }),
                    );
                }
            };
            logStreak();
            const secTimer = setInterval(logStreak, 10000);

            return () => clearInterval(secTimer);
        }
    }, [d, latestOpened]);

    const {i18n} = useLocale();
    const safeLanguage = useSafeSelector<'en' | 'dk'>(
        (s) => s.settings?.language,
    );
    useEffect(() => {
        safeLanguage.ifJust((language) => i18n.changeLanguage(language));
    }, [i18n, safeLanguage]);
};
