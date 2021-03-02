import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React from "react";
import styled from "styled-components";
import { Card, CustomText } from "../../components/styledLib";
import { List } from "../../components/logicalLib";
import { useLocale } from "../../hooks/useLocale";
import { useFeedback } from "./useFeedback";
import FeedbackQuestion from "./FeedbackQuestion";
import CommentTableRow from "./CommentTableRow";

const CommentsCard = styled(Card)`
    overflow: scroll;
`;
const Feedback = () => {
    const { t } = useLocale();
    const {
        feedbackQuestionListProps,
        commentTableRowListProps,
        commentTablePaginationProps,
    } = useFeedback();
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <CustomText fontWeight={500} variant={"h4"}>
                    {t("Feedback")}
                </CustomText>
                <CustomText
                    opacity={0.7}
                    fontWeight={400}
                    variant={"subtitle1"}
                >
                    {t("See the feedback from your users")}
                </CustomText>
                <Box height={"40px"} />
            </Grid>
            <Grid item xs={12}>
                <Card>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <CustomText fontWeight={500} variant={"h5"}>
                                {t("Questions")}
                            </CustomText>
                        </Grid>
                        <List
                            component={FeedbackQuestion}
                            {...feedbackQuestionListProps}
                        />
                    </Grid>
                </Card>
            </Grid>

            {/*<Grid item xs={12}>*/}
            {/*    <Box height={"40px"} />*/}
            {/*    <CustomText fontWeight={500} variant={"h5"}>*/}
            {/*        {t("Comments")}*/}
            {/*    </CustomText>*/}
            {/*</Grid>*/}
            <Grid item xs={12}>
                <CommentsCard>
                    <Box>
                        <CustomText fontWeight={500} variant={"h5"}>
                            {t("Comments")}
                        </CustomText>
                    </Box>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <CustomText opacity={0.7} fontWeight={500}>
                                        {t("Name")}
                                    </CustomText>
                                </TableCell>
                                <TableCell>
                                    <CustomText opacity={0.7} fontWeight={500}>
                                        {t("Time and date")}
                                    </CustomText>
                                </TableCell>
                                <TableCell>
                                    <CustomText opacity={0.7} fontWeight={500}>
                                        {t("Likes")}
                                    </CustomText>
                                </TableCell>

                                <TableCell align="right">
                                    <CustomText opacity={0.7} fontWeight={500}>
                                        {t("Comment")}
                                    </CustomText>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <List
                                component={CommentTableRow}
                                {...commentTableRowListProps}
                            />
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                {/*@ts-ignore*/}
                                <TablePagination
                                    colSpan={4}
                                    {...commentTablePaginationProps}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CommentsCard>
            </Grid>
        </Grid>
    );
};
export default Feedback;
