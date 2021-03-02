import _ from 'lodash/fp';
import {Maybe} from 'purify-ts';
import {useCallback, useEffect} from 'react';
import FastImage from 'react-native-fast-image';
import {useDispatch} from 'react-redux';
import {Static} from 'runtypes';
import {
    FSCache,
    FSContestEntry,
    FSOffer,
    FSPathMap,
    FSProduct,
    FSPurchase,
    FSRestaurant,
    FSTransaction,
} from '../../common/types/firestore';
import {fsListener} from '../../common/utils/firestore/listeners';
import {dictionarify} from '../../common/utils/firestore/normalize';
import {
    fsUpload,
    fsUploadType,
    orderByFactory,
    whereFactory,
} from '../../common/utils/firestore/queries';
import {nothingLog} from '../../common/utils/fp';
import {RootState} from '../../redux';
import {setCache} from '../../redux/cacheSlice';
import {setOffers} from '../../redux/offersSlice';
import {setProducts} from '../../redux/productsSlice';
import {setPurchases} from '../../redux/purchasesSlice';
import {setRestaurant} from '../../redux/restaurantSlice';
import {useSafeSelector} from '../../redux/selectors';
import {setTransactions} from '../../redux/transactionsSlice';
import {setContest} from '../../redux/contestSlice';

const preloadImages = (urls: string[]) =>
    FastImage.preload(urls.map((uri) => ({uri})));

export default () => {
    const d = useDispatch();
    // useRestaurantStorage(
    //     'restaurant',
    //     (state) => state.restaurant,
    //     hydrateRestaurant,
    //     true,
    // );

    const restaurantCallback = useCallback(
        (data: Maybe<Static<typeof FSRestaurant>>) =>
            data
                .ifJust(_.flow(setRestaurant, d))
                .ifNothing(nothingLog('restaurantCallback')),
        [d],
    );

    const safeUid = useSafeSelector((state: RootState) => state.user.id);
    useEffect(
        () =>
            safeUid.mapOrDefault(
                () =>
                    fsListener<Static<typeof FSRestaurant>>({
                        path: FSPathMap.restaurant,
                        callback: restaurantCallback,
                    }),
                _.stubFalse,
            ),
        [restaurantCallback, d, safeUid],
    );

    const transactionsCallback = useCallback(
        (data: Maybe<Static<typeof FSTransaction>[]>) =>
            data
                .ifJust(_.flow(dictionarify, setTransactions, d))
                .ifNothing(nothingLog('productsCallback')),
        [d],
    );
    useEffect(
        () =>
            safeUid.mapOrDefault(
                (id) =>
                    fsListener<Static<typeof FSTransaction>>({
                        path: FSPathMap.transactions,
                        callback: transactionsCallback,
                        options: {
                            where: [whereFactory('user', '==', id)],
                            orderBy: [orderByFactory('timestamp', 'desc')],
                        },
                    }),
                _.stubFalse,
            ),
        [transactionsCallback, d, safeUid],
    );

    useEffect(
        () =>
            fsListener<Static<typeof FSProduct>>({
                path: FSPathMap.products,
                callback: (data: Maybe<Static<typeof FSProduct>[]>) =>
                    data
                        .ifJust(
                            _.flow(
                                _.map(($) => $.imgUrl),
                                _.filter(($) => !!$),
                                preloadImages,
                            ),
                        )
                        .ifJust(_.flow(dictionarify, setProducts, d))
                        .ifNothing(nothingLog('productsCallback')),
            }),
        [d],
    );

    useEffect(
        () =>
            safeUid.mapOrDefault(
                (id) =>
                    fsListener<Static<typeof FSPurchase>>({
                        path: FSPathMap.purchases,
                        callback: (data: Maybe<Static<typeof FSPurchase>[]>) =>
                            data
                                .ifJust(_.flow(dictionarify, setPurchases, d))
                                .ifNothing(nothingLog('Purchases callback')),
                        options: {
                            where: [whereFactory('user', '==', id)],
                            orderBy: [orderByFactory('purchased', 'desc')],
                        },
                    }),
                _.stubFalse,
            ),
        [safeUid, d],
    );
    useEffect(
        () =>
            safeUid.mapOrDefault(
                (id) =>
                    fsListener<FSContestEntry>({
                        path: FSPathMap.contest,
                        callback: (data: Maybe<FSContestEntry[]>) =>
                            data
                                .ifJust(_.flow(dictionarify, setContest, d))
                                .ifNothing(nothingLog('contest callback')),
                        options: {
                            where: [whereFactory('user', '==', id)],
                        },
                    }),
                _.stubFalse,
            ),
        [safeUid, d],
    );

    useEffect(
        () =>
            fsListener<Static<typeof FSOffer>>({
                path: FSPathMap.offers,
                callback: (data: Maybe<Static<typeof FSOffer>[]>) =>
                    data
                        .ifJust(
                            _.flow(
                                _.map(($) => $.imgUrl),
                                _.filter(($) => !!$),
                                preloadImages,
                            ),
                        )
                        .ifJust(_.flow(dictionarify, setOffers, d))
                        .ifNothing(nothingLog('offerssCallback')),
                options: {
                    orderBy: [orderByFactory('created', 'desc')],
                },
            }),
        [d],
    );
    useEffect(
        () =>
            fsListener<Static<typeof FSCache>>({
                path: FSPathMap.cache,
                callback: (data: Maybe<Static<typeof FSCache>>) =>
                    data
                        .ifJust(_.flow(setCache, d))
                        .ifNothing(nothingLog('cacheCallback')),
            }),
        [d],
    );

    // useEffect(() => {
    //     return firestore()
    //         .collection('products')
    //         .onSnapshot((snapshot) => {
    //             const result = !snapshot.empty
    //                 ? Maybe.of(snapshot)
    //                 : Maybe.empty();
    //             result
    //                 .map(extractFSQuery)
    //                 .chain((q) =>
    //                     fromThrowable(_.mapValues(FSProduct.check), q),
    //                 )
    //                 .map(setProducts)
    //                 .ifJust(d)
    //                 .ifNothing(() => d(setProducts({})));
    //         });
    // }, [d]);
    // 0
};
