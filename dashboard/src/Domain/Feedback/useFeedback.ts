import React, { useEffect, useState } from "react";
import {
    FSFeedbackStat,
    FSPathMap,
    FSRestaurant,
    FSUser,
} from "../../common/types/firestore";
import { fsGet } from "../../common/utils/firestore/getters";
import { membersWithComments, useSafeSelector } from "../../redux/selectors";
import { useSafeStats } from "../../hooks/useSafeStats";
import { Listified } from "../../components/logicalLib";
import { FeedbackQuestionProps } from "./FeedbackQuestion";
import { whereFactory } from "../../common/utils/firestore/queries";
import { CommentTableRowProps } from "./CommentTableRow";
import { TableCell, TablePagination, TableRow } from "@material-ui/core";
import { formatFSTimestamp } from "../../common/utils/dateOperations";
import { textFieldHandler } from "../../utils/genericHandlers";
import _ from "lodash/fp";
import { useDispatch, useSelector } from "react-redux";
import { cacheMembers } from "../../redux/cachedMembersSlice";

const toInt = (s: string): number => parseInt(s) || 0;

const stubStats: FSFeedbackStat = { answers: 0, positive: 0 };
export const useFeedback = () => {
    const d = useDispatch();
    const safeStats = useSafeStats();
    const safeRestaurant = useSafeSelector<FSRestaurant>(
        (state) => state.restaurant
    );
    const feedbackQuestionListProps: Listified<FeedbackQuestionProps> = {
        data: safeRestaurant
            .mapOrDefault((restaurant) => restaurant.feedback.questions, [])
            .map((question, index) => ({
                question: question.displayName,
                stats: safeStats
                    .chainNullable(($) => $.feedback[index])
                    .orDefault(stubStats),
            })),
        childProps: {},
    };
    const reviews = useSelector(membersWithComments());
    useEffect(() => {
        if (d)
            fsGet({
                path: FSPathMap.users,
                options: { where: [whereFactory("feedback.comment", ">", "")] },
            })
                .ifRight(_.flow(cacheMembers, d))
                .run();
    }, [d]);
    const commentTableRowListProps: Listified<CommentTableRowProps> = {
        data: reviews,
        childProps: {},
    };
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const commentTablePaginationProps = {
        onChangeRowsPerPage: textFieldHandler(_.flow(toInt, setRowsPerPage)),
        rowsPerPage,
        page,
        onChangePage: (event: any, p: number) => setPage(p),
        count: reviews.length,
    };

    return {
        feedbackQuestionListProps,
        commentTableRowListProps,
        commentTablePaginationProps,
    };
};
