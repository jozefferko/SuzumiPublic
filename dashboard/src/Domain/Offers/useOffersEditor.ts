import { Maybe, MaybeAsync } from "purify-ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Static } from "runtypes";
import {
    FSLocaleString,
    FSOffer,
    FSOfferSection,
    FSPathMap,
} from "../../common/types/firestore";
import { serverTimestamp } from "../../common/utils/firestore/normalize";
import {
    appendOrderedDoc,
    deleteOrderedDoc,
    moveOrderedDoc,
} from "../../common/utils/firestore/orderedCollection";
import {
    fsUpload,
    fsUploadType,
    generateFSId,
} from "../../common/utils/firestore/queries";
import { loadImage, useImageUpload } from "../../hooks/useImageUpload";
import { orderedOffersSelector, useSafeSelector } from "../../redux/selectors";
import { dateToFSTimestamp } from "../../common/utils/dateOperations";
import { SnackAlertContext } from "../../components/SnackAlertProvider";

type ConfirmArgs = {
    displayName: FSLocaleString;
    description: FSLocaleString;
    url: string;
    inApp: boolean;
    timed: boolean;
    expiry: Date;
    publish: Date;
    section: FSOfferSection;
};

type HandleConfirm = (args: ConfirmArgs) => void;

type PopUpState = {
    open: boolean;
    item: Static<typeof FSOffer> | undefined;
};
export type OffersPopUpProps = PopUpState & {
    onClose: () => void;
    handleConfirm: HandleConfirm;
    handleDelete: () => void;
    loading: boolean;
    image: {
        loadImage: loadImage;
        previewUrl: Maybe<string>;
    };
};

type openPopUp = (item?: Static<typeof FSOffer>) => void;
const initialPopUpState: PopUpState = { open: false, item: undefined };

const createOffer = (args: ConfirmArgs): Static<typeof FSOffer> => ({
    id: "",
    imgUrl: "",
    created: serverTimestamp(),
    expiry: dateToFSTimestamp(args.expiry),
    publish: dateToFSTimestamp(args.publish),
    displayName: args.displayName,
    description: args.description,
    url: args.url,
    type: args.inApp ? "inApp" : "link",
    section: args.section,
    shouldExpire: args.timed,
});

export const useOffersEditor = (): {
    offers: Static<typeof FSOffer>[];

    reorderHandler: (result: DropResult) => void;
    popUpProps: OffersPopUpProps;
    openPopUp: openPopUp;
} => {
    const safeOffers = useSafeSelector<Static<typeof FSOffer>[]>(
        orderedOffersSelector()
    );

    const showAlert = useContext(SnackAlertContext);

    const [popUp, setPopUp] = useState<PopUpState>(initialPopUpState);
    const [popUpLoading, setPopUpLoading] = useState<boolean>(false);
    const { loadImage, previewUrl, uploadImage, clear } = useImageUpload();
    const handleConfirm = useCallback<HandleConfirm>(
        (args) => {
            setPopUpLoading(true);
            MaybeAsync.liftMaybe(
                Maybe.fromNullable(popUp.item?.id).alt(Maybe.of(generateFSId()))
            )
                .chain((id) =>
                    MaybeAsync.fromPromise<void | boolean>(() =>
                        popUp.item?.id
                            ? fsUpload({
                                  type: fsUploadType.update,
                                  path: FSPathMap.offers.doc(id),
                                  data: {
                                      displayName: args.displayName,
                                      description: args.description,
                                      url: args.url,
                                      type: args.inApp ? "inApp" : "link",
                                      section: args.section,
                                      shouldExpire: args.timed,
                                      expiry: dateToFSTimestamp(args.expiry),
                                      publish: dateToFSTimestamp(args.publish),
                                  },
                              }).then(Maybe.of)
                            : appendOrderedDoc(
                                  FSPathMap.offers.doc(id),
                                  createOffer(args)
                              ).then(Maybe.of)
                    ).map(() => uploadImage(FSPathMap.offers.doc(id)))
                )
                .run()
                .then((completed) =>
                    completed
                        .ifNothing(() => {
                            showAlert("Operation failed");
                            setPopUpLoading(false);
                        })
                        .ifJust(() => {
                            showAlert("Operation successful", "success");
                            setPopUp((state) => ({ ...state, open: false }));
                            setTimeout(() => {
                                clear();
                                setPopUp(initialPopUpState);
                                setPopUpLoading(false);
                            }, 200);
                        })
                );
        },
        [clear, popUp.item, uploadImage]
    );

    const handleDelete = useCallback(() => {
        setPopUpLoading(true);
        MaybeAsync.liftMaybe(Maybe.fromNullable(popUp.item?.id))
            .chain((id) =>
                MaybeAsync.fromPromise(() =>
                    deleteOrderedDoc(FSPathMap.offers.doc(id)).then(Maybe.of)
                )
            )
            .run()
            .then((completed) =>
                completed
                    .ifNothing(() => {
                        setPopUpLoading(false);
                    })
                    .ifJust(() => {
                        setPopUp(initialPopUpState);
                        setPopUpLoading(false);
                    })
            );
    }, [popUp.item]);

    const popUpProps: OffersPopUpProps = useMemo(
        () => ({
            ...popUp,
            onClose: () => setPopUp(initialPopUpState),
            handleConfirm,
            handleDelete,
            loading: popUpLoading,
            image: {
                loadImage,
                previewUrl,
            },
        }),
        [
            handleConfirm,
            handleDelete,
            loadImage,
            popUp,
            popUpLoading,
            previewUrl,
        ]
    );
    const openPopUp: openPopUp = useCallback<openPopUp>(
        (item) => setPopUp({ open: true, item }),
        []
    );

    const reorderHandler = (result: DropResult) => {
        const source = result.source.index;
        Maybe.fromNullable(result.destination)
            .map((d) => d.index)
            .chain(Maybe.fromPredicate((destination) => destination !== source))
            .ifJust((destination) =>
                safeOffers.ifJust((offers) =>
                    moveOrderedDoc(
                        FSPathMap.offers.doc(offers[source].id),
                        destination
                    )
                )
            );

        // fsLinkListMove(
        //     productsSnapshot,
        //     FSPathMap.products.doc(products[source].id),
        //     products[destination].id
        // )
    };

    return {
        offers: safeOffers.orDefault([]),
        reorderHandler,
        openPopUp,
        popUpProps,
    };
};
