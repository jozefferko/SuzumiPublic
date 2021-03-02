import { Box, TextField } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import { CustomField, CustomText, FlexBox } from "../../components/styledLib";
import Grid from "@material-ui/core/Grid";
import { useLocale } from "../../hooks/useLocale";
import { TierSettingsProps, useTierSettings } from "./useProgram";
import LocalizedTextField from "../../components/LocalizedTextField";

export const TierLabel = styled(CustomText)`
    text-transform: capitalize;
`;

const FlexField = styled(CustomField)`
    flex-grow: 1;
`;
const TierSettings = (props: TierSettingsProps) => {
    const { t } = useLocale();
    const { descriptionFieldProps, pointsFieldProps } = useTierSettings(props);
    return (
        <>
            <Grid item xs={12}>
                <Box height={"20px"} />
                <TierLabel
                    fontWeight={500}
                    variant={"h6"}
                    textColor={props.data.color}
                >
                    {t(props.data.displayName)}
                </TierLabel>
            </Grid>
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Required points")}
                </CustomText>
                <CustomText opacity={0.7} fontWeight={400} variant={"body2"}>
                    {t("Set the required points to unlock this tier")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <FlexBox height={"100%"} alignItems={"center"}>
                    <FlexField {...pointsFieldProps} />
                </FlexBox>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={5} xl={7} />
            <Grid item xs={12} sm={6} md={5} lg={3} xl={2}>
                <CustomText opacity={0.7} fontWeight={500} variant={"h6"}>
                    {t("Tier benefit")}
                </CustomText>
                <CustomText opacity={0.7} fontWeight={400} variant={"body2"}>
                    {t("Set the benefit for members in this tier")}
                </CustomText>
            </Grid>
            <Grid item xs={12} sm={5} md={6} lg={4} xl={3}>
                <LocalizedTextField
                    multiline
                    rows={4}
                    {...descriptionFieldProps}
                />
            </Grid>
        </>
    );
};

export default TierSettings;
