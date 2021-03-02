import { TableCell, TableRow } from "@material-ui/core";
import React from "react";
import { Static } from "runtypes";
import { FSUser } from "../../common/types/firestore";
import { formatFSTimestamp } from "../../common/utils/dateOperations";
import { trigger } from "../../common/utils/fp";
import EditIcon from "@material-ui/icons/Edit";
import styled from "styled-components";
import Button from "@material-ui/core/Button";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";

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
type MemberRowProps = {
    data: Static<typeof FSUser>;
    onEdit: (item: Static<typeof FSUser>) => any;
};
const MemberRow = (props: MemberRowProps) => (
    <TableRow>
        <TableCell component="th" scope="row">
            {props.data.phoneNumber}
        </TableCell>
        <TableCell component="th" scope="row">
            {props.data.displayName}
        </TableCell>
        <TableCell align="right">{props.data.email}</TableCell>
        <TableCell>{props.data.balance}</TableCell>
        <TableCell align="right">
            {formatFSTimestamp(props.data.created)}
        </TableCell>
        <TableCell align="right">
            <EditIconBox onClick={trigger(props.onEdit)(props.data)}>
                <EditIcon fontSize="small" />
            </EditIconBox>
        </TableCell>
    </TableRow>
);

export default MemberRow;
