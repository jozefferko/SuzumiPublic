import { Maybe, MaybeAsync } from "purify-ts";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DropResult } from "react-beautiful-dnd";
import { Static } from "runtypes";
import { FSLocaleString, FSPathMap } from "../../common/types/firestore";
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
import {
    orderedProductsSelector,
    useSafeSelector,
} from "../../redux/selectors";
import {
    numberFieldHandler,
    textFieldHandler,
    textFieldPropsGenerator,
} from "../../utils/genericHandlers";
import { stubFSLocaleString, trigger } from "../../common/utils/fp";
import { LocalizedTextFieldProps } from "../../components/LocalizedTextField";
import { deleteProduct } from "../../common/utils/firestore/productsOperations";
import { fsRunTransaction } from "../../common/utils/firestore/fsTransaction";
import { SnackAlertContext } from "../../components/SnackAlertProvider";

type HandleConfirm = (args: {
    displayName: FSLocaleString;
    description: FSLocaleString;
    claimedDescription: FSLocaleString;
    price: string;
}) => void;

type PopUpState = {
    open: boolean;
    item: item | undefined;
};
export type ProductsPopUpProps = PopUpState & {
    onClose: () => void;
    handleConfirm: HandleConfirm;
    handleDelete: () => void;
    loading: boolean;
    image: {
        loadImage: loadImage;
        previewUrl: Maybe<string>;
    };
};

type openPopUp = (item?: item) => void;
const initialPopUpState: PopUpState = { open: false, item: undefined };

const collectionPath = FSPathMap.products;
type item = Static<typeof collectionPath.runtype>;
const createProduct = (args: {
    displayName: FSLocaleString;
    description: FSLocaleString;
    claimedDescription: FSLocaleString;
    price: string;
}): item => ({
    id: "",
    imgUrl: "",
    price: args.price ? parseInt(args.price) : 10,
    displayName: args.displayName,
    description: args.description,
    claimedDescription: args.claimedDescription,
    flags: ["active"],
    maxPurchase: 0,
});

export const useRewards = (): {
    items: item[];

    reorderHandler: (result: DropResult) => void;
    popUpProps: ProductsPopUpProps;
    openPopUp: openPopUp;
} => {
    const safeItems = useSafeSelector<item[]>(orderedProductsSelector());
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
                                  path: collectionPath.doc(id),
                                  data: {
                                      claimedDescription:
                                          args.claimedDescription,
                                      displayName: args.displayName,
                                      description: args.description,
                                      price: args.price
                                          ? parseInt(args.price)
                                          : 10,
                                  },
                              }).then(Maybe.of)
                            : appendOrderedDoc(
                                  collectionPath.doc(id),
                                  createProduct(args)
                              ).then(Maybe.of)
                    ).map(() => uploadImage(collectionPath.doc(id)))
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
                    fsRunTransaction((transaction) =>
                        MaybeAsync.liftMaybe(Maybe.of("e"))
                            .map((a) => {
                                deleteProduct(
                                    transaction,
                                    FSPathMap.products.doc(id)
                                );
                            })
                            .run()
                    )
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

    const popUpProps: ProductsPopUpProps = useMemo(
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
                safeItems.ifJust((item) =>
                    moveOrderedDoc(
                        collectionPath.doc(item[source].id),
                        destination
                    )
                )
            );
    };

    return {
        items: safeItems.orDefault([]),
        reorderHandler,
        openPopUp,
        popUpProps,
    };
};

export const useRewardsEditor = (props: ProductsPopUpProps) => {
    const { item, handleConfirm, loading, image, handleDelete } = props;
    const [displayName, setDisplayName] = useState<FSLocaleString>(
        stubFSLocaleString
    );
    const [description, setDescription] = useState<FSLocaleString>(
        stubFSLocaleString
    );
    const [
        claimedDescription,
        setClaimedDescription,
    ] = useState<FSLocaleString>(stubFSLocaleString);
    const [price, setPrice] = useState<string>("");
    useEffect(() => {
        if (props.open) {
            setDisplayName(item?.displayName ?? stubFSLocaleString);
            setDescription(item?.description ?? stubFSLocaleString);
            setClaimedDescription(
                item?.claimedDescription ?? stubFSLocaleString
            );
            setPrice(item?.price.toString() ?? "");
        }
    }, [props.open, item]);

    const displayNameFieldProps: LocalizedTextFieldProps = {
        onChange: setDisplayName,
        value: displayName,
    };
    const descriptionFieldProps: LocalizedTextFieldProps = {
        onChange: setDescription,
        value: description,
    };

    const claimedDescriptionFieldProps: LocalizedTextFieldProps = {
        onChange: setClaimedDescription,
        value: claimedDescription,
    };
    const priceFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        price,
        setPrice
    );
    const confirmButtonProps = {
        onClick: trigger(handleConfirm)({
            displayName,
            description,
            claimedDescription,
            price,
        }),
    };
    const deleteButtonProps = {
        onClick: handleDelete,
    };

    return {
        displayNameFieldProps,
        descriptionFieldProps,
        priceFieldProps,
        confirmButtonProps,
        deleteButtonProps,
        claimedDescriptionFieldProps,
        showPlaceHolder: !(image.previewUrl.isJust() || item?.imgUrl),
        imgUrl: image.previewUrl.orDefault(item?.imgUrl ? item.imgUrl : ""),
        isEditing: Maybe.fromNullable(item).isJust(),
    };
    // const;
};
