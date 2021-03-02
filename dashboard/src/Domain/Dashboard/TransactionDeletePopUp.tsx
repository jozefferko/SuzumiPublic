import { Box } from "@material-ui/core";
import React, { useCallback, useState } from "react";
import styled from "styled-components";
import CustomModal from "../../components/CustomModal";
import {
    ConfirmButton,
    CustomText,
    FlexBox,
    OutlinedButton,
} from "../../components/styledLib";
import { MemberNotFoundProps } from "./useFindMemberPopUp";
import { useLocale } from "../../hooks/useLocale";
import { endpoint } from "../../utils/cloud";
import { onCallSignatures } from "../../common/types/calls";
import { Maybe } from "purify-ts";

export const CornerButton = styled(OutlinedButton)`
    &:hover {
        background-color: #d3d5e0;
    }
    color: #2c3042;
    border-color: #2c3042;
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 5px;
`;

const Container = styled(Box)`
    padding: 0 20px;
    max-width: 600px;
`;

const PaddedButton = styled(ConfirmButton)`
    margin-left: 5px;
    margin-right: 5px;
    margin-top: 5px;
`;
type TransactionDeletePopUpProps = {
    transactionId: Maybe<string>;
    onClose: () => any;
};

const TransactionDeletePopUp = (props: TransactionDeletePopUpProps) => {
    const { t } = useLocale();
    const [loading, setLoading] = useState(false);

    const handleDelete = useCallback(async () => {
        setLoading(true);
        try {
            await endpoint(onCallSignatures.cancelOrder)({
                transaction: props.transactionId.orDefault(""),
            });
        } catch ($) {}
        setLoading(false);
        props.onClose();
    }, [props.transactionId]);
    const modalProps = {
        open: props.transactionId.isJust(),
        onClose: () => props.onClose(),
    };
    const createButtonProps = {
        onClick: () => handleDelete(),
    };
    const goBackButtonProps = {
        onClick: () => props.onClose(),
    };
    return (
        <CustomModal {...modalProps}>
            <Container>
                <CustomText fontWeight={500} variant={"h5"}>
                    {t(`Are you sure?`)}
                </CustomText>
                <FlexBox
                    flexWrap={"wrap"}
                    flexDirection={"row"}
                    justifyContent={"space-evenly"}
                >
                    <CornerButton {...goBackButtonProps}>
                        {t("Cancel")}
                    </CornerButton>
                    <PaddedButton {...createButtonProps}>
                        {t("Delete")}
                    </PaddedButton>
                </FlexBox>
            </Container>
        </CustomModal>
    );
};

export default TransactionDeletePopUp;
