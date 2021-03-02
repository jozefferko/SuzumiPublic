import _ from "lodash/fp";
import { Maybe, MaybeAsync } from "purify-ts";
import { Static } from "runtypes";
import { CallSignature, EndpointFormat } from "../common/types/calls";
import { fromThrowableC, nothingLog, tapLog } from "../common/utils/fp";
import { functions } from "../firebase";

export const sendSMS = (number: string) => {
    return functions
        .httpsCallable("sendsSMS")({ phoneNumber: number })

        .catch((error) => {
            console.error(error);
        });
};

export const createUser = (
    sms: boolean,
    phoneNumber: string,
    displayName: string,
    email: string,
    birthday: string
) => {
    return functions
        .httpsCallable("createUser")({
            sms,
            phoneNumber,
            displayName,
            email,
            birthday,
        })

        .catch((error) => {
            console.error(error);
        });
};

export const sendNotification = (title: string, body: string) => {
    return functions
        .httpsCallable("sendNotification")({ title, body })

        .catch((error) => {
            console.error(error);
        });
};

export const updateUser = (
    id: string,
    phoneNumber: string,
    displayName: string,
    email: string,
    birthday: string
) => {
    return functions
        .httpsCallable("updateUser")({
            id,
            displayName,
            phoneNumber,
            email,
            birthday,
        })
        .then(function (result) {})
        .catch((error) => {
            console.error(error);
        });
};

const formatSignature = <A, B>(call: CallSignature<A, B>) => (
    request: A
): Static<typeof EndpointFormat> => ({
    signature: call.signature,
    args: request,
});

const shallowRemoveUndefined = (request: any): any =>
    Object.keys(request).reduce(
        (acc, key) =>
            Maybe.fromNullable<any>(request[key]).mapOrDefault(
                (val) => ({ ...acc, [key]: val }),
                acc
            ),
        {}
    );
export const endpoint = <A, B>(signature: CallSignature<A, B>) => (
    request: A
): MaybeAsync<B> =>
    MaybeAsync.fromPromise(() =>
        _.flow(
            shallowRemoveUndefined,
            formatSignature(signature),
            functions.httpsCallable("callableEndpoint")
        )(request)
            .then(_.flow((_) => _.data, fromThrowableC(signature.result.check)))
            .catch(
                (error: any) =>
                    Maybe.empty().ifNothing(nothingLog(error)) as Maybe<B>
            )
    );

export const deleteUser = (id: string) => {
    return functions
        .httpsCallable("deleteUser")({
            id,
        })
        .then(function (result) {})
        .catch((error) => {
            console.error(error);
        });
};
