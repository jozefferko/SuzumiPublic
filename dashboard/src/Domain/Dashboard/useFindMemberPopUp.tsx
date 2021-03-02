import _ from "lodash/fp";
import { Maybe } from "purify-ts";
import React, { useEffect, useState } from "react";
import { onCallSignatures } from "../../common/types/calls";
import { FSPathMap, FSUser } from "../../common/types/firestore";
import { fsGet } from "../../common/utils/firestore/getters";
import { whereFactory } from "../../common/utils/firestore/queries";
import { tapLog } from "../../common/utils/fp";
import { useSafeState } from "../../hooks/useSafeState";
import { endpoint } from "../../utils/cloud";
import {
    phoneFieldHandler,
    textFieldPropsGenerator,
} from "../../utils/genericHandlers";

export type FindMemberPopUpProps = {
    show: boolean;
    onClose: (user?: FSUser) => any;
    onError: (s: string) => any;
};
export type BoolPopUpProps = {
    show: boolean;
    onClose: (s?: boolean) => any;
};
export type ConfirmMemberPopUpProps = BoolPopUpProps & {
    user: FSUser | undefined;
};
export type MemberNotFoundProps = BoolPopUpProps & {
    phoneNumber: string;
};
const initialNumber = "+45";
export const useFindMemberPopUp = (props: FindMemberPopUpProps) => {
    const [userNotFound, setUserNotFound] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(initialNumber);
    const [loadedUser, setLoadedUser] = useSafeState<FSUser>();

    useEffect(() => {
        if (props.show) setPhoneNumber(initialNumber);
    }, [props.show]);

    const errorHandler = _.flow(
        _.cond([
            [_.equals("fsError"), _.always("Couldn't fetch the Member")],
            [_.equals("empty"), _.always("Invalid code")],
        ]),
        props.onError
    );

    const phoneSearch = () => {
        setLoading(true);
        fsGet({
            path: FSPathMap.users,
            options: {
                where: [whereFactory("phoneNumber", "==", phoneNumber)],
            },
        })
            .ifLeft(errorHandler)
            .ifRight((results) =>
                Maybe.fromNullable(results[0])
                    .ifJust(setLoadedUser)
                    .ifNothing(() => setUserNotFound(true))
            )
            .then(() => setLoading(false));
    };

    const idSearch = (onFinish: (user: FSUser) => any) => (id: string) => {
        setLoading(true);
        fsGet({
            path: FSPathMap.users.doc(id),
        })
            .ifRight(tapLog("fetched new user"))
            .ifRight(onFinish)
            .ifLeft(errorHandler)
            .run()
            .then(() => setLoading(false));
    };
    const createNewUser = () =>
        endpoint(onCallSignatures.createUser)({
            phoneNumber: phoneNumber,
            displayName: "",
            email: "",
        })
            .run()
            .then((safeResult) =>
                safeResult
                    .chain(Maybe.fromPredicate((result) => result.status))
                    .ifJust((result) => idSearch(props.onClose)(result.message))
                    .ifNothing(() => props.onError("Failed to create the user"))
            );

    const [limiter, setLimiter] = useState(true);
    useEffect(() => {
        if (props.show) setLimiter(true);
    }, [props.show]);
    const handleScan = (data: any) => {
        if (data && limiter) {
            setLimiter(false);
            idSearch(props.onClose)(data);
        }
    };

    const memberNotFoundProps: MemberNotFoundProps = {
        show: userNotFound,
        onClose: (s?: boolean) => {
            setUserNotFound(false);
            if (s) {
                setLoading(true);
                createNewUser();
            } else {
            }
        },
        phoneNumber,
    };
    const confirmMemberProps: ConfirmMemberPopUpProps = {
        show: loadedUser.isJust(),
        onClose: (s?: boolean) => {
            if (s) {
                loadedUser.ifJust(props.onClose);
            }
            setLoadedUser();
        },
        user: loadedUser.extract(),
    };
    const phoneNumberField = textFieldPropsGenerator(phoneFieldHandler)(
        phoneNumber,
        setPhoneNumber
    );
    const searchButtonProps = {
        onClick: phoneSearch,
    };
    const qrReaderProps = {
        delay: 100,
        onError: console.error,
        onScan: handleScan,
    };
    return {
        phoneNumberField,
        qrReaderProps,
        confirmMemberProps,
        memberNotFoundProps,
        searchButtonProps,
    };
};
