import { Box, TableCell, TableRow, Typography } from "@material-ui/core";
import React, { useMemo } from "react";
import {
    FSFeedbackQuestion,
    FSLocaleString,
    FSUser,
    FSUserFeedback,
} from "../../common/types/firestore";
import { formatFSTimestamp } from "../../common/utils/dateOperations";
import { Maybe } from "purify-ts";
import { CustomText } from "../../components/styledLib";
import { useSafeSelector } from "../../redux/selectors";
import { maybeAll } from "../../common/utils/fp";
import { List } from "../../components/logicalLib";
import { useLocale } from "../../hooks/useLocale";
import styled from "styled-components";

export type CommentTableRowProps = {
    data: FSUser;
};

const Answer = (props: {
    data: { displayName: FSLocaleString; liked: boolean };
}) => {
    const { t } = useLocale();
    return (
        <Box borderBottom={"1px solid #dddddd"}>
            <CustomText textColor={props.data.liked ? "#4caf50" : "#b2102f"}>
                {t(props.data.displayName)}
            </CustomText>
        </Box>
    );
};
const CommentCell = styled(TableCell)`
    text-transform: none;
`;
const CommentTableRow = (props: CommentTableRowProps) => {
    const safeFeedback = useMemo<Maybe<FSUserFeedback>>(
        () => Maybe.fromNullable(props.data.feedback),
        [props.data.feedback]
    );
    const safeQuestions = useSafeSelector<FSFeedbackQuestion[]>(
        (selector) => selector.restaurant?.feedback.questions
    );
    const answers = useMemo(
        () =>
            maybeAll<{ [i: string]: boolean }, FSFeedbackQuestion[]>(
                safeFeedback.chainNullable((feedback) => feedback.answers),
                safeQuestions
            ).mapOrDefault(
                ([answers, questions]) =>
                    Object.keys(answers).map((index) => ({
                        liked: answers[index],
                        displayName: questions[parseInt(index)].displayName,
                    })),
                []
            ),
        [safeFeedback, safeQuestions]
    );
    return (
        <TableRow>
            <TableCell component="th" scope="row">
                {props.data.displayName}
            </TableCell>
            <TableCell>
                {safeFeedback.mapOrDefault(
                    (feedback) => formatFSTimestamp(feedback.saved, true),
                    ""
                )}
            </TableCell>
            <TableCell>
                <List component={Answer} data={answers} />
            </TableCell>
            <CommentCell align="right">
                {safeFeedback.mapOrDefault((feedback) => feedback.comment, "")}
            </CommentCell>
        </TableRow>
    );
};

export default CommentTableRow;
