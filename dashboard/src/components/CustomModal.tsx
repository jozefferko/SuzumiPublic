import { Box, Slide } from "@material-ui/core";
import Backdrop from "@material-ui/core/Backdrop";
import Button from "@material-ui/core/Button";
import Modal, { ModalProps } from "@material-ui/core/Modal";
import CloseIcon from "@material-ui/icons/Close";
import React from "react";
import styled from "styled-components";
import { Card } from "./styledLib";

const StyledModal = styled(Modal)`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CloseIconButton = styled(Button)`
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e9eaeb;
    border-radius: 20px;
    margin-bottom: 20px;
    min-width: 0;
    padding: 0;
`;

const Header = styled(Box)`
    display: flex;
    justify-content: flex-end;
    align-items: center;
`;
type CustomModalProps = ModalProps & {
    onClose: () => void;
    children: React.ReactChild | React.ReactChildren;
};

export default function CustomModal(props: CustomModalProps) {
    const { children, ...modalProps } = props;
    return (
        <StyledModal
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
            {...modalProps}
        >
            <Slide direction="up" in={modalProps.open}>
                <Card overflow={"scroll"} maxHeight={"100%"}>
                    <Header>
                        <CloseIconButton onClick={() => modalProps.onClose()}>
                            <CloseIcon fontSize="small" />
                        </CloseIconButton>
                    </Header>
                    {children}
                </Card>
            </Slide>
        </StyledModal>
    );
}
