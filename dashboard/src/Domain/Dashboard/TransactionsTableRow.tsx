import {
    Button,
    CircularProgress,
    TableCell,
    TableRow,
} from "@material-ui/core";
import React, { useCallback, useState } from "react";
import { Static } from "runtypes";
import { FSTransaction } from "../../common/types/firestore";
import { formatFSTimestamp } from "../../common/utils/dateOperations";
import CloseIcon from "@material-ui/icons/Close";
import styled from "styled-components";
import { endpoint } from "../../utils/cloud";
import { onCallSignatures } from "../../common/types/calls";
import { Condition } from "../../components/logicalLib";
import { useMemoizedMember } from "../../hooks/useMemoizedMember";

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
`;

type TransactionsTableRowProps = {
    data: Static<typeof FSTransaction>;
    onDelete: (transaction: string) => any;
};

const TransactionsTableRow = (props: TransactionsTableRowProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const handleDeleteTransaction = () => props.onDelete(props.data.id);
    //     useCallback(async () => {
    //     setLoading(true);
    //     try {
    //         await endpoint(onCallSignatures.cancelOrder)({
    //             orderNumber: props.data.ref,
    //         });
    //     } catch ($) {}
    //     setLoading(false);
    // }, [props.data.ref]);
    const member = useMemoizedMember(props.data.user);
    return (
        <TableRow>
            <TableCell component="th" scope="row">
                {formatFSTimestamp(props.data.timestamp, true)}
            </TableCell>
            <TableCell align="right">
                {member.mapOrDefault(($) => $.displayName, "")}
            </TableCell>
            <TableCell align="right">
                {member.mapOrDefault(($) => $.phoneNumber, "")}
            </TableCell>
            <TableCell component="th" scope="row">
                {props.data.amount}
            </TableCell>
            <TableCell align="right">{props.data.ref}</TableCell>
            <TableCell align="right">
                <Condition value={loading}>
                    <CircularProgress size={"small"} />
                    <EditIconBox onClick={handleDeleteTransaction}>
                        <CloseIcon fontSize="small" />
                    </EditIconBox>
                </Condition>
            </TableCell>
        </TableRow>
    );
};

export default TransactionsTableRow;
