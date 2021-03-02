import { Box, Slide } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React from "react";
import styled from "styled-components";
import {
    ConfirmButton,
    CustomField,
    CustomText,
    FlexBox,
} from "../../components/styledLib";
import { useProgram } from "./useProgram";
import TierSettings from "./TierSettings";
import { List } from "../../components/logicalLib";
import { useLocale } from "../../hooks/useLocale";
import { ContestSettings } from "./ContestSettings";

const FlexField = styled(CustomField)`
    flex-grow: 1;
`;
const SaveButton = styled(ConfirmButton)`
    position: fixed;
    bottom: 20px;
    right: 30px;
`;
const Program = () => {
    const { t } = useLocale();
    const {
        conversionRateField,
        expiryFieldProps,
        saveButtonProps,
        tierSettingsListProps,
        contestSettingsProps,
    } = useProgram();
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <CustomText fontWeight={500} variant={"h4"}>
                    {t("Program")}
                </CustomText>
                <CustomText
                    opacity={0.7}
                    fontWeight={400}
                    variant={"subtitle1"}
                >
                    {t("Manage points and tier settings")}
                </CustomText>
            </Grid>

            <Grid item xs={12}>
                <Box height={"40px"} />
                <CustomText fontWeight={500} variant={"h5"}>
                    {t("Points")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Point currency")}
                </CustomText>
                <CustomText opacity={0.7} fontWeight={400} variant={"body2"}>
                    {t("Set points earned for every 1 kr. spent")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <FlexBox height={"100%"} alignItems={"center"}>
                    <FlexField {...conversionRateField} />
                </FlexBox>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={5} xl={7} />
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Point expiry")}
                </CustomText>
                <CustomText opacity={0.7} fontWeight={400} variant={"body2"}>
                    {t("Set for how many months points are valid")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <FlexBox height={"100%"} alignItems={"center"}>
                    <FlexField {...expiryFieldProps} />
                </FlexBox>
            </Grid>
            <ContestSettings {...contestSettingsProps} />
            <Grid item xs={12}>
                <Box height={"40px"} />
                <CustomText fontWeight={500} variant={"h5"}>
                    {t("Tiers")}
                </CustomText>
            </Grid>
            <List component={TierSettings} {...tierSettingsListProps} />
            <Grid item xs={12}>
                <Box height={"50px"}>
                    <Slide direction="up" in={true}>
                        <SaveButton {...saveButtonProps}>Save</SaveButton>
                    </Slide>
                </Box>
            </Grid>
        </Grid>
    );
};
export default Program;
