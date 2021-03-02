import * as functions from "firebase-functions";
import { FSPathMap } from "../../../common/types/firestore";
import { checkDocument } from "../../../common/utils/firestore/queries";
import { Maybe } from "purify-ts/Maybe";
import { MaybeAsync } from "purify-ts";
import { broadcastNotification } from "../../../utils/notifications";

export const createNotification = functions
    .region("europe-west3")
    .firestore.document(`${FSPathMap.offers.path}/{offerId}`)
    .onCreate((change) =>
        MaybeAsync.liftMaybe(
            checkDocument(FSPathMap.offers.runtype)(change).toMaybe()
        )
            .chain((after) =>
                broadcastNotification({
                    en: {
                        body: after.description.en,
                        title: after.displayName.en,
                    },
                    dk: {
                        body: after.description.dk,
                        title: after.displayName.dk,
                    },
                }).then(Maybe.of)
            )
            .run()
    );
