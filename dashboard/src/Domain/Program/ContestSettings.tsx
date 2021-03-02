import Grid from "@material-ui/core/Grid";
import { Box, NativeSelect } from "@material-ui/core";
import {
    CustomDatePicker,
    CustomField,
    CustomInput,
    CustomText,
    FlexBox,
} from "../../components/styledLib";
import React, { useEffect, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import {
    orderedProductsSelector,
    useSafeSelector,
} from "../../redux/selectors";
import {
    FSContest,
    FSCurrentContest,
    FSProduct,
    FSUpcomingContest,
} from "../../common/types/firestore";
import styled from "styled-components";
import {
    numberFieldHandler,
    textFieldPropsGenerator,
} from "../../utils/genericHandlers";
import { List } from "../../components/logicalLib";
import { Static } from "runtypes";
import { RootState } from "../../redux";
import {
    dateToFSTimestamp,
    formatFSTimestamp,
} from "../../common/utils/dateOperations";
import _ from "lodash/fp";
import { Maybe } from "purify-ts/Maybe";
import { ifJustMaybe } from "../../common/utils/fp";

const FlexField = styled(CustomField)`
    flex-grow: 1;
`;

const SortByBox = styled(Box)`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`;

const CustomSelect = styled(NativeSelect)`
    min-width: 100px;
    margin: 0 0 0 10px;
`;
const toInt = (s: string): number => parseInt(s) || 0;

type OrderByListItemProps = {
    data: Static<typeof FSProduct>;
};
const ProductListItem = (props: OrderByListItemProps) => {
    const { t } = useLocale();

    return (
        <option key={props.data.id} value={props.data.id}>
            {t(props.data.displayName)}
        </option>
    );
};

export type ContestSettingsProps = {
    setCurrent: (contest: FSCurrentContest) => any;
    setUpcoming: (contest: FSUpcomingContest) => any;
};
export const ContestSettings = (props: ContestSettingsProps) => {
    const { t } = useLocale();
    const { setCurrent, setUpcoming } = props;
    const safeContest = useSafeSelector<FSContest>(
        (state) => state.restaurant?.contest
    );

    const safeItems = useSafeSelector<FSProduct[]>(orderedProductsSelector());

    const [nextProduct, setNextProduct] = useState<string>("");
    const [nextDuration, setNextDuration] = useState<string>("");
    const [nextPrice, setNextPrice] = useState<string>("");
    const [curProduct, setCurProduct] = useState<string>("");
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [curPrice, setCurPrice] = useState<string>("");
    useEffect(() => {
        safeContest.ifJust((contest) => {
            setNextProduct(contest.upcoming.product);
            setNextDuration(contest.upcoming.months.toString());
            setNextPrice(contest.upcoming.price.toString());
            setCurProduct(contest.current.product);
            setEndDate(new Date(contest.current.endDate.seconds * 1000));
            setCurPrice(contest.current.price.toString());
        });
    }, [safeContest]);
    useEffect(() => {
        setUpcoming({
            product: nextProduct,
            months: toInt(nextDuration),
            price: toInt(nextPrice),
        });
    }, [nextProduct, nextDuration, nextPrice, setUpcoming]);
    useEffect(() => {
        setCurrent({
            endDate: dateToFSTimestamp(endDate),
            price: toInt(curPrice),
            product: curProduct,
        });
    }, [setCurrent, curProduct, endDate, curPrice]);

    const nextDurationFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        nextDuration,
        setNextDuration
    );
    const nextPriceFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        nextPrice,
        setNextPrice
    );

    const curPriceFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        curPrice,
        setCurPrice
    );
    const nextProductHandler = (
        event: React.ChangeEvent<{ value: unknown }>
    ) => {
        setNextProduct(event.target.value as string);
    };
    const curProductHandler = (
        event: React.ChangeEvent<{ value: unknown }>
    ) => {
        setCurProduct(event.target.value as string);
    };
    return (
        <>
            <Grid item xs={12}>
                <Box height={"40px"} />
                <CustomText fontWeight={500} variant={"h5"}>
                    {t("Contest")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Current contest")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                {/*<CustomText opacity={0.7} fontWeight={400} variant={"body2"}>*/}
                {/*    {t("prize") +*/}
                {/*        ": " +*/}
                {/*        t(*/}
                {/*            safeCurrentItem.mapOrDefault<any>(*/}
                {/*                ($) => $.displayName,*/}
                {/*                ""*/}
                {/*            )*/}
                {/*        )}*/}
                {/*</CustomText>*/}
                {/*<CustomText opacity={0.7} fontWeight={400} variant={"body2"}>*/}
                {/*    {t("end date") +*/}
                {/*        ": " +*/}
                {/*        safeContest.mapOrDefault(*/}
                {/*            ($) => formatFSTimestamp($.current.endDate),*/}
                {/*            ""*/}
                {/*        )}*/}
                {/*</CustomText>*/}
                {/*<CustomText opacity={0.7} fontWeight={400} variant={"body2"}>*/}
                {/*    {t("Entry price") +*/}
                {/*        ": " +*/}
                {/*        safeContest.mapOrDefault<any>(*/}
                {/*            ($) => $.current.price.toString(),*/}
                {/*            ""*/}
                {/*        )}*/}
                {/*</CustomText>*/}
                <FlexBox
                    height={"100%"}
                    width={"100%"}
                    flexDirection={"column"}
                    alignItems={"flex-start"}
                >
                    <FlexBox flexDirection="row" width={"100%"}>
                        <FlexBox height={"100%"} alignItems={"center"}>
                            <FlexField
                                label={t("Entry price")}
                                {...curPriceFieldProps}
                            />
                        </FlexBox>
                    </FlexBox>
                    <FlexBox
                        height={"100%"}
                        alignItems={"center"}
                        paddingTop={"15px"}
                    >
                        <SortByBox>
                            <CustomText opacity={0.6} fontWeight={400}>
                                {t("end date")}
                            </CustomText>
                            <CustomDatePicker
                                selected={endDate}
                                onChange={_.flow(
                                    Maybe.fromNullable,
                                    ifJustMaybe(setEndDate)
                                )}
                            />
                        </SortByBox>
                    </FlexBox>
                    <FlexBox
                        paddingTop={"15px"}
                        flexDirection="row"
                        width={"100%"}
                    >
                        <FlexBox height={"100%"} alignItems={"center"}>
                            <SortByBox>
                                <CustomText opacity={0.6} fontWeight={400}>
                                    {t("prize")}
                                </CustomText>
                                <CustomSelect
                                    value={curProduct}
                                    input={<CustomInput />}
                                    onChange={curProductHandler}
                                >
                                    <List
                                        data={safeItems.orDefault([])}
                                        component={ProductListItem}
                                    />
                                </CustomSelect>
                            </SortByBox>
                        </FlexBox>
                    </FlexBox>
                </FlexBox>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={5} xl={7} />
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Upcoming contest")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <FlexBox
                    height={"100%"}
                    width={"100%"}
                    flexDirection={"column"}
                    alignItems={"center"}
                >
                    <FlexBox flexDirection="row" width={"100%"}>
                        <FlexBox height={"100%"} alignItems={"center"}>
                            <FlexField
                                label={t("Entry price")}
                                {...nextPriceFieldProps}
                            />
                        </FlexBox>
                    </FlexBox>
                    <FlexBox
                        flexDirection="row"
                        width={"100%"}
                        paddingTop={"15px"}
                    >
                        <FlexBox height={"100%"} alignItems={"center"}>
                            <FlexField
                                label={t("Duration (months)")}
                                {...nextDurationFieldProps}
                            />
                        </FlexBox>
                    </FlexBox>
                    <FlexBox
                        paddingTop={"15px"}
                        flexDirection="row"
                        width={"100%"}
                    >
                        <FlexBox height={"100%"} alignItems={"center"}>
                            <SortByBox>
                                <CustomText opacity={0.6} fontWeight={400}>
                                    {t("prize")}
                                </CustomText>
                                <CustomSelect
                                    value={nextProduct}
                                    input={<CustomInput />}
                                    onChange={nextProductHandler}
                                >
                                    <List
                                        data={safeItems.orDefault([])}
                                        component={ProductListItem}
                                    />
                                </CustomSelect>
                            </SortByBox>
                        </FlexBox>
                    </FlexBox>
                </FlexBox>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={5} xl={7} />
        </>
    );
};
