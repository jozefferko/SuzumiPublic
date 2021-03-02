import auth from '@react-native-firebase/auth';
import {Maybe} from 'purify-ts';
import {useEffect} from 'react';
import {GraphRequest, GraphRequestManager} from 'react-native-fbsdk';
import {useSafeSelector} from '../../redux/selectors';

export default () => {
    useEffect(() => {
        auth().onAuthStateChanged((user) =>
            Maybe.fromNullable(user).map((safeUser) =>
                console.log(safeUser.providerData),
            ),
        );
    }, []);

    const safeRestaurant = useSafeSelector((s) => s.restaurant?.social.fbPage);
    useEffect(() => {
        const pageId = safeRestaurant.orDefault('');
        if (pageId) {
            const interval = setInterval(() => {
                const infoRequest = new GraphRequest(
                    `/me/likes/${pageId}`,
                    null,
                    (error, result) => {
                        console.log('FB Likes', result);
                        console.log(error);
                    },
                );
                new GraphRequestManager().addRequest(infoRequest).start();
            }, 18000);
            return () => clearInterval(interval);
        }
    }, [safeRestaurant]);
};
