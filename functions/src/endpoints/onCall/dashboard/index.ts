import * as functions from "firebase-functions";
import { Maybe } from "purify-ts";
import { fromThrowableC, nothingLog } from "../../../common/utils/fp";
import {
    createRoute,
    EndpointFormat,
    onCallSignatures,
    Route,
} from "../../../common/types/calls";
import { FSRole } from "../../../common/types/firestore";
import _ from "lodash/fp";
import { createUser, deleteUser, updateUser } from "./users";
import { cancelOrder } from "./transactions";
import { Static } from "runtypes/lib/runtype";

const pingRoute = createRoute(onCallSignatures.ping, ({ message }) => ({
    message,
}));

const Routes: Route<any, any>[] = [
    pingRoute,
    createUser,
    updateUser,
    deleteUser,
    cancelOrder,
];

const callRoute = (incoming: Static<typeof EndpointFormat>): Maybe<any> =>
    Maybe.fromNullable(
        Routes.find((route) => route.signature.signature === incoming.signature)
    )
        .ifJust((route) => {
            console.log("functionName", route.signature.signature);
            console.log("functionName", incoming.args);
        })
        .chain((route) =>
            fromThrowableC(route.signature.args.check)(incoming.args).map(
                route.func
            )
        );

export const callableEndpoint = functions
    .region("europe-west3")
    .https.onCall((data, context) =>
        Maybe.fromNullable(context.auth)
            .chain(_.flow(($) => $.token.role, fromThrowableC(FSRole.check)))
            .ifNothing(nothingLog("failed auth"))
            .chain(() => fromThrowableC(EndpointFormat.check)(data))
            .ifNothing(nothingLog("wrong signature"))
            .chain(callRoute)
            .orDefault(null)
    );
