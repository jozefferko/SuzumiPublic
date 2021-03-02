import _ from "lodash/fp";
import { Maybe, MaybeAsync } from "purify-ts";
import { useContext, useMemo, useState } from "react";
import {
    achievementIndexes,
    FSPathMap,
    FSUser,
} from "../../common/types/firestore";
import { fsRunTransaction } from "../../common/utils/firestore/fsTransaction";
import { serverTimestamp } from "../../common/utils/firestore/normalize";
import { fMap, orDefaultMaybe, safeFind, trigger } from "../../common/utils/fp";
import { SnackAlertContext } from "../../components/SnackAlertProvider";
import {
    numberFieldHandler,
    textFieldHandler,
    textFieldPropsGenerator,
} from "../../utils/genericHandlers";
import { FindMemberPopUpProps } from "./useFindMemberPopUp";
import { useDispatch, useSelector } from "react-redux";
import { cacheMember } from "../../redux/cachedMembersSlice";
import { RootState } from "../../redux";

export type SelectedUser = {
    user: FSUser;
    amount: string;
};
const toInt = (s: string): number => parseInt(s) || 0;

export const useDashboard = () => {
    const setError = useContext(SnackAlertContext);
    const d = useDispatch();
    const showAlert = useContext(SnackAlertContext);

    const [orderNumber, setOrderNumber] = useState("");
    const [orderAmount, setOrderAmount] = useState("");
    const [showPopUp, setShowPopUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<SelectedUser[]>([]);

    // const [error, setError] = useState("");
    const split = selected.length > 1;
    const remainder = useMemo(
        () =>
            toInt(orderAmount) -
            selected.reduce((acc, val) => acc + toInt(val.amount), 0),
        [orderAmount, selected]
    );

    const handleSelect = (safeUser: FSUser | undefined) =>
        Maybe.fromNullable(safeUser)
            .chain(
                Maybe.fromPredicate(
                    (user) => !selected.some((s) => s.user.id === user.id)
                )
            )
            .ifJust(_.flow(cacheMember, d))
            .ifJust((user) =>
                setSelected((s) => [...s, { user, amount: "0" }])
            );

    const setUserAmount = (id: string) => (amount: string) =>
        setSelected((all) =>
            all.map((s) => (s.user.id === id ? { ...s, amount } : s))
        );
    const removeUser = (id: string) =>
        setSelected((all) => all.filter((s) => s.user.id !== id));
    const addRemainder = (id: string) =>
        setSelected((all) =>
            all.map((s) =>
                s.user.id === id
                    ? { ...s, amount: (toInt(s.amount) + remainder).toString() }
                    : s
            )
        );

    const checkStatus = _.cond([
        [
            () => orderAmount.length < 1,
            _.flow(trigger(setError)("Input order amount"), _.stubFalse),
        ],
        [
            () => orderNumber.length < 1,
            _.flow(trigger(setError)("Input order number"), _.stubFalse),
        ],
        [
            () => selected.length < 1,
            _.flow(trigger(setError)("Select a member account"), _.stubFalse),
        ],
        [
            () =>
                selected.length > 1 &&
                selected.some((s) => toInt(s.amount) <= 0),
            _.flow(
                trigger(setError)("All points must be assigned"),
                _.stubFalse
            ),
        ],
        [
            () => remainder < 0,
            _.flow(trigger(setError)("Too many points assigned"), _.stubFalse),
        ],
        [_.stubTrue, _.stubTrue],
    ]);

    const conversionRate = useSelector(
        (state: RootState) => state.restaurant?.conversionRate ?? 1
    );

    const commitTransaction = () =>
        fsRunTransaction((transaction) =>
            MaybeAsync.catMaybes<FSUser>(
                selected.map(
                    _.flow(
                        ($) => $.user.id,
                        FSPathMap.users.doc,
                        transaction.get
                    )
                )
            )
                .then(
                    _.flow(
                        fMap((currentUser) => ({
                            user: currentUser,
                            amount:
                                conversionRate *
                                toInt(
                                    selected.length > 1
                                        ? selected.find(
                                              (s) =>
                                                  s.user.id === currentUser.id
                                          )?.amount || "0"
                                        : orderAmount
                                ),
                        })),
                        fMap(Maybe.fromNullable),
                        Maybe.catMaybes,
                        fMap((current) =>
                            transaction
                                .update(FSPathMap.users.doc(current.user.id))({
                                    ...((current.user.achievementStatus[
                                        achievementIndexes.eatWithFriends
                                    ]
                                        ? current.user.achievementStatus[
                                              achievementIndexes.eatWithFriends
                                          ].progress
                                        : 0) <=
                                    selected.length - 1
                                        ? {
                                              achievementStatus: {
                                                  [achievementIndexes.eatWithFriends]: {
                                                      progress:
                                                          selected.length - 1,
                                                  },
                                              },
                                          }
                                        : {}),
                                    balance:
                                        current.amount + current.user.balance,
                                })
                                .set(FSPathMap.transactions)({
                                id: "",
                                amount: current.amount,
                                user: current.user.id,
                                ref: orderNumber,
                                plainRef: {
                                    en: "Eating at Suzumi",
                                    dk: "Eating at Suzumi på dansk",
                                },
                                type: "order",
                                timestamp: serverTimestamp(),
                            })
                        )
                    )
                )
                .then(_.stubTrue)
        );

    const onSubmit = () => {
        if (checkStatus(0)) {
            setLoading(true);
            commitTransaction()
                .then((s) => {
                    showAlert("Points assigned", "success");
                    setLoading(false);
                    setOrderNumber("");
                    setOrderAmount("");
                    setSelected([]);
                    window.scrollTo(0, 0);
                })
                .catch((e) => {
                    console.error(e);
                    setError("Could not complete transaction");
                    setLoading(false);
                });
        }
    };

    const findMemberPopUpProps: FindMemberPopUpProps = {
        show: showPopUp,
        onClose: (a) => {
            setShowPopUp(false);
            handleSelect(a);
        },
        onError: setError,
    };
    const orderNumberFieldProps = textFieldPropsGenerator(textFieldHandler)(
        orderNumber,
        setOrderNumber
    );
    const orderAmountFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        orderAmount,
        setOrderAmount
    );

    const memberRowListProps = {
        childProps: {
            setUserAmount,
            removeUser,
            addRemainder,
            split,
        },
        data: selected,
    };
    const findMemberButtonProps = {
        onClick: trigger(setShowPopUp)(true),
    };
    const submitButtonProps = {
        disabled:
            toInt(orderAmount) === 0 ||
            (remainder !== 0 && selected.length > 1) ||
            selected.length === 0,
        onClick: () => onSubmit(),
    };
    return {
        loading,
        split,
        remainder,

        findMemberButtonProps,
        submitButtonProps,
        memberRowListProps,
        findMemberPopUpProps,
        orderNumberFieldProps,
        orderAmountFieldProps,
    };
};
