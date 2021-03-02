import { Maybe } from "purify-ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { Static } from "runtypes";
import { onCallSignatures } from "../../common/types/calls";
import {
    FSLocaleString,
    FSPathMap,
    FSUser,
} from "../../common/types/firestore";
import { fsTimestampComparator } from "../../common/utils/dateOperations";
import {
    orderByFactory,
    whereFactory,
} from "../../common/utils/firestore/queries";
import { SearchSortingOption, useSearch } from "../../hooks/useSearch";
import { endpoint } from "../../utils/cloud";
import { SnackAlertContext } from "../../components/SnackAlertProvider";

type PopUpState = {
    open: boolean;
    user: Static<typeof FSUser> | undefined;
};
type HandleNewUser = (
    args: Static<typeof onCallSignatures.createUser.args>
) => Promise<void>;

type HandleDeleteUser = (
    args: Static<typeof onCallSignatures.deleteUser.args>
) => Promise<void>;
type HandleUpdateUser = (
    args: Static<typeof onCallSignatures.updateUser.args>
) => Promise<void>;
export type MembersPopUpProps = PopUpState & {
    onClose: () => void;
    handleNewUser: HandleNewUser;
    loading: boolean;
    handleUpdateUser: HandleUpdateUser;
    handleDeleteUser: HandleDeleteUser;
};
type openPopUp = (item?: Static<typeof FSUser>) => void;
const initialPopUpState: PopUpState = { open: false, user: undefined };

export type UserSearchOption = SearchSortingOption<Static<typeof FSUser>> & {
    plainName: FSLocaleString;
    value: string;
};
const sortingOptions: UserSearchOption[] = [
    {
        comparator: (a, b) =>
            fsTimestampComparator(false)(a.created, b.created),
        orderBy: orderByFactory("created", "desc"),
        plainName: { en: "date, new-old", dk: "Oprettet, ny-gammel" },
        value: "dateDesc",
    },
    {
        comparator: (a, b) => fsTimestampComparator(true)(a.created, b.created),
        orderBy: orderByFactory("created", "asc"),
        plainName: { en: "date, old-new", dk: "Oprettet, gammel-ny" },
        value: "dateAsc",
    },
];
const userCond = [whereFactory("flags", "array-contains", "active")];
export const useMembers = (): {
    members: Static<typeof FSUser>[];
    keyword: { value: string; setKeyword: (s: string) => void };
    order: {
        value: string;
        setOrder: (s: string) => void;
        orderList: UserSearchOption[];
    };
    popUpProps: MembersPopUpProps;
    openPopUp: openPopUp;
} => {
    const [keyword, setKeyword] = useState<string>("");
    const [currentSortBy, setCurrentSortBy] = useState<UserSearchOption>(
        sortingOptions[0]
    );
    const setCurrentSortByValue = (val: string) =>
        setCurrentSortBy(
            Maybe.fromNullable(
                sortingOptions.find((option) => option.value === val)
            ).orDefault(sortingOptions[0])
        );

    const members = useSearch(
        FSPathMap.users,
        keyword,
        100,
        currentSortBy,
        userCond
    );

    const [popUp, setPopUp] = useState<PopUpState>(initialPopUpState);
    const [popUpLoading, setPopUpLoading] = useState<boolean>(false);

    const showAlert = useContext(SnackAlertContext);
    const handleNewUser = useCallback<HandleNewUser>(
        async (args: Static<typeof onCallSignatures.createUser.args>) => {
            setPopUpLoading(true);
            await endpoint(onCallSignatures.createUser)(args).then((res) => {
                setPopUpLoading(false);
                res.ifNothing(() => {
                    showAlert("Operation failed");
                }).ifJust(() => {
                    showAlert("Operation successful", "success");
                    setPopUp(initialPopUpState);
                });
            });
        },
        []
    );

    const handleUpdateUser = useCallback<HandleUpdateUser>(async (args) => {
        setPopUpLoading(true);
        await endpoint(onCallSignatures.updateUser)(args).then((res) => {
            setPopUpLoading(false);
            res.ifNothing(() => {
                showAlert("Operation failed");
            }).ifJust(() => {
                showAlert("Operation successful", "success");
                setPopUp(initialPopUpState);
            });
        });
    }, []);
    const handleDeleteUser = useCallback<HandleDeleteUser>(async (args) => {
        setPopUpLoading(true);
        await endpoint(onCallSignatures.deleteUser)(args).then((res) => {
            setPopUpLoading(false);
            res.ifNothing(() => {
                showAlert("Operation failed");
            }).ifJust(() => {
                showAlert("Operation successful", "success");
                setPopUp(initialPopUpState);
            });
        });
    }, []);

    const popUpProps: MembersPopUpProps = useMemo(
        () => ({
            ...popUp,
            onClose: () => setPopUp(initialPopUpState),
            loading: popUpLoading,
            handleNewUser,
            handleUpdateUser,
            handleDeleteUser,
        }),
        [handleNewUser, handleDeleteUser, handleUpdateUser, popUp, popUpLoading]
    );

    const openPopUp: openPopUp = useCallback<openPopUp>(
        (user) => setPopUp({ open: true, user }),
        []
    );
    return {
        keyword: { value: keyword, setKeyword: setKeyword },
        order: {
            value: currentSortBy.value,
            setOrder: setCurrentSortByValue,
            orderList: sortingOptions,
        },
        members: members.orDefault([]),
        popUpProps,
        openPopUp,
    };
};
