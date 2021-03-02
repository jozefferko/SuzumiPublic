import { Box, Button, CircularProgress } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React, { useRef } from "react";
import styled from "styled-components";
import CustomModal from "../../components/CustomModal";
import { Condition } from "../../components/logicalLib";
import {
    ConfirmButton,
    CustomField,
    CustomText,
    FlexBox,
    ImagePlaceholder,
} from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import { ProductsPopUpProps, useRewardsEditor } from "./useRewards";
import LocalizedTextField from "../../components/LocalizedTextField";

const HiddenInput = styled.input`
    display: none;
`;
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

const ImageLabelsBox = styled(FlexBox)`
    margin-left: 10px;
    flex-direction: column;
`;
const OfferImage = styled.img`
    height: 100px;
    width: 100px;
    object-fit: cover;
    margin-right: 20px;
    border-radius: 10px;
`;

const UploadImageButton = styled(Button).attrs({ variant: "outlined" })`
    border-radius: 20px;
    //background-color: #ffaf47;
    &:hover {
        background-color: #fff6ea;
    }
    height: 40px;
    width: 160px;
    color: #ffaf47;
    border-color: #ffaf47;
    text-transform: none;
    margin-bottom: 10px;
`;

const RewardEditor = (props: ProductsPopUpProps) => {
    const { t } = useLocale();
    const { loading, image } = props;

    const uploaderRef = useRef<HTMLInputElement | null>(null);

    const {
        confirmButtonProps,
        descriptionFieldProps,
        displayNameFieldProps,
        priceFieldProps,
        deleteButtonProps,
        isEditing,
        showPlaceHolder,
        imgUrl,
        claimedDescriptionFieldProps,
    } = useRewardsEditor(props);

    return (
        <CustomModal {...props}>
            <Container>
                <GridBase container spacing={3}>
                    <Grid item xs={12}>
                        <Condition
                            name={"editing or creating"}
                            value={isEditing}
                        >
                            <Header flexDirection="column">
                                <CustomText fontWeight={500} variant={"h5"}>
                                    {t("Edit reward")}
                                </CustomText>
                                <CustomText
                                    fontWeight={400}
                                    variant={"subtitle1"}
                                >
                                    {t("Edit reward and click save")}
                                </CustomText>
                            </Header>
                            <Header flexDirection="column">
                                <CustomText fontWeight={500} variant={"h5"}>
                                    {t("Add new reward")}
                                </CustomText>
                                <CustomText
                                    fontWeight={400}
                                    variant={"subtitle1"}
                                >
                                    {t(
                                        "Insert the title and description of the reward along with the required points."
                                    )}
                                </CustomText>
                            </Header>
                        </Condition>
                    </Grid>
                    <Grid item xs={3}>
                        <Condition value={showPlaceHolder}>
                            <ImagePlaceholder />
                            <OfferImage src={imgUrl} />
                        </Condition>
                    </Grid>
                    <Grid item xs={9}>
                        <ImageLabelsBox>
                            <HiddenInput
                                accept="image/*"
                                ref={uploaderRef}
                                type="file"
                                onChange={image.loadImage}
                            />
                            <UploadImageButton
                                onClick={() => {
                                    if (uploaderRef.current)
                                        uploaderRef.current.click();
                                }}
                            >
                                {t("Upload Image")}
                            </UploadImageButton>

                            <CustomText
                                fontWeight={400}
                                opacity={0.5}
                                variant={"body2"}
                            >
                                {t("Acceptable formats") +
                                    ":" +
                                    t("jpeg and png")}
                            </CustomText>
                        </ImageLabelsBox>
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
                            {t("Description (Available)")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <LocalizedTextField
                            multiline
                            rows={2}
                            {...descriptionFieldProps}
                        />
                    </Grid>

                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Description (Claimed)")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <LocalizedTextField
                            multiline
                            rows={2}
                            {...claimedDescriptionFieldProps}
                        />
                    </Grid>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Required points")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <FlexBox flexDirection="row">
                            <FlexField {...priceFieldProps} />
                        </FlexBox>
                    </Grid>
                    <Grid item xs={12}>
                        <FlexBox
                            justifyContent={"flex-end"}
                            flexDirection="row"
                        >
                            <Condition name={"is loading"} value={loading}>
                                <CircularProgress />
                                <Condition
                                    name={"editing or creating"}
                                    value={isEditing}
                                >
                                    <>
                                        <ConfirmButton {...deleteButtonProps}>
                                            {t("Delete")}
                                        </ConfirmButton>
                                        <Box width={"20px"} />
                                        <ConfirmButton {...confirmButtonProps}>
                                            {t("Save")}
                                        </ConfirmButton>
                                    </>
                                    <>
                                        <ConfirmButton {...confirmButtonProps}>
                                            {t("Create")}
                                        </ConfirmButton>
                                    </>
                                </Condition>
                            </Condition>
                        </FlexBox>
                    </Grid>
                </GridBase>
            </Container>
        </CustomModal>
    );
};

export default RewardEditor;
