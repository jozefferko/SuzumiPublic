import auth from '@react-native-firebase/auth';
import _ from 'lodash/fp';
import {Maybe, MaybeAsync} from 'purify-ts';
import {FSPathMap} from '../common/types/firestore';
import {fsUpload, fsUploadType} from '../common/utils/firestore/queries';
import {tapLog} from '../common/utils/fp';
import {phoneConfirm} from './useFASignIn';

// .catch((error) => {
//     error.code === 'provider-already-linked'
//         ? user.delete().then((result) =>
//             confirmation
//                 .confirm(code)
//                 .then((c) => {
//                     Maybe.fromNullable(
//                         c,
//                     ).map((safeC) =>
//                         safeC.user
//                             .linkWithCredential(
//                                 credential,
//                             )
//                             .catch(console.log),
//                     );
//                 }),
//         )
//         : null;
// }),

const errorMessageParser = (err: {code: string}): string =>
    _.flow(
        ($: {code: string}) => $.code,
        _.cond<string, string>([
            [
                _.equals('auth/invalid-phone-number'),
                _.always('Phone number is invalid.'),
            ],
            [
                _.equals('auth/missing-phone-number'),
                _.always('Phone number is required.'),
            ],
            [
                _.equals('auth/quota-exceeded'),
                _.always('Too many requests, try again later.'),
            ],
            [
                _.equals('auth/user-disabled'),
                _.always('Your account has been disabled.'),
            ],
            [
                _.equals('auth/invalid-verification-code'),
                _.always('Incorrect verification code.'),
            ],
            [
                _.equals('auth/provider-already-linked'),
                _.always('You are already using this sign in option.'),
            ],
            [
                _.equals('auth/credential-already-in-use'),
                _.always('Already in use.'),
            ],
            [_.stubTrue, _.always('Unknown error occured.')],
        ]),
    )(err);

export const useAddPhoneNumber = (errorCallback: (s: string) => any) => {
    const addPhoneNumber = (phoneNumber: string): Promise<phoneConfirm> =>
        auth()
            .verifyPhoneNumber(phoneNumber)
            .then((confirmation) => (code: string) =>
                MaybeAsync.liftMaybe(Maybe.fromNullable(auth().currentUser))
                    .chain((user) =>
                        user
                            .linkWithCredential(
                                auth.PhoneAuthProvider.credential(
                                    confirmation.verificationId,
                                    code,
                                ),
                            )
                            .then(($) => {
                                console.log('good', $);
                                console.log('good');
                                return $;
                            })
                            .then((newUser) =>
                                fsUpload({
                                    path: FSPathMap.users.doc(newUser.user.uid),
                                    type: fsUploadType.update,
                                    data: {
                                        phoneNumber:
                                            newUser.user.phoneNumber || '',
                                    },
                                }),
                            )
                            .then(Maybe.of)
                            .catch(($: {code: string}) =>
                                $.code === 'auth/credential-already-in-use'
                                    ? auth().signInWithCredential(
                                          auth.PhoneAuthProvider.credential(
                                              confirmation.verificationId,
                                              code,
                                          ),
                                      )
                                    : _.flow(
                                          tapLog('confirmCode'),
                                          errorMessageParser,
                                          errorCallback,
                                          Maybe.empty,
                                      )($),
                            ),
                    )
                    .run(),
            )
            .catch((err) => {
                _.flow(errorMessageParser, errorCallback)(err);
                throw err;
            });

    return {
        addPhoneNumber,
    };
};

export const addSocialProvider = () => {};
