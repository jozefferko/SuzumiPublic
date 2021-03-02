import { Box } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import CustomModal from "../../components/CustomModal";
import { ConfirmButton, CustomText, FlexBox } from "../../components/styledLib";
import { MemberNotFoundProps } from "./useFindMemberPopUp";
import { useLocale } from "../../hooks/useLocale";

const Container = styled(Box)`
    padding: 0 20px;
    max-width: 600px;
`;

const PaddedButton = styled(ConfirmButton)`
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 5px;
`;

const MemberNotFoundPopUp = (props: MemberNotFoundProps) => {
    const { t } = useLocale();
    const modalProps = { open: props.show, onClose: () => props.onClose() };
    const createButtonProps = {
        onClick: () => props.onClose(true),
    };
    const goBackButtonProps = {
        onClick: () => props.onClose(false),
    };
    return (
        <CustomModal {...modalProps}>
            <Container>
                <CustomText fontWeight={500} variant={"h5"}>
                    {t(`Member {{phoneNumber}} not found.`, {
                        phoneNumber: props.phoneNumber,
                    })}
                </CustomText>
                <FlexBox
                    flexWrap={"wrap"}
                    flexDirection={"row"}
                    justifyContent={"space-evenly"}
                >
                    <PaddedButton {...goBackButtonProps}>
                        {t("Go back")}
                    </PaddedButton>
                    <PaddedButton {...createButtonProps}>
                        {t("Create")}
                    </PaddedButton>
                </FlexBox>
            </Container>
        </CustomModal>
    );
};

export default MemberNotFoundPopUp;
