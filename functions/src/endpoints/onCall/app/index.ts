import * as functions from "firebase-functions";
import { Maybe } from "purify-ts";
import { fromThrowableC, maybeAll, nothingLog } from "../../../common/utils/fp";
import {
    AppRoute,
    createAppRoute,
    EndpointFormat,
    onCallSignatures,
} from "../../../common/types/calls";
import { Static } from "runtypes/lib/runtype";
import { activateRoute, purchaseContestRoute, purchaseRoute } from "./products";
import { claimAchievementRoute } from "./achievements";

const pingRoute = createAppRoute(
    onCallSignatures.ping,
    (uid) => ({ message }) => ({
        message,
    })
);

const Routes: AppRoute<any, any>[] = [
    pingRoute,
    purchaseRoute,
    activateRoute,
    purchaseContestRoute,
    claimAchievementRoute,
];

const callAppRoute = ([uid, incoming]: [
    string,
    Static<typeof EndpointFormat>
]): Maybe<any> =>
    Maybe.fromNullable(
        Routes.find((route) => route.signature.signature === incoming.signature)
    )
        .ifJust((route) => {
            console.log("functionName", route.signature.signature);
            console.log("functionName", incoming.args);
        })
        .chain((route) =>
            fromThrowableC(route.signature.args.check)(incoming.args).map(
                route.func(uid)
            )
        );

export const callableAppEndpoint = functions
    .region("europe-west3")
    .https.onCall((data, context) =>
        maybeAll(
            Maybe.fromNullable(context.auth).map(($) => $.uid),
            fromThrowableC(EndpointFormat.check)(data)
        )
            .ifNothing(nothingLog("bad request"))
            .chain(callAppRoute)
            .orDefault(null)
    );
