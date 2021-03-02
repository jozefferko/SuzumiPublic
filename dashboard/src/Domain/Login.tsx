import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import React from "react";
import styled from "styled-components";
import { ConditionalComponentProps } from "../components/logicalLib";
import {
    Card,
    ConfirmButton,
    CustomField,
    FlexBox
} from "../components/styledLib";
import { useAuth } from "../hooks/useAuth";
import { textFieldHandler } from "../utils/genericHandlers";

const Root = styled(Container)`
    margin-top: 20px;
    flex-grow: 1;
`;

const Login: React.FC<ConditionalComponentProps> = () => {
    const { signInWithEmailAndPassword } = useAuth();
    const [email, setEmail] = React.useState<string>("b@b.com");
    const [pass, setPass] = React.useState<string>("bbbbbb"); 
 
    const handleSignIn = () => {
        signInWithEmailAndPassword(email, pass);
    };

    return (
        <Root>
            <Grid container spacing={3} justify={"center"}>
                <Grid item xs={6}>
                    <Card>
                        <FlexBox
                            justifyContent={"center"}
                            alignItems={"center"}
                            flexGrow={1}
                            flexDirection={"column"}
                            marginTop={"20px"}
                        >
                            <FlexBox flexDirection="row">
                                <CustomField
                                    id="filled-name"
                                    label="mail"
                                    value={email}
                                    onChange={textFieldHandler(setEmail)}
                                />
                            </FlexBox>
                            <FlexBox flexDirection="row" margin={"20px"}>
                                <CustomField
                                    type={"password"}
                                    id="filled-pass"
                                    label="password"
                                    value={pass}
                                    onChange={textFieldHandler(setPass)}
                                />
                            </FlexBox>
                            <ConfirmButton onClick={handleSignIn}>
                                Sign in
                            </ConfirmButton>
                        </FlexBox>
                    </Card>
                </Grid>
            </Grid>
        </Root>
    );
};

export default Login;
