import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import _ from 'lodash/fp';
import {Maybe} from 'purify-ts';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Static} from 'runtypes';
import {FSPathMap, FSRestaurant, FSUser} from '../../common/types/firestore';
import {fsListener} from '../../common/utils/firestore/listeners';
import {fsUpload, fsUploadType} from '../../common/utils/firestore/queries';
import {createFSUser} from '../../common/utils/firestore/userOperations';
import {nothingLog} from '../../common/utils/fp';
import {RootState} from '../../redux';
import {useSafeSelector} from '../../redux/selectors';
import {SettingsSliceState} from '../../redux/settingsSlice';
import {
    clearUser,
    FAuthUser,
    loadedState,
    setUserData,
    signInUser,
    UserStatus,
} from '../../redux/userSlice';
import {useFASignIn} from '../useFASignIn';
import {useSafeState} from '../useSafeState';

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
    const user = useSelector((state: RootState) => state.user);
    const restaurant = useSafeSelector<Static<typeof FSRestaurant>>(
        (state: RootState) => state.restaurant,
    );
    const safeSettings = useSafeSelector<Static<typeof SettingsSliceState>>(
        (state: RootState) => state.settings,
    );

    const [phone, setPhone] = useState('');
    const [fAuthUser, setFAuthUser] = useSafeState<FAuthUser>();
    useEffect(
        () =>
            auth().onAuthStateChanged((u) => {
                Maybe.fromNullable(u)
                    .ifNothing(() => {
                        d(clearUser());
                    })
                    .ifNothing(() => setPhone(''))
                    .ifJust(_.flow(($) => $.phoneNumber || '', setPhone))
                    .ifJust(_.flow(createFAuthUser, setFAuthUser))
                    .ifJust(_.flow(createFAuthUser, signInUser, d));
            }),
        [setFAuthUser, d],
    );
    useEffect(
        () =>
            user.id
                ? fsListener({
                      path: FSPathMap.users.doc(user.id),
                      callback: (data: Maybe<Static<typeof FSUser>>) =>
                          data
                              .ifJust(_.flow(setUserData, d))
                              .ifNothing(() => {
                                  createFSUser(
                                      user.id,
                                      user.email,
                                      user.phoneNumber,
                                      user.displayName,
                                  );
                                  // restaurant.ifJust(
                                  //     _.flow(
                                  //         signUpBonusPicker,
                                  //         createUserDoc(user as signedInState),
                                  //         setUserData,
                                  //         d,
                                  //     ),
                                  // );
                              })
                              .ifNothing(nothingLog('userCallback')),
                  })
                : () => {},

        [d, user, restaurant],
    );
    useEffect(() => {
        Maybe.fromNullable<loadedState>(
            user.status === UserStatus.loaded ? user : null,
        )
            .chain(
                Maybe.fromPredicate(
                    (fsUser) =>
                        phone.length > 0 && fsUser.phoneNumber !== phone,
                ),
            )
            .ifJust((fsUser) =>
                fsUpload({
                    path: FSPathMap.users.doc(fsUser.id),
                    type: fsUploadType.update,
                    data: {phoneNumber: phone},
                }),
            );
    }, [user, phone]);

    const {signOut} = useFASignIn(() => {});
    useEffect(() => {
        Maybe.fromNullable<loadedState>(
            user.status === UserStatus.loaded ? user : null,
        )
            .filter(_.flow(($) => $.flags, _.includes('deleted')))
            .ifJust(signOut);
    }, [user, signOut]);
};
