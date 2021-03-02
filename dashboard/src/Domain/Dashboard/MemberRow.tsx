import { TableCell, TableRow } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import React from "react";
import styled from "styled-components";
import { trigger } from "../../common/utils/fp";
import { Condition } from "../../components/logicalLib";
import {
    ConfirmButton,
    CustomField,
    CustomText,
    FlexBox,
    IconButton,
} from "../../components/styledLib";
import {
    numberFieldHandler,
    textFieldPropsGenerator,
} from "../../utils/genericHandlers";
import { SelectedUser } from "./useDashboard";
import { useLocale } from "../../hooks/useLocale";

type MemberRowProps = {
    data: SelectedUser;
    split: boolean;
    removeUser: (id: string) => void;
    addRemainder: (id: string) => void;
    setUserAmount: (id: string) => (amount: string) => void;
};
const OfferImage = styled.img`
    height: 50px;
    width: 50px;
    object-fit: cover;
    margin-right: 10px;
    border-radius: 10px;
`;
const PaddedButton = styled(ConfirmButton)`
    margin-left: 10px;
    margin-right: 10px;
    height: 40px;
    width: 120px;
`;
const SmallField = styled(CustomField)`
    width: 100px;
`;

const MemberRow = (props: MemberRowProps) => {
    const { t } = useLocale();
    const user = props.data.user;
    const removeUserButtonProps = {
        onClick: trigger(props.removeUser)(user.id),
    };
    const addRestButtonProps = {
        onClick: trigger(props.addRemainder)(user.id),
    };
    const amountFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        props.data.amount,
        props.setUserAmount(user.id)
    );
    return (
        <TableRow>
            <TableCell>
                <OfferImage src={props.data.user.photoUrl} />
            </TableCell>
            <TableCell>
                <CustomText fontWeight={400}>
                    {props.data.user.displayName}
                </CustomText>
            </TableCell>
            <TableCell>
                <CustomText fontWeight={400}>
                    {props.data.user.phoneNumber}
                </CustomText>
            </TableCell>

            <TableCell align="right">
                <Condition value={props.split}>
                    <FlexBox alignItems={"center"} justifyContent={"flex-end"}>
                        <SmallField {...amountFieldProps} />
                        <PaddedButton {...addRestButtonProps}>
                            {t("Add rest")}
                        </PaddedButton>
                        <IconButton {...removeUserButtonProps}>
                            <CloseIcon />
                        </IconButton>
                    </FlexBox>
                    <></>
                </Condition>
            </TableCell>
        </TableRow>
    );
};

export default MemberRow;
