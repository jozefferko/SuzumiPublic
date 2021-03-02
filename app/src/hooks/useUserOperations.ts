import auth from '@react-native-firebase/auth';
import _ from 'lodash/fp';
import {Maybe, MaybeAsync} from 'purify-ts';
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

export const useUserOperations = (errorCallback: (s: string) => any) => {
    const updatePhoneNumber = (phoneNumber: string): Promise<phoneConfirm> =>
        auth()
            .verifyPhoneNumber(phoneNumber)
            .then((confirmation) => (code: string) =>
                MaybeAsync.liftMaybe(Maybe.fromNullable(auth().currentUser))
                    .chain((user) =>
                        user
                            .updatePhoneNumber(
                                auth.PhoneAuthProvider.credential(
                                    confirmation.verificationId,
                                    code,
                                ),
                            )
                            // .then((user) =>
                            //     fsUpload({
                            //         path: FSPathMap.users.doc(user.user.uid),
                            //         type: fsUploadType.update,
                            //         data: {
                            //             phoneNumber:
                            //                 user.user.phoneNumber || '',
                            //         },
                            //     }),
                            // )
                            // .then(Maybe.of)
                            .catch(
                                _.flow(
                                    tapLog('confirmCode'),
                                    errorMessageParser,
                                    errorCallback,
                                    Maybe.empty,
                                ),
                            ),
                    )
                    .run(),
            )
            .catch(_.flow(tapLog('signIn'), errorMessageParser, errorCallback));

    return {
        updatePhoneNumber,
    };
};

export const addSocialProvider = () => {};
