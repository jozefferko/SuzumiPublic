import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import _ from 'lodash/fp';
import {Maybe} from 'purify-ts';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {Static} from 'runtypes';
import {FSLocale, FSRestaurant} from '../../common/types/firestore';
import {broadcastTopic, unicastTopic} from '../../common/types/misc';
import {trigger} from '../../common/utils/fp';
import {RootState} from '../../redux';
import {useSafeSelector} from '../../redux/selectors';
import {
    setFcmTopic,
    setSettings,
    SettingsSliceState,
} from '../../redux/settingsSlice';
import {FAuthUser} from '../../redux/userSlice';

//
// const createUserDoc = (authData: signedInState) => (
//     restaurant: Static<typeof FSRestaurant>,
// ): Static<typeof FSUser> => ({
//     id: '',
//     email: authData.email,
//     fcm: {},
//     referralCount: 0,
//     referredBy: '',
//     balance: restaurant.achievements[0].tiers[0].reward,
//     phoneNumber: authData.phoneNumber,
//     created: serverTimestamp(),
//     flags: {},
//     photoUrl: '',
//     displayName: authData.displayName,
//     expiryDate: currentDay(restaurant.expiry.expire.days),
//     searchIndex: stubSearchIndex(),
//     achievementStatus: {
//         0: {
//             progress: 1,
//             claimed: 1,
//         },
//     },
//     birthday: undefined,
// });
const createFAuthUser = (user: FirebaseAuthTypes.User): FAuthUser => ({
    id: user.uid,
    phoneNumber: user.phoneNumber || '',
    photoUrl: user.photoURL || '',
    displayName: user.displayName || '',
    email: user.email || '',
});
// const createUserCreateTransaction = (userId: string) => (
//     signUpBonus: number,
// ): Static<typeof FSTransaction> => ({
//     id: '',
//     plainRef: {en: 'sign up bonus', dk: 'singuppebonuse'},
//     amount: signUpBonus,
//     user: userId,
//     ref: userId,
//     type: 'creation',
//     timestamp: serverTimestamp(),
// });
const signUpBonusPicker = (restaurant: Static<typeof FSRestaurant>): number =>
    restaurant.signUpBonus;
const largerThanZeroPredicate = (num: number): boolean => num > 0;
// const createFSUser = (authData: signedInState) =>
//     fsRunTransaction((transaction) =>
//         transaction
//             .exists(FSPathMap.users.doc(authData.id))
//             .chain(
//                 _.flow(
//                     Maybe.fromPredicate(_.equals(false)),
//                     MaybeAsync.liftMaybe,
//                 ),
//             )
//             .chain(() => transaction.get(FSPathMap.restaurant))
//             .map(tapLog('restaurant'))
//             .map((restaurant) =>
//                 transaction
//                     .set(FSPathMap.transactions)({
//                         id: '',
//                         amount: restaurant.achievements[0].tiers[0].reward,
//                         user: authData.id,
//                         ref: authData.id,
//                         plainRef:
//                             restaurant.achievements[0].tiers[0].displayName,
//                         type: 'achievement',
//                         timestamp: serverTimestamp(),
//                     })
//                     .set(FSPathMap.users.doc(authData.id))(
//                     searchIndexUser(createUserDoc(authData)(restaurant)),
//                 ),
//             )
//             .map(($) => true)
//             .run(),
//     );

export default () => {
    const d = useDispatch();

    const safeSettings = useSafeSelector<Static<typeof SettingsSliceState>>(
        (state: RootState) => state.settings,
    );

    useEffect(
        () =>
            auth().onAuthStateChanged((u) => {
                safeSettings.ifJust(async (settings) => {
                    const current = settings.fcmTopics.unicast;
                    const topicLanguages: Static<typeof FSLocale>[] = [
                        'en',
                        'dk',
                    ];
                    const topic = Maybe.fromNullable(u?.uid).mapOrDefault(
                        unicastTopic(settings.language),
                        '',
                    );
                    if (current !== topic) {
                        if (current.length > 0) {
                            await messaging().unsubscribeFromTopic(current);
                        }
                        if (topic.length > 0) {
                            await messaging().subscribeToTopic(topic);
                        }
                        _.flow(($) => ({unicast: $}), setFcmTopic, d)(topic);
                    }
                });
            }),
        [d, safeSettings],
    );

    useEffect(() => {
        const topicLanguages: Static<typeof FSLocale>[] = ['en', 'dk'];
        safeSettings.ifJust((settings) => {
            if (
                settings.fcmTopics.broadcast !==
                broadcastTopic(settings.language)
            ) {
                Promise.all(
                    topicLanguages
                        .filter((lang) => lang !== settings.language)
                        .map((lang) =>
                            messaging().unsubscribeFromTopic(
                                broadcastTopic(lang),
                            ),
                        ),
                )
                    .then(() =>
                        messaging().subscribeToTopic(
                            broadcastTopic(settings.language),
                        ),
                    )
                    .then(
                        trigger(
                            _.flow(
                                broadcastTopic,
                                ($) => ({broadcast: $}),
                                setFcmTopic,
                                d,
                            ),
                        )(settings.language),
                    );
            }
        });
    }, [d, safeSettings]);

    useEffect(() => {
        safeSettings.ifJust((settings) => {
            messaging()
                .requestPermission({
                    provisional: true,
                })
                .then((authStatus) => {
                    const enabled =
                        authStatus ===
                            messaging.AuthorizationStatus.AUTHORIZED ||
                        authStatus ===
                            messaging.AuthorizationStatus.PROVISIONAL;

                    if (enabled !== settings.notifications) {
                        console.log('notifications', enabled);
                        d(setSettings({notifications: enabled}));
                    }
                });
        });
    }, [d, safeSettings]);
};
