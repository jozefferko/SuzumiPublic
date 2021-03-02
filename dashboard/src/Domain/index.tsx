import { CircularProgress } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import React from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import Hooker from "../components/Hooker";
import { Condition } from "../components/logicalLib";
import SnackAlertProvider from "../components/SnackAlertProvider";
import { RootState } from "../redux";
import { UserStatus } from "../redux/userSlice";
import Login from "./Login";
import Main from "./Main";
import UnsavedChangesPupUP from "../components/UnsavedChangesPopUp";

const Root = styled(Container)`
    margin-top: 20px;
    flex-grow: 1;
    justify-content: center;
    display: flex;
    align-items: center;
`;

export default function Domain() {
    const { status, id } = useSelector((state: RootState) => state.user);

    return (
        <SnackAlertProvider>
            <UnsavedChangesPupUP>
                <CssBaseline />
                <Hooker />
                <Condition
                    name={"is logged in"}
                    value={status !== UserStatus.off}
                >
                    <Condition name={"is logged in"} value={id}>
                        <Main ifTrue />
                        <Login ifFalse />
                    </Condition>
                    <Root>
                        <CircularProgress />
                    </Root>
                </Condition>
            </UnsavedChangesPupUP>
        </SnackAlertProvider>
    );
}
