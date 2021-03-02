import { FSLocaleString } from "../common/types/firestore";
import React, { useEffect, useState } from "react";
import { CustomField, FlexBox } from "./styledLib";
import Grid from "@material-ui/core/Grid";
import styled from "styled-components";
import { useLocale } from "../hooks/useLocale";
import {
    textFieldHandler,
    textFieldPropsGenerator,
} from "../utils/genericHandlers";
import { TextFieldProps } from "@material-ui/core/TextField/TextField";

const FlexField = styled(CustomField)`
    flex-grow: 1;
    margin-left: 10px;
`;

export type LocalizedTextFieldProps = {
    value: FSLocaleString;
    onChange: (v: FSLocaleString) => void;
    multiline?: boolean | undefined;
    rows?: string | number;
};

const LocalizedTextField = (props: LocalizedTextFieldProps) => {
    const { t } = useLocale();
    const { value, onChange, ...passProps } = props;
    const enFieldProps = textFieldPropsGenerator(textFieldHandler)(
        value.en,
        (en) => onChange({ ...value, en })
    );
    const dkFieldProps = textFieldPropsGenerator(textFieldHandler)(
        value.dk,
        (dk) => onChange({ ...value, dk })
    );
    return (
        <FlexBox
            height={"100%"}
            width={"100%"}
            flexDirection={"column"}
            alignItems={"center"}
        >
            <FlexBox flexDirection="row" width={"100%"}>
                <FlexField
                    {...passProps}
                    label={t("Danish")}
                    {...dkFieldProps}
                />
            </FlexBox>
            <FlexBox paddingTop={"15px"} flexDirection="row" width={"100%"}>
                <FlexField
                    {...passProps}
                    label={t("English")}
                    {...enFieldProps}
                />
            </FlexBox>
        </FlexBox>
    );
};
export default LocalizedTextField;
