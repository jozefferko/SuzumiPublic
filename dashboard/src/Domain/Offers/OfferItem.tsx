import { Box } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import EditIcon from "@material-ui/icons/Edit";
import OpenWithIcon from "@material-ui/icons/OpenWith";
import React from "react";
import { Static } from "runtypes";
import styled from "styled-components";
import { FSOffer } from "../../common/types/firestore";
import { DraggableComponentProps } from "../../components/logicalLib";
import { Card, CustomText, FlexBox } from "../../components/styledLib";
import { useLocale } from "../../hooks/useLocale";

const OfferImage = styled.img`
    height: 100px;
    width: 100px;
    object-fit: cover;
    margin-right: 20px;
    border-radius: 10px;
`;
const EditIconBox = styled(Button)`
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e9eaeb;
    border-radius: 20px;
    min-width: 0;
    padding: 0;
    margin-right: 10px;
`;
const MoveIconBox = styled(Box)`
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e9eaeb;
    border-radius: 7px;
`;
const Container = styled(Card)`
    margin: 10px 0;
`;

type props = DraggableComponentProps<Static<typeof FSOffer>> & {
    onEdit: (offer: Static<typeof FSOffer>) => void;
};
const OfferItem = (props: props) => {
    const { t } = useLocale();
    return (
        <Container>
            <FlexBox flexDirection="row">
                <Box display="flex">
                    <OfferImage src={props.data.imgUrl} />
                </Box>
                <Box display="flex" flexGrow={1}>
                    <CustomText fontWeight={400} variant={"h5"}>
                        {t(props.data.displayName)}
                    </CustomText>
                </Box>
                <Box display="flex">
                    <EditIconBox onClick={() => props.onEdit(props.data)}>
                        <EditIcon fontSize="small" />
                    </EditIconBox>
                    <MoveIconBox {...props.dragHandleProps}>
                        <OpenWithIcon fontSize="small" />
                    </MoveIconBox>
                </Box>
            </FlexBox>
        </Container>
    );
};

export default OfferItem;
