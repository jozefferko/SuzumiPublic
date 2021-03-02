import {
    Box,
    InputAdornment,
    NativeSelect,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";
import styled from "styled-components";
import { List } from "../../components/logicalLib";
import {
    Card,
    ConfirmButton,
    CustomField,
    CustomInput,
    CustomText,
    FlexBox,
} from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import { textFieldHandler } from "../../utils/genericHandlers";
import MemberEditor from "./MemberEditor";
import MemberRow from "./MemberTableRow";
import { useMembers, UserSearchOption } from "./useMembers";
import { useSafeStats } from "../../hooks/useSafeStats";
import { FSPathMap } from "../../common/types/firestore";

const Header = styled(Box)`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
`;

const SortByBox = styled(Box)`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`;

const SearchField = styled(CustomField)`
    min-width: 200px;
    flex-grow: 1;
    margin: 0 40px 0 20px;
`;

const CustomSelect = styled(NativeSelect)`
    min-width: 100px;
    margin: 0 0 0 10px;
`;
const OverflowCard = styled(Card)`
    overflow: scroll;
`;
const CornerButtonBox = styled(FlexBox)`
    height: 100%;
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 5px;
`;

type OrderByListItemProps = {
    data: UserSearchOption;
};
const OrderByListItem = (props: OrderByListItemProps) => {
    const { t } = useLocale();
    return (
        <option key={props.data.value} value={props.data.value}>
            {t(props.data.plainName)}
        </option>
    );
};

const Members = () => {
    const { t } = useLocale();
    const { keyword, order, members, popUpProps, openPopUp } = useMembers();

    const orderByHandler = (event: React.ChangeEvent<{ value: unknown }>) => {
        order.setOrder(event.target.value as string);
    };
    const safeStats = useSafeStats();
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <CustomText fontWeight={500} variant={"h4"}>
                    {t("Members")}
                </CustomText>

                <CustomText
                    fontWeight={400}
                    opacity={0.7}
                    variant={"subtitle1"}
                >
                    {t("Edit members or add new ones")}
                </CustomText>
            </Grid>
            <Grid item xs={12} md={4}>
                <CornerButtonBox>
                    <ConfirmButton onClick={() => openPopUp()}>
                        {t("Add member")}
                    </ConfirmButton>
                </CornerButtonBox>
            </Grid>
            <Grid item xs={12}>
                <OverflowCard>
                    <Header>
                        <CustomText opacity={0.5} fontWeight={400}>
                            {t("{{count}} members", {
                                count: safeStats
                                    .chainNullable(
                                        ($) =>
                                            $.counters[FSPathMap.users.path]
                                                ?.count
                                    )
                                    .orDefault(0),
                            })}
                        </CustomText>
                        <SearchField
                            placeholder="Search"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon
                                            style={{ color: `#d4d5d9` }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            value={keyword.value}
                            onChange={textFieldHandler(keyword.setKeyword)}
                        />
                        <SortByBox>
                            <CustomText opacity={0.6} fontWeight={400}>
                                {t("Sort by")}
                            </CustomText>
                            <CustomSelect
                                value={order.value}
                                input={<CustomInput />}
                                onChange={orderByHandler}
                            >
                                <List
                                    childProps={{}}
                                    data={order.orderList}
                                    component={OrderByListItem}
                                />
                            </CustomSelect>
                        </SortByBox>
                    </Header>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <CustomText fontWeight={500}>
                                        {t("Phone")}
                                    </CustomText>
                                </TableCell>
                                <TableCell>
                                    <CustomText fontWeight={500}>
                                        {t("Name")}
                                    </CustomText>
                                </TableCell>
                                <TableCell align="right">
                                    <CustomText fontWeight={500}>
                                        {t("E-mail")}
                                    </CustomText>
                                </TableCell>
                                <TableCell>
                                    <CustomText fontWeight={500}>
                                        {t("Balance")}
                                    </CustomText>
                                </TableCell>
                                <TableCell align="right">
                                    <CustomText fontWeight={500}>
                                        {t("Created")}
                                    </CustomText>
                                </TableCell>
                                <TableCell align="right">
                                    <CustomText fontWeight={500}></CustomText>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <List
                                childProps={{ onEdit: openPopUp }}
                                data={members}
                                component={MemberRow}
                            />
                        </TableBody>
                    </Table>
                    <MemberEditor {...popUpProps} />
                </OverflowCard>
            </Grid>
        </Grid>
    );
};

export default Members;
