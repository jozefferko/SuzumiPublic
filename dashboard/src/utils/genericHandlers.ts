import { Maybe } from "purify-ts";
import React from "react";
import { fromThrowable } from "../common/utils/fp";

type FieldHandler = (setter: (a: string) => any) => OnChange;
type OnChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => any;

export const textFieldHandler: FieldHandler = (setter: (a: string) => void) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
    setter(event.target.value);
};

export const numberFieldHandler: FieldHandler = (
    setter: (a: string) => void
) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(
        fromThrowable(parseInt, event.target.value)
            .chain(Maybe.fromPredicate((a) => a > 0))
            .mapOrDefault((num) => num.toString(), "")
    );
};

const phoneRegex = /^(\+\d*)?$/;
export const phoneFieldHandler: FieldHandler = (
    setter: (a: string) => void
) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (phoneRegex.test(event.target.value)) setter(event.target.value);
};

export const checkBoxHandler = (setter: (a: boolean) => void) => (
    event: React.ChangeEvent<HTMLInputElement>
) => {
    setter(event.target.checked);
};

export type TextFieldProps = {
    value: string;
    onChange: OnChange;
};

export const textFieldPropsGenerator = (handler: FieldHandler) => (
    value: string,
    setter: (a: string) => any
): TextFieldProps => ({
    value: value,
    onChange: handler(setter),
});
