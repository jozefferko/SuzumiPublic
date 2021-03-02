import { Box, Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import React from "react";
import { Static } from "runtypes";
import styled from "styled-components";
import { FSBirthday } from "../../common/types/firestore";
import CustomModal from "../../components/CustomModal";
import { ConfirmButton, CustomText, FlexBox } from "../../components/styledLib";
import { ConfirmMemberPopUpProps } from "./useFindMemberPopUp";
import { useLocale } from "../../hooks/useLocale";

const Container = styled(Box)`
    padding: 0 20px;
    max-width: 600px;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
`;

const PaddedButton = styled(ConfirmButton)`
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 5px;
`;

const OfferImage = styled.img`
    height: 200px;
    width: 200px;
    object-fit: cover;
    margin-right: 10px;
    border-radius: 200px;
`;
const formatBirthday = (b: Static<typeof FSBirthday>) =>
    b ? `${b.day}/${b.month}/${b.year}` : "";

const ConfirmMemberPopUp = (props: ConfirmMemberPopUpProps) => {
    const { t } = useLocale();
    const selectButtonProps = {
        onClick: () => props.onClose(true),
    };
    const goBackButtonProps = {
        onClick: () => props.onClose(false),
    };

    const modalProps = { open: props.show, onClose: () => props.onClose() };

    return (
        <CustomModal {...modalProps}>
            <Container>
                <CustomText fontWeight={500} variant={"h5"}>
                    {t("Verify user")}
                </CustomText>
                <OfferImage src={props.user?.photoUrl} />
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>{t("Name")}</TableCell>
                            <TableCell>{props.user?.displayName}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t("Email")}</TableCell>
                            <TableCell>{props.user?.email}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t("Balance")}</TableCell>
                            <TableCell>{props.user?.balance}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>{t("Birthday")}</TableCell>
                            <TableCell>
                                {props.user?.birthday
                                    ? formatBirthday(props.user.birthday)
                                    : ""}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <FlexBox
                    flexWrap={"wrap"}
                    flexDirection={"row"}
                    justifyContent={"space-evenly"}
                >
                    <PaddedButton {...goBackButtonProps}>
                        {t("Go back")}
                    </PaddedButton>
                    <PaddedButton {...selectButtonProps}>
                        {t("Select")}
                    </PaddedButton>
                </FlexBox>
            </Container>
        </CustomModal>
    );
};

export default ConfirmMemberPopUp;
