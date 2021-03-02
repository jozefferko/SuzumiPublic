import auth from '@react-native-firebase/auth';
import {Maybe} from 'purify-ts';
import {useEffect} from 'react';
import {GraphRequest, GraphRequestManager} from 'react-native-fbsdk';
import {useSafeState} from './useSafeState';
// import {stubFunction} from '../common/utils/fp';

type FacebookHook = Maybe<boolean>;

export default (safePageID: Maybe<String>): FacebookHook => {
    useEffect(() => {
        auth().onAuthStateChanged((user) =>
            Maybe.fromNullable(user).map((safeUser) =>
                console.log('providerData', safeUser.providerData),
            ),
        );
    }, []);
    // const [safePageID, setPageID] = useSafeState<string>();
    const [safeLiked, setLiked] = useSafeState<boolean>();
    useEffect(
        () =>
            // const pageId = safeRestaurant.orDefault('');
            // if (pageId) {
            safePageID.mapOrDefault(
                (pageId) => {
                    const interval = setInterval(() => {
                        const infoRequest = new GraphRequest(
                            `/me/likes/${pageId}`,
                            null,
                            (error, result) => {
                                console.log('FB Likes', result);
                                console.log(error);
                            },
                        );
                        new GraphRequestManager()
                            .addRequest(infoRequest)
                            .start();
                    }, 18000);
                    return () => clearInterval(interval);
                },
                () => {},
            ),

        [safePageID],
    );
    return safeLiked;
};
