import _ from "lodash/fp";
import { Maybe } from "purify-ts";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Static } from "runtypes";
import {
    FSCache,
    FSOffer,
    FSPathMap,
    FSProduct,
    FSRestaurant,
} from "../../common/types/firestore";
import { fsListener } from "../../common/utils/firestore/listeners";
import {
    dictionarify,
    serverTimestamp,
} from "../../common/utils/firestore/normalize";
import { nothingLog } from "../../common/utils/fp";
import { RootState } from "../../redux";
import { setCache } from "../../redux/cacheSlice";
import { setOffers } from "../../redux/offersSlice";
import { setProducts } from "../../redux/productsSlice";
import { setRestaurant } from "../../redux/restaurantSlice";
import { useSafeSelector } from "../../redux/selectors";
import { fsUpload, fsUploadType } from "../../common/utils/firestore/queries";

export default () => {
    const d = useDispatch();

    const safeUid = useSafeSelector<string>(
        (state: RootState) => state.user.id
    );
    useEffect(
        () =>
            safeUid.mapOrDefault(
                () =>
                    fsListener<Static<typeof FSRestaurant>>({
                        path: FSPathMap.restaurant,
                        callback: (data: Maybe<Static<typeof FSRestaurant>>) =>
                            data
                                .ifJust(_.flow(setRestaurant, d))
                                .ifNothing(nothingLog("restaurantCallback")),
                    }),
                _.stubFalse
            ),
        // return firestore
        //     .collection("config")
        //     .doc("restaurant")
        //     .onSnapshot((snapshot) => {
        //         const result = snapshot.exists
        //             ? Maybe.of(snapshot)
        //             : Maybe.empty();
        //         result
        //             .map(extractFSDoc)
        //             .chain((doc) => fromThrowable(FSRestaurant.check, doc))
        //             .map(setRestaurant)
        //             .ifJust(d)
        //             .ifNothing(nothingLog("fetchRestaurant"));
        //     });
        [d, safeUid]
    );

    useEffect(
        () =>
            fsListener<Static<typeof FSProduct>>({
                path: FSPathMap.products,
                callback: (data: Maybe<Static<typeof FSProduct>[]>) =>
                    data
                        .ifJust(_.flow(dictionarify, setProducts, d))
                        .ifNothing(nothingLog("productsCallback")),
            }),
        [d]
    );
    useEffect(
        () =>
            fsListener<Static<typeof FSCache>>({
                path: FSPathMap.cache,
                callback: (data: Maybe<Static<typeof FSCache>>) =>
                    data
                        .ifJust(_.flow(setCache, d))
                        .ifNothing(nothingLog("cacheCallback")),
            }),
        [d]
    );
    useEffect(
        () =>
            fsListener<Static<typeof FSOffer>>({
                path: FSPathMap.offers,
                callback: (data: Maybe<Static<typeof FSOffer>[]>) =>
                    data
                        .ifJust(_.flow(dictionarify, setOffers, d))
                        .ifNothing(nothingLog("offersCallback")),
            }),
        [d]
    );
    // useEffect(() => {
    //     if (safeUid.isJust()) {
    //         // @ts-ignore
    //         fsUpload({
    //             path: FSPathMap.restaurant,
    //             type: fsUploadType.set,
    //             data: {                },
    //         });
    //     }
    // }, [safeUid]);
};
