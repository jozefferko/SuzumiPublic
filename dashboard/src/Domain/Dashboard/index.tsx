import {
    Box,
    CircularProgress,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React, { useMemo } from "react";
import styled from "styled-components";
import { Condition, List } from "../../components/logicalLib";
import {
    Card,
    ConfirmButton,
    CustomField,
    CustomText,
    FlexBox,
    OutlinedButton,
} from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import MemberEditor from "../Members/MemberEditor";
import { useMembers } from "../Members/useMembers";
import FindMemberPopUp from "./FindMemberPopUp";
import MemberRow from "./MemberRow";
import TransactionsTableRow from "./TransactionsTableRow";
import { useDashboard } from "./useDashboard";
import { useRecentTransactions } from "./useRecentTransactions";
import TransactionDeletePopUp from "./TransactionDeletePopUp";

const FlexField = styled(CustomField)`
    flex-grow: 1;
`;

const CornerButtonBox = styled(FlexBox)`
    height: 100%;
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 5px;
`;
export const CornerButton = styled(OutlinedButton)`
    &:hover {
        background-color: #d3d5e0;
    }
    color: #2c3042;
    border-color: #2c3042;
`;

const RecentTransactionsCard = styled(Card)`
    overflow: scroll;
`;
const Dashboard = () => {
    const { t } = useLocale();
    const {
        sRecentTransactions,
        deletePopUpState,
        openDeletePopUp,
    } = useRecentTransactions(20);
    const transactionListProps = useMemo(
        () => ({
            data: sRecentTransactions,
            childProps: { onDelete: openDeletePopUp },
        }),
        [sRecentTransactions]
    );

    const {
        submitButtonProps,
        findMemberButtonProps,

        findMemberPopUpProps,
        loading,
        memberRowListProps,
        orderAmountFieldProps,
        orderNumberFieldProps,
        remainder,
        split,
    } = useDashboard();

    const { popUpProps, openPopUp } = useMembers();
    const addMemberButtonProps = {
        onClick: () => openPopUp(),
    };

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <CustomText fontWeight={500} variant={"h4"}>
                    {t("Dashboard")}
                </CustomText>

                <CustomText
                    fontWeight={400}
                    opacity={0.7}
                    variant={"subtitle1"}
                >
                    {t(
                        "Start managing the loyalty program or add points to a member account."
                    )}
                </CustomText>
            </Grid>
            <Grid item xs={12} md={4}>
                <CornerButtonBox>
                    <CornerButton {...addMemberButtonProps}>
                        {t("Create member")}
                    </CornerButton>
                </CornerButtonBox>
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
                <Card>
                    <Grid container>
                        <Grid item xs={12}>
                            <Box paddingBottom={"40px"}>
                                <CustomText fontWeight={500} variant={"h5"}>
                                    {t("Add points to a member account")}
                                </CustomText>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box paddingTop={"5px"}>
                                <CustomText
                                    opacity={0.7}
                                    fontWeight={500}
                                    variant={"h6"}
                                >
                                    {t("Order amount")}
                                </CustomText>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FlexBox
                                paddingBottom={"30px"}
                                height={"100%"}
                                alignItems={"center"}
                            >
                                <FlexField
                                    {...orderAmountFieldProps}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="start">
                                                kr.
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </FlexBox>
                        </Grid>
                        <Grid item md={4} />
                        <Grid item xs={12} md={4}>
                            <Box paddingTop={"5px"}>
                                <CustomText
                                    opacity={0.7}
                                    fontWeight={500}
                                    variant={"h6"}
                                >
                                    {t("Order number")}
                                </CustomText>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <FlexBox height={"100%"} alignItems={"center"}>
                                <FlexField {...orderNumberFieldProps} />
                            </FlexBox>
                        </Grid>
                        <Grid item md={4} />

                        <Grid item xs={12}>
                            <Box paddingBottom={"20px"} paddingTop={"40px"}>
                                <CustomText fontWeight={500} variant={"h5"}>
                                    {t("Choose an account")}
                                </CustomText>
                            </Box>

                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell
                                            align={"left"}
                                            width={"60px"}
                                        />
                                        <TableCell align={"left"}>
                                            <CustomText
                                                opacity={0.7}
                                                fontWeight={500}
                                            >
                                                {t("Name")}
                                            </CustomText>
                                        </TableCell>
                                        <TableCell align={"left"}>
                                            <CustomText
                                                opacity={0.7}
                                                fontWeight={500}
                                            >
                                                {t("Phone number")}
                                            </CustomText>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Condition value={split}>
                                                <CustomText
                                                    opacity={0.7}
                                                    fontWeight={500}
                                                >
                                                    {t("Split amount")}
                                                </CustomText>
                                                <></>
                                            </Condition>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <List
                                        component={MemberRow}
                                        {...memberRowListProps}
                                    />
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            component="th"
                                            scope="row"
                                        >
                                            <FlexBox
                                                flexDirection={"row"}
                                                justifyContent={"center"}
                                            >
                                                <OutlinedButton
                                                    {...findMemberButtonProps}
                                                >
                                                    {t("Select Member")}
                                                </OutlinedButton>
                                            </FlexBox>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Grid>
                        <Grid item xs={12}>
                            <FlexBox
                                flexDirection={"column"}
                                alignItems={"flex-end"}
                                flexGrow={1}
                                paddingTop={"20px"}
                                paddingRight={"20px"}
                            >
                                <Condition value={split}>
                                    <>
                                        <CustomText
                                            variant={"body2"}
                                            opacity={0.3}
                                            fontWeight={500}
                                        >
                                            {t(
                                                "{{remainder}} kr. left to assign from total order amount.",
                                                { remainder }
                                            )}
                                        </CustomText>
                                    </>
                                    <></>
                                </Condition>
                                <Box paddingTop={"30px"}>
                                    <Condition value={loading}>
                                        <CircularProgress />

                                        <ConfirmButton {...submitButtonProps}>
                                            {t("Submit")}
                                        </ConfirmButton>
                                    </Condition>
                                </Box>
                            </FlexBox>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <RecentTransactionsCard>
                    <Box>
                        <CustomText fontWeight={500} variant={"h5"}>
                            {t("Recent Transactions")}
                        </CustomText>
                    </Box>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <CustomText opacity={0.7} fontWeight={500}>
                                        {t("Time and date")}
                                    </CustomText>
                                </TableCell>
                                <TableCell>
                                    <CustomText opacity={0.7} fontWeight={500}>
                                        {t("Name")}
                                    </CustomText>
                                </TableCell>

                                <TableCell>
                                    <CustomText opacity={0.7} fontWeight={500}>
                                        {t("Phone number")}
                                    </CustomText>
                                </TableCell>
                                <TableCell>
                                    <CustomText opacity={0.7} fontWeight={500}>
                                        {t("Amount")}
                                    </CustomText>
                                </TableCell>
                                <TableCell align="right">
                                    <CustomText opacity={0.7} fontWeight={500}>
                                        {t("Order Number")}
                                    </CustomText>
                                </TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <List
                                component={TransactionsTableRow}
                                {...transactionListProps}
                            />
                        </TableBody>
                    </Table>
                </RecentTransactionsCard>
            </Grid>
            <TransactionDeletePopUp
                transactionId={deletePopUpState}
                onClose={() => openDeletePopUp()}
            />
            <FindMemberPopUp {...findMemberPopUpProps} />
            <MemberEditor {...popUpProps} />
        </Grid>
    );
};

export default Dashboard;
