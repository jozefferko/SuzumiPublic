import {Maybe} from 'purify-ts';
import {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import theme from '../../assets/theme.style';
import {
    achievementIndexes,
    FSPathMap,
    FSRestaurant,
    FSTier,
} from '../../common/types/firestore';
import {fsUpload, fsUploadType} from '../../common/utils/firestore/queries';
import {maybeAll} from '../../common/utils/fp';
import {RootState} from '../../redux';
import {useSafeSelector} from '../../redux/selectors';
import {setSettings} from '../../redux/settingsSlice';
import {TransactionsSliceState} from '../../redux/transactionsSlice';
import {loadedState, UserStatus} from '../../redux/userSlice';

const accumulatedPoints = (transactions: TransactionsSliceState) =>
    Object.values(transactions)
        .filter((transaction) => transaction.amount > 0)
        .reduce((acc, val) => acc + val.amount, 0);

export const useEnableTiers = () => {
    const d = useDispatch();
    const call = useCallback(
        (uid: string) => {
            d(setSettings({firstOpen: true}));
            fsUpload({
                type: fsUploadType.update,
                path: FSPathMap.users.doc(uid),
                data: {
                    tiers: {
                        enabled: true,
                    },
                    achievementStatus: {
                        [achievementIndexes.unlockTiers]: {
                            progress: 0,
                            claimed: 0,
                        },
                    },
                },
            });
        },
        [d],
    );
    return call;
};

export default () => {
    const enableTiers = useEnableTiers();
    const safeUser = useSafeSelector<loadedState>((state) =>
        state.user.status === UserStatus.loaded ? state.user : null,
    );
    const safeRestaurant = useSafeSelector<FSRestaurant>(
        (state: RootState) => state.restaurant,
    );

    const transactions = useSelector((state: RootState) => state.transactions);

    //forceEnable
    useEffect(() => {
        safeUser.chain((user) =>
            Maybe.fromPredicate((u) => !u.tiers.enabled, user)
                .map(($) => accumulatedPoints(transactions))

                .chain((points) => maybeAll(Maybe.of(points), safeRestaurant))
                .filter(
                    ([points, restaurant]) =>
                        points >= restaurant.tiers.forceUnlock,
                )
                .ifJust(() => enableTiers(user.id)),
        );
    }, [enableTiers, safeRestaurant, transactions, safeUser]);
    useEffect(() => {
        safeUser
            .filter(
                (u) =>
                    !u.tiers.enabled &&
                    (u.achievementStatus[achievementIndexes.unlockTiers]
                        ?.claimed ?? -1) === 0,
            )
            .ifJust((user) => enableTiers(user.id));
    }, [enableTiers, safeRestaurant, transactions, safeUser]);

    // updateAccumulatedPoints
    // useEffect(() => {
    //     fsUpload({
    //         path: FSPathMap.restaurant,
    //         type: fsUploadType.update,
    //         data: {tiers: {tiers}},
    //     });
    // }, []);
};

const tiers: FSTier[] = [
    {
        color: theme.tierColors.bronze,
        description: {
            en: `Welcome to the Suzumi family!

We've given you a welcome bonus of 100 points  to say thank you for downloading our app.`,
            dk: 'e',
        },
        displayName: {en: 'bronze', dk: 'bronze'},
        expire: false,
        points: 0,
        maintainPoints: 0,
    },
    {
        color: '#A0B4BE',
        description: {
            en: `Welcome to the Suzumi family!

We've given you a welcome bonus of 100 points  to say thank you for downloading our app.`,
            dk: 'e',
        },
        displayName: {en: 'silver', dk: 'silver'},
        expire: false,
        points: 1000,
        maintainPoints: 0,
    },
    {
        color: '#E4A836',
        description: {
            en: `It's no secret you're a big fan of Suzumi!

Celebrate your love for sushi with your friends and have a lovely meal together at our restaurant. Show your point balance to the cashier and you and all your friends will receive 10% off.`,
            dk: 'e',
        },
        displayName: {en: 'gold', dk: 'gold'},
        expire: false,
        points: 3000,
        maintainPoints: 750,
    },
    {
        color: '#7AB0F0',
        description: {
            en: `It's no secret you're a big fan of Suzumi!

Celebrate your love for sushi with your friends and have a lovely meal together at our restaurant. Show your point balance to the cashier and you and all your friends will receive 15% off + you get one free sushi menu each month.`,
            dk: 'e',
        },
        displayName: {en: 'platinum', dk: 'platinum'},
        expire: false,
        points: 5000,
        maintainPoints: 1250,
    },
];
