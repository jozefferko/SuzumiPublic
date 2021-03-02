import { Box, CircularProgress } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React from "react";
import styled from "styled-components";
import CustomModal from "../../components/CustomModal";
import {
    ConfirmButton,
    CustomField,
    CustomText,
    FlexBox,
} from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import { AchievementPopUpProps, useAchievementEditor } from "./useAchievements";
import { Condition } from "../../components/logicalLib";
import LocalizedTextField from "../../components/LocalizedTextField";

const Container = styled(Box)`
    padding: 0 20px;
    max-width: 600px;
`;

const Label = styled(CustomText)`
    padding-top: 10px;
`;

const FlexField = styled(CustomField)`
    flex-grow: 1;
    margin-left: 10px;
`;

const GridBase = styled(Grid)`
    flex-grow: 1;
`;

const Header = styled(FlexBox)`
    margin-bottom: 10px;
`;

const AchievementEditor = (props: AchievementPopUpProps) => {
    const { t } = useLocale();
    const { item, handleConfirm, loading, ...modalProps } = props;
    const {
        descriptionFieldProps,
        displayNameFieldProps,
        goalFieldProps,
        rewardFieldProps,
        confirmButtonProps,
    } = useAchievementEditor(props);

    return (
        <CustomModal {...modalProps}>
            <Container>
                <GridBase container spacing={3}>
                    <Grid item xs={12}>
                        <Header flexDirection="column">
                            <CustomText fontWeight={500} variant={"h5"}>
                                {item
                                    ? t("Edit Achievement")
                                    : t("Add new item")}
                            </CustomText>
                            <CustomText fontWeight={400} variant={"subtitle1"}>
                                {item
                                    ? t("Edit achievement data and click save")
                                    : t("Input achievement data to add it")}
                            </CustomText>
                        </Header>
                    </Grid>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Reward")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <FlexBox flexDirection="row">
                            <FlexField {...rewardFieldProps} />
                        </FlexBox>
                    </Grid>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Goal")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <FlexBox flexDirection="row">
                            <FlexField {...goalFieldProps} />
                        </FlexBox>
                    </Grid>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Title")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <LocalizedTextField {...displayNameFieldProps} />
                    </Grid>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Description")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <LocalizedTextField {...descriptionFieldProps} />
                    </Grid>
                    <Grid item xs={12}>
                        <FlexBox
                            justifyContent={"flex-end"}
                            flexDirection="row"
                        >
                            <Condition value={loading}>
                                <CircularProgress />
                                <ConfirmButton {...confirmButtonProps}>
                                    {item ? t("Save") : "Add"}
                                </ConfirmButton>
                            </Condition>
                        </FlexBox>
                    </Grid>
                </GridBase>
            </Container>
        </CustomModal>
    );
};

export default AchievementEditor;
