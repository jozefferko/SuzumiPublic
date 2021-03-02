import * as functions from "firebase-functions";
import { FSPathMap } from "../../../common/types/firestore";
import { MaybeAsync } from "purify-ts";
import { checkDocument } from "../../../common/utils/firestore/queries";
import { unicastNotification } from "../../../utils/notifications";
import { Maybe } from "purify-ts/Maybe";
import { earnedPointsNotification } from "../../../common/types/notifications";

export const transactionCreated = functions
    .region("europe-west3")
    .firestore.document(`${FSPathMap.transactions.path}/{tId}`)
    .onCreate((change) =>
        MaybeAsync.liftMaybe(
            checkDocument(FSPathMap.transactions.runtype)(change).toMaybe()
        )
            .filter((t) => t.type === "order")
            .chain((t) =>
                unicastNotification(earnedPointsNotification(t.amount))(
                    t.user
                ).then(Maybe.of)
            )
            .run()
    );
