import { Box, Button, Typography } from "@material-ui/core";
import React from "react";
import styled from "styled-components";
import { booleanify } from "../common/utils/fp";
import { Link, useRouteMatch } from "react-router-dom";

type styledProp = {
    active: boolean;
};

const MenuItem = styled(Box)`
    width: 100%;
    display: flex;
    flex-direction: row;
    border-color: #fff;
    border-style: solid;
    border-width: ${(styledProp: styledProp) =>
        styledProp.active ? `0 0 0 2px` : `0`};
    color: ${(styledProp: styledProp) =>
        styledProp.active ? `"#FFFFFF"` : `#ABACB3`};
    height: 50px;
    justify-content: flex-start;
    align-items: center;
    padding-left: ${(styledProp: styledProp) =>
        styledProp.active ? `18px` : `20px`};
    line-height: 0.2;
`;
const MenuButton = styled(Button)`
    text-transform: none;
    width: 100%;
    display: flex;
    flex-direction: row;
    border-color: #fff;
    border-style: solid;
    border-width: ${(styledProp: styledProp) =>
        styledProp.active ? `0 0 0 2px` : `0`};
    color: ${(styledProp: styledProp) =>
        styledProp.active ? `"#FFFFFF"` : `#ABACB3`};
    height: 50px;
    justify-content: flex-start;
    align-items: center;
    padding-left: ${(styledProp: styledProp) =>
        styledProp.active ? `18px` : `20px`};
    line-height: 0.2;
`;
const MenuItemLabel = styled(Typography)`
    padding-left: 20px;
    color: ${(styledProp: styledProp) =>
        styledProp.active ? `#FFFFFF` : `#ABACB3`};
`;
// const IconBox = styled(Box)`
//     color: ${(styledProp: styledProp) =>
//         styledProp.active ? `#FFFFFF` : `#707070`};
// `;

type NavigationItemProps = {
    to: string;
    icon: any;
    label: string;
};
export const NavItem = (props: NavigationItemProps) => {
    const { url } = useRouteMatch();
    const current = useRouteMatch({
        path: `${url}/${props.to}`,
        strict: true,
        sensitive: true,
    });
    return (
        <Link to={`${url}/${props.to}`} style={{ textDecoration: "none" }}>
            <MenuItem active={booleanify(current)}>
                <props.icon
                    style={{
                        color: booleanify(current) ? `#FFFFFF` : `#ABACB3`,
                    }}
                />
                <MenuItemLabel active={booleanify(current)}>
                    {props.label}
                </MenuItemLabel>
            </MenuItem>
        </Link>
    );
};

type NavigationButtonProps = {
    onClick: () => void;
    icon: any;
    label: string;
};
export const NavButton = (props: NavigationButtonProps) => (
    <MenuButton active={false} onClick={props.onClick}>
        <props.icon
            style={{
                color: `#ABACB3`,
            }}
        />
        <MenuItemLabel active={false}>{props.label}</MenuItemLabel>
    </MenuButton>
);
