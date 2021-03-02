import {
    Box,
    Button,
    InputBase,
    LinearProgress,
    TextField,
    Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import PhotoSizeSelectActualIcon from "@material-ui/icons/PhotoSizeSelectActual";
import React from "react";
import DatePicker from "react-datepicker";
import styled from "styled-components";
import Checkbox from "@material-ui/core/Checkbox";

export const FlexBox = styled(Box)`
    display: flex;
`;
export const FlexGrower = styled(Box)`
    display: flex;
    flex-grow: 1;
`;

type CardProps = {
    padded: boolean;
};
export const Card = styled(Box).attrs({ padded: true })`
    background-color: #ffffff;
    padding: ${(props: CardProps) => (props.padded ? `20px` : `0`)};
    border-radius: 10px;
`;

type CustomTextProps = {
    fontWeight?: number;
    opacity?: number;
    textColor?: string;
};
type RGBColor = { r: number; g: number; b: number };
function hexToRgb(hex: string, defaultcolor: RGBColor): RGBColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : defaultcolor;
}
const rgbString = (rgb: RGBColor) => `${rgb.r},${rgb.g},${rgb.b},`;
export const CustomText = styled(Typography)`
    color: rgba(
        ${(props: CustomTextProps) =>
                props.textColor
                    ? rgbString(
                          hexToRgb(props.textColor, {
                              r: 44,
                              g: 48,
                              b: 66,
                          })
                      )
                    : "44,48, 66,"}
            ${(props: CustomTextProps) => (props.opacity ? props.opacity : 1)}
    );
    font-weight: ${(props: CustomTextProps) =>
        props.fontWeight === 500
            ? "500"
            : props.fontWeight === 700
            ? "700"
            : props.fontWeight === 300
            ? "300"
            : "400"};
`;

//4 ways you can style a component
//material-ui/withStyles - JSON based styling
//styled components -
//scss - you create a scss file, import it and use a classname,
//      at top of file - import testStyles from "./../components/test.module.scss";
//      className={testStyles.bruh}
//inline styles - putting styles directly into a component,style={{ fontSize: 30 }}
// material-ui Box, add styling as attributes

export const CustomField = styled(TextField).attrs({
    size: "small",
    variant: "outlined",
})`
    & label.Mui-focused {
        color: #6d6d6d;
    }
    & .MuiOutlinedInput-root {
        & fieldset {
            border-radius: 10px;
            border-color: #d4d5d9;
        }
        &:hover fieldset {
            border-color: #d4d5d9;
        }
        &.Mui-focused fieldset {
            border-color: #d4d5d9;
        }
    }
`;

export const CoolText = styled(Typography)`
    color: #f0f;
`;

export const IconButton = styled(Button).attrs({ variant: "outlined" })`
    border-radius: 10px;
    border-color: #d4d5d9;
    border-width: 1px;
    background-color: #f3f3f4;
    height: 40px;
    width: 50px;
    min-width: 0;
`;

export const ConfirmButton = styled(Button).attrs({ variant: "contained" })`
    border-radius: 40px;
    background-color: #ffaf47;
    &:hover {
        background-color: #ffaf47;
    }
    height: 50px;
    width: 200px;
    color: #ffffff;
    text-transform: none;
`;

const ImagePlaceholderBox = styled(Box)`
    height: 100px;
    width: 100px;
    object-fit: cover;
    margin-right: 20px;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    display: flex;
    background-color: #d9d9d9;
`;

export const ImagePlaceHolderIcon = styled(PhotoSizeSelectActualIcon)`
    color: #f8f8f8;
    font-size: 50px;
`;

export const ImagePlaceholder = ({ className }: { className?: string }) => (
    <ImagePlaceholderBox className={className}>
        <ImagePlaceHolderIcon />
    </ImagePlaceholderBox>
);

export const CustomInput = styled(InputBase)`
    min-width: 100px;
    margin: 0 10px;
    & .MuiInputBase-input {
        border-radius: 10px;
        position: relative;
        border: 1px solid #d4d5d9;
        padding: 10px 26px 10px 12px;
        &:focus {
            border-radius: 10px;
            border-color: #d4d5d9;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
    }
`;

export const CustomDatePicker = styled(DatePicker).attrs({
    customInput: <CustomField />,
    locale: "da-DK",
    dateFormat: "dd/MM/yy",
})`
    margin-left: 10px;
    & .react-datepicker__day--selected {
        background-color: #ffaf47;
    }
`;

export const OutlinedButton = styled(Button).attrs({ variant: "outlined" })`
    border-radius: 20px;
    //background-color: #ffaf47;
    &:hover {
        background-color: #fff6ea;
    }
    height: 40px;
    width: 160px;
    color: #ffaf47;
    border-color: #ffaf47;
    text-transform: none;
    margin-bottom: 10px;
`;

export const CustomSwitch = withStyles((theme) => ({
    root: {
        width: 28,
        height: 16,
        padding: 0,
        display: "flex",
        marginLeft: "10px",
    },
    switchBase: {
        padding: 2,
        color: theme.palette.grey[500],
        "&$checked": {
            transform: "translateX(12px)",
            color: theme.palette.common.white,
            "& + $track": {
                opacity: 1,
                backgroundColor: "#FFAF47",
                borderColor: "#FFAF47",
            },
        },
    },
    thumb: {
        width: 12,
        height: 12,
        boxShadow: "none",
    },
    track: {
        border: `1px solid ${theme.palette.grey[500]}`,
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: "#FFFFFF",
    },
    checked: {},
}))(Switch);

export const CustomCheckbox = withStyles({
    root: {
        paddingLeft: "0px",
        "&:hover": {
            backgroundColor: "transparent",
        },
    },
    icon: {
        borderRadius: 3,
        width: 16,
        height: 16,
        boxShadow:
            "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
        backgroundColor: "#f5f8fa",
        backgroundImage:
            "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
        "$root.Mui-focusVisible &": {
            outline: "2px auto rgba(19,124,189,.6)",
            outlineOffset: 2,
        },
        "input:hover ~ &": {
            backgroundColor: "#ebf1f5",
        },
        "input:disabled ~ &": {
            boxShadow: "none",
            background: "rgba(206,217,224,.5)",
        },
    },
    checkedIcon: {
        backgroundColor: "#137cbd",
        backgroundImage:
            "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
        "&:before": {
            display: "block",
            width: 16,
            height: 16,
            backgroundImage:
                "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
                " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
                "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
            content: '""',
        },
        "input:hover ~ &": {
            backgroundColor: "#106ba3",
        },
    },
})(Checkbox);

export const LikeBar = withStyles((theme) => ({
    root: {
        marginTop: 10,
        height: 10,
        borderRadius: 5,
    },
    colorPrimary: {
        backgroundColor: "#b2102f",
    },
    bar: {
        borderRadius: 5,
        backgroundColor: "#4caf50",
    },
}))(LinearProgress);
