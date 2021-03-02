import { Maybe } from "purify-ts";
import { useEffect, useMemo } from "react";
import { Static } from "runtypes";
import { FSPathMap, FSTransaction } from "../../common/types/firestore";
import { fsListener } from "../../common/utils/firestore/listeners";
import {
    orderByFactory,
    whereFactory,
} from "../../common/utils/firestore/queries";
import { useSafeState } from "../../hooks/useSafeState";

export const useRecentTransactions = (amount: number) => {
    const [transactions, setTransactions] = useSafeState<
        Static<typeof FSTransaction>[]
    >();
    useEffect(() => {
        fsListener<Static<typeof FSTransaction>>({
            path: FSPathMap.transactions,
            callback: (data: Maybe<Static<typeof FSTransaction>[]>) =>
                data.ifJust(setTransactions),

            options: {
                where: [whereFactory("type", "in", ["correction", "order"])],
                orderBy: [orderByFactory("timestamp", "desc")],
                pagination: {
                    pageSize: amount,
                },
            },
        });
    }, [setTransactions, amount]);
    const [deletePopUp, setDeletePopUp] = useSafeState<string>();
    return {
        sRecentTransactions: transactions,
        deletePopUpState: deletePopUp,
        openDeletePopUp: setDeletePopUp,
    };
};
