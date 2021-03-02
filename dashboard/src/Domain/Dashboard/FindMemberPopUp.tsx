import { Box, Hidden } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import QrReader from "react-qr-reader";
import styled from "styled-components";
import CustomModal from "../../components/CustomModal";
import {
    ConfirmButton,
    CustomField,
    FlexBox,
} from "../../components/styledLib";
import ConfirmMemberPopUp from "./ConfirmMemberPopUp";
import MemberNotFoundPopUp from "./MemberNotFoundPopUp";
import { FindMemberPopUpProps, useFindMemberPopUp } from "./useFindMemberPopUp";
import { useLocale } from "../../hooks/useLocale";

const Container = styled(Box)`
    padding: 0 20px;
    max-width: 900px;
`;
const Spacer = styled(Box)`
    width: 1px;
    margin: 0 20px 0 20px;
    background-color: #d0d0d0;
`;

const SearchButton = styled(ConfirmButton)`
    margin-top: 10px;
    margin-bottom: 10px;
`;

const FindMemberPopUp = (props: FindMemberPopUpProps) => {
    const { t } = useLocale();
    const {
        confirmMemberProps,
        memberNotFoundProps,
        phoneNumberField,
        qrReaderProps,
        searchButtonProps,
    } = useFindMemberPopUp(props);

    const modalProps = { open: props.show, onClose: () => props.onClose() };

    return (
        <>
            <CustomModal {...modalProps}>
                <Container>
                    <FlexBox
                        flexWrap={"wrap"}
                        flexDirection={"row"}
                        height={"100%"}
                        justifyContent={"center"}
                        // alignItems={"center"}
                    >
                        <FlexBox
                            flexDirection={"column"}
                            justifyContent={"center"}
                            alignItems={"center"}
                            flexGrow={1}
                        >
                            <CustomField {...phoneNumberField} />
                            <SearchButton {...searchButtonProps}>
                                {t("Search")}
                            </SearchButton>
                        </FlexBox>
                        <Hidden xsDown>
                            <Spacer />
                        </Hidden>
                        <QrReader
                            style={{
                                width: "350px",
                                height: "350px",
                            }}
                            {...qrReaderProps}
                        />
                    </FlexBox>
                </Container>
            </CustomModal>
            <MemberNotFoundPopUp {...memberNotFoundProps} />
            <ConfirmMemberPopUp {...confirmMemberProps} />
        </>
    );
};

export default FindMemberPopUp;
