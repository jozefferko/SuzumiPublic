import * as functions from "firebase-functions";
import { FSPathMap } from "../../../common/types/firestore";
import { userSearchIndexBuilder } from "../../../common/utils/searchIndexes";
import { checkDocument } from "../../../common/utils/firestore/queries";

export const createSearchIndex = functions
    .region("europe-west3")
    .firestore.document(`${FSPathMap.users.path}/{userId}`)
    .onCreate((change) =>
        checkDocument(FSPathMap.users.runtype)(change)
            .toMaybe()
            .map(userSearchIndexBuilder)
            .mapOrDefault(
                (newIndexes) =>
                    change.ref.update({
                        searchIndex: newIndexes,
                    }),
                null
            )
    );
