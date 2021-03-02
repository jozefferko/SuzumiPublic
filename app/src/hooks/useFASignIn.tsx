import appleAuth from '@invertase/react-native-apple-authentication';
import {GoogleSignin} from '@react-native-community/google-signin';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import _ from 'lodash/fp';
import {Maybe} from 'purify-ts';
import {useCallback} from 'react';
import {AccessToken, LoginManager} from 'react-native-fbsdk';
import {useDispatch} from 'react-redux';
import {booleanify, tapLog} from '../common/utils/fp';
import {setSocialCredential} from '../redux/userSlice';
import 'react-native-get-random-values';

export type phoneConfirm = (arg: string) => Promise<void>;

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
            ], //TODO:put in a different error for Unknown error
            [_.stubTrue, _.identity],
        ]),
    )(err);

export const useFASignIn = (errorCallback: (s: string) => any) => {
    const d = useDispatch();
    // const [authError, errorCallback] = useSafeState<string>();
    // const authError = (type: string, message: string) => {
    //     d(setAuthFlowError({type: type, message: message}));
    // };

    const signInWithEmailAndPassword = useCallback(
        (email: string, password: string) => {
            auth()
                .signInWithEmailAndPassword(email, password)
                .catch((error) => {
                    console.log(error);
                    switch (error.code) {
                        case 'auth/invalid-email':
                            errorCallback('Invalid email address.');
                            break;
                        case 'auth/user-disabled':
                            errorCallback('This account has been disabled.');
                            break;
                        case 'auth/user-not-found':
                        case 'auth/wrong-password':
                            errorCallback(
                                'Please check your email and password.',
                            );
                            break;
                        default:
                            errorCallback('Login failed');
                    }
                });
        },
        [errorCallback],
    );

    const signInWithApple = useCallback(async () => {
        // const rawNonce = uuid();
        // appleAuthAndroid.configure({
        //     // The Service ID you registered with Apple
        //     clientId: 'com.swoopmenu.ardent',
        //
        //     // Return URL added to your Apple dev console. We intercept this redirect, but it must still match
        //     // the URL you provided to Apple. It can be an empty route on your backend as it's never called.
        //     redirectUri: 'https://ardent-2d15a.firebaseapp.com/__/auth/handler',
        //
        //     // The type of response requested - code, id_token, or both.
        //     responseType: appleAuthAndroid.ResponseType.ALL,
        //
        //     // The amount of user information requested from Apple.
        //     scope: appleAuthAndroid.Scope.ALL,
        //
        //     // Random nonce value that will be SHA256 hashed before sending to Apple.
        //     nonce: rawNonce,
        // });
        console.log('signing in ');
        try {
            // (Platform.OS === 'ios'?
            Maybe.fromNullable(
                await appleAuth.performRequest({
                    requestedOperation: appleAuth.Operation.LOGIN,
                    requestedScopes: [
                        appleAuth.Scope.EMAIL,
                        appleAuth.Scope.FULL_NAME,
                    ],
                }),
            )
                .filter(_.flow(($) => $.identityToken, booleanify))
                //     : Maybe.fromNullable(
                //           await appleAuthAndroid.signIn(),
                //       ).chainNullable(($) => $.id_token)
                // )
                .ifJust(tapLog('response'))
                .ifNothing(() => {
                    errorCallback('Something went wrong');
                })
                .map((response) =>
                    auth.AppleAuthProvider.credential(
                        response.identityToken,
                        response.nonce,
                    ),
                )
                .ifJust(_.flow(setSocialCredential, d))
                .map((cred) => auth().signInWithCredential(cred))
                .ifJust((promise) => {
                    promise.catch(
                        _.flow(
                            tapLog('appleSignIn'),
                            errorMessageParser,
                            errorCallback,
                        ),
                    );
                });
        } catch (err) {
            console.log(err);
        }
    }, [errorCallback, d]);

    const signInWithGoogle = useCallback(async () => {
        // Get the users ID token
        Maybe.fromNullable(await GoogleSignin.signIn())
            .ifNothing(() => {
                errorCallback('Something went wrong');
            })
            .map((user) => auth.GoogleAuthProvider.credential(user.idToken))
            .ifJust(_.flow(setSocialCredential, d))
            .map((cred) => auth().signInWithCredential(cred))
            .ifJust((promise) => {
                promise.catch(
                    _.flow(
                        tapLog('googleSignIn'),
                        errorMessageParser,
                        errorCallback,
                    ),
                );
            });
    }, [errorCallback, d]);

    const signInWithFacebook = useCallback(async () => {
        // Attempt login with permissions
        const result = await LoginManager.logInWithPermissions([
            'public_profile',
            'email',
            'user_likes',
        ]);

        // if (result.isCancelled) {
        //     authError('signInWithFacebook', 'User cancelled the login process');
        // }

        // Once signed in, get the users AccesToken
        Maybe.fromNullable(await AccessToken.getCurrentAccessToken())
            .ifNothing(() => {
                errorCallback('Something went wrong');
            })
            .map((data) =>
                auth.FacebookAuthProvider.credential(data.accessToken),
            )
            .ifJust(_.flow(setSocialCredential, d))
            .map((cred) => auth().signInWithCredential(cred))
            .ifJust((promise) => {
                promise.catch(
                    _.flow(
                        tapLog('facebookSignIn'),
                        errorMessageParser,
                        errorCallback,
                    ),
                );
            });
    }, [errorCallback, d]);

    const signInWithPhoneNumber = async (
        phoneNumber: string,
    ): Promise<(code: string) => void> =>
        // MaybeAsync.fromPromise(() =>
        auth()
            .signInWithPhoneNumber(phoneNumber)
            .then(
                (confirmation: FirebaseAuthTypes.ConfirmationResult) => (
                    code: string,
                ) =>
                    confirmation
                        .confirm(code)
                        .catch(
                            _.flow(
                                tapLog('confirmCode'),
                                errorMessageParser,
                                errorCallback,
                            ),
                        ),
            )
            .catch(_.flow(tapLog('signIn'), errorMessageParser, errorCallback));
    // );
    // return (code: string) => {
    //     confirmation.confirm(code).catch((error) => {
    //         console.log('authError', error);
    //         authErrorSetter('something went wrong');
    //     });
    // };
    const signOut = useCallback(() => {
        auth().signOut().catch(console.log);
    }, []);

    return {
        signInWithEmailAndPassword,
        signInWithGoogle,
        signInWithFacebook,
        signInWithPhoneNumber,
        signOut,
        signInWithApple,
    };
};
