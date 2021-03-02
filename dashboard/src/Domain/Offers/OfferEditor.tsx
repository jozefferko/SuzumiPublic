import { Box, Button, CircularProgress, NativeSelect } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import CustomModal from "../../components/CustomModal";
import { Condition, List } from "../../components/logicalLib";
import {
    ConfirmButton,
    CustomDatePicker,
    CustomField,
    CustomInput,
    CustomSwitch,
    CustomText,
    FlexBox,
    ImagePlaceholder,
} from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";
import { checkBoxHandler, textFieldHandler } from "../../utils/genericHandlers";
import { OffersPopUpProps } from "./useOffersEditor";
import { Maybe } from "purify-ts/Maybe";
import { ifJustMaybe, stubFSLocaleString } from "../../common/utils/fp";
import _ from "lodash/fp";

import "react-datepicker/dist/react-datepicker.css";
import LocalizedTextField, {
    LocalizedTextFieldProps,
} from "../../components/LocalizedTextField";
import { FSLocaleString, FSOfferSection } from "../../common/types/firestore";
import { SnackAlertContext } from "../../components/SnackAlertProvider";

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

const OfferEditor = (props: OffersPopUpProps) => {
    const { t } = useLocale();
    const {
        item,
        handleConfirm,
        loading,
        image,
        handleDelete,
        ...modalProps
    } = props;
    const [displayName, setDisplayName] = useState<FSLocaleString>(
        stubFSLocaleString
    );
    const [description, setDescription] = useState<FSLocaleString>(
        stubFSLocaleString
    );
    const [url, setUrl] = useState<string>("");
    const [publish, setPublishDate] = useState<Date>(new Date());
    const [expiry, setExpiryDate] = useState<Date>(new Date());
    const [inApp, setInApp] = useState<boolean>(false);
    const [timed, setTimed] = useState<boolean>(false);
    const [section, setSection] = useState<FSOfferSection>("offer");
    useEffect(() => {
        if (modalProps.open) {
            setDisplayName(item?.displayName ?? stubFSLocaleString);

            setDescription(item?.description ?? stubFSLocaleString);
            setUrl(item?.url || "");
            setInApp(item?.type === "inApp");
            setSection(item?.section ?? "offer");
            setPublishDate(
                item ? new Date(item.publish.seconds * 1000) : new Date()
            );
            setExpiryDate(
                item ? new Date(item.expiry.seconds * 1000) : new Date()
            );
            setTimed(item?.shouldExpire ?? false);
        }
    }, [modalProps.open, item]);
    const sectionHandler = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSection(event.target.value as FSOfferSection);
    };

    const displayNameFieldProps: LocalizedTextFieldProps = {
        onChange: setDisplayName,
        value: displayName,
    };
    const descriptionFieldProps: LocalizedTextFieldProps = {
        onChange: setDescription,
        value: description,
    };

    const uploaderRef = useRef<HTMLInputElement | null>(null);

    const BoundHandleConfirm = () =>
        handleConfirm({
            inApp,
            displayName,
            description,
            url,
            expiry,
            publish,
            section,
            timed,
        });

    return (
        <CustomModal {...modalProps}>
            <Container>
                <GridBase container spacing={3}>
                    <Grid item xs={12}>
                        <Header flexDirection="column">
                            <CustomText fontWeight={500} variant={"h5"}>
                                {item ? t("Edit offer") : t("Add new offer")}
                            </CustomText>
                            <CustomText fontWeight={400} variant={"subtitle1"}>
                                {item
                                    ? t("Edit the offer and save it.")
                                    : t(
                                          "Add an image, title, description and a link. Members get directed to this link when they click on the offer in the app."
                                      )}
                            </CustomText>
                        </Header>
                    </Grid>
                    <Grid item xs={3}>
                        {image.previewUrl.mapOrDefault(
                            (url) => (
                                <OfferImage src={url} />
                            ),
                            item?.imgUrl ? (
                                <OfferImage src={item.imgUrl} />
                            ) : (
                                <ImagePlaceholder />
                            )
                        )}
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
                            {t("Type")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <NativeSelect
                            value={section}
                            input={<CustomInput />}
                            onChange={sectionHandler}
                        >
                            <option value={"offer"}>{t("offer")}</option>
                            <option value={"news"}>{t("news")}</option>
                        </NativeSelect>
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
                            {t("Open in app")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <FlexBox
                            flexDirection="row"
                            alignItems="flex-end"
                            minHeight="30px"
                        >
                            <CustomSwitch
                                checked={inApp}
                                onChange={checkBoxHandler(setInApp)}
                            />
                        </FlexBox>
                    </Grid>
                    <Condition value={inApp}>
                        <>
                            <Grid item xs={3}>
                                <Label
                                    fontWeight={500}
                                    opacity={0.7}
                                    variant={"body2"}
                                >
                                    {t("Description")}
                                </Label>
                            </Grid>
                            <Grid item xs={9}>
                                <LocalizedTextField
                                    multiline
                                    rows={4}
                                    {...descriptionFieldProps}
                                />
                            </Grid>
                        </>
                        <>
                            <Grid item xs={3}>
                                <Label
                                    fontWeight={500}
                                    opacity={0.7}
                                    variant={"body2"}
                                >
                                    {t("Link")}
                                </Label>
                            </Grid>
                            <Grid item xs={9}>
                                <FlexBox flexDirection="row">
                                    <FlexField
                                        value={url}
                                        onChange={textFieldHandler(setUrl)}
                                    />
                                </FlexBox>
                            </Grid>
                        </>
                    </Condition>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Publish")}
                        </Label>
                    </Grid>
                    <Grid item xs={9}>
                        <FlexBox flexDirection="row">
                            <CustomDatePicker
                                selected={publish}
                                onChange={_.flow(
                                    Maybe.fromNullable,
                                    ifJustMaybe(setPublishDate)
                                )}
                            />
                        </FlexBox>
                    </Grid>
                    <Grid item xs={3}>
                        <Label fontWeight={500} opacity={0.7} variant={"body2"}>
                            {t("Expire")}
                        </Label>
                    </Grid>
                    <Condition value={timed}>
                        <Grid item xs={9}>
                            <FlexBox
                                flexDirection="row"
                                alignItems="center"
                                minHeight="30px"
                            >
                                <CustomSwitch
                                    checked={timed}
                                    onChange={checkBoxHandler(setTimed)}
                                />
                                <CustomDatePicker
                                    selected={expiry}
                                    onChange={_.flow(
                                        Maybe.fromNullable,
                                        ifJustMaybe(setExpiryDate)
                                    )}
                                />
                            </FlexBox>
                        </Grid>
                        <Grid item xs={9}>
                            <FlexBox
                                flexDirection="row"
                                alignItems="flex-end"
                                minHeight="30px"
                            >
                                <CustomSwitch
                                    checked={timed}
                                    onChange={checkBoxHandler(setTimed)}
                                />
                            </FlexBox>
                        </Grid>
                    </Condition>
                    <Grid item xs={12}>
                        <FlexBox
                            justifyContent={"flex-end"}
                            flexDirection="row"
                        >
                            <Condition value={loading}>
                                <CircularProgress />
                                <>
                                    <Condition
                                        value={Maybe.fromNullable(
                                            item
                                        ).isJust()}
                                    >
                                        <ConfirmButton onClick={handleDelete}>
                                            {t("Delete")}
                                        </ConfirmButton>
                                        <></>
                                    </Condition>

                                    <Box width={"20px"} />
                                    <ConfirmButton onClick={BoundHandleConfirm}>
                                        {item ? t("Save") : t("Confirm")}
                                    </ConfirmButton>
                                </>
                            </Condition>
                        </FlexBox>
                    </Grid>
                </GridBase>
            </Container>
        </CustomModal>
    );
};

export default OfferEditor;
