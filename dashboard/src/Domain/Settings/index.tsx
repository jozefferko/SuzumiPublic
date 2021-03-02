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
import { useSettings } from "./useSettings";
import { useLocale } from "../../hooks/useLocale";

const FlexField = styled(CustomField)`
    flex-grow: 1;
`;
const SaveButton = styled(ConfirmButton)`
    position: fixed;
    bottom: 20px;
    right: 30px;
`;
const Settings = () => {
    const { t } = useLocale();
    const {
        takeawayAFieldProps,
        takeawayBFieldProps,
        bookingAFieldProps,
        bookingBFieldProps,
        qrContainsFieldProps,
        saveButtonProps,
    } = useSettings();
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <CustomText fontWeight={500} variant={"h4"}>
                    {t("Settings")}
                </CustomText>
            </Grid>

            <Grid item xs={12}>
                <Box height={"40px"} />
                <CustomText fontWeight={500} variant={"h5"}>
                    {t("QR scan")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("QR scan filter")}
                </CustomText>
                <CustomText opacity={0.7} fontWeight={400} variant={"body2"}>
                    {t("scanned url must contain this text")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <FlexBox height={"100%"} alignItems={"center"}>
                    <FlexField {...qrContainsFieldProps} />
                </FlexBox>
            </Grid>

            <Grid item xs={12}>
                <Box height={"40px"} />
                <CustomText fontWeight={500} variant={"h5"}>
                    {t("Book table links")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Aalborg")}
                </CustomText>
                <CustomText opacity={0.7} fontWeight={400} variant={"body2"}>
                    {t("Book table link for location in Aalborg")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <FlexBox height={"100%"} alignItems={"center"}>
                    <FlexField {...bookingAFieldProps} />
                </FlexBox>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={5} xl={7} />
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Randers")}
                </CustomText>
                <CustomText opacity={0.7} fontWeight={400} variant={"body2"}>
                    {t("Book table link for location in Randers")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <FlexBox height={"100%"} alignItems={"center"}>
                    <FlexField {...bookingBFieldProps} />
                </FlexBox>
            </Grid>

            <Grid item xs={12}>
                <Box height={"40px"} />
                <CustomText fontWeight={500} variant={"h5"}>
                    {t("Takeaway links")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Aalborg")}
                </CustomText>
                <CustomText opacity={0.7} fontWeight={400} variant={"body2"}>
                    {t("Takeaway link for location in Aalborg")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <FlexBox height={"100%"} alignItems={"center"}>
                    <FlexField {...takeawayAFieldProps} />
                </FlexBox>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={5} xl={7} />
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Randers")}
                </CustomText>
                <CustomText opacity={0.7} fontWeight={400} variant={"body2"}>
                    {t("Takeaway link for location in Randers")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <FlexBox height={"100%"} alignItems={"center"}>
                    <FlexField {...takeawayBFieldProps} />
                </FlexBox>
            </Grid>
            <Grid item xs={12}>
                <Box height={"50px"}>
                    <Slide direction="up" in={true}>
                        <SaveButton {...saveButtonProps}>
                            {t("Save")}
                        </SaveButton>
                    </Slide>
                </Box>
            </Grid>
        </Grid>
    );
};
export default Settings;
