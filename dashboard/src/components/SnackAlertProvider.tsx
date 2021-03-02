import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React, { useCallback, useState } from "react";
import { useLocale } from "../hooks/useLocale";

export type SnackAlertSeverity = "error" | "success" | "info" | "warning";
export type SnackAlertProps = {
    defaultSeverity?: SnackAlertSeverity;
    children: React.ReactNode;
};

export type ShowSnackAlert = (
    message: string,
    severity?: SnackAlertSeverity
) => void;

export const SnackAlertContext = React.createContext<ShowSnackAlert>(() => {});
const SnackAlertProvider = (props: SnackAlertProps) => {
    const { t } = useLocale();
    const [label, setLabel] = useState("");
    const [severity, setSeverity] = useState<SnackAlertSeverity>(
        props.defaultSeverity ?? "error"
    );
    const closeSnackAlert = useCallback(() => {
        setLabel("");
    }, []);
    const clearSeverity = useCallback(() => {
        setSeverity(props.defaultSeverity ?? "error");
    }, [props.defaultSeverity]);
    const showSnackAlert: ShowSnackAlert = useCallback((message, severity) => {
        setLabel(message);
        if (severity) setSeverity(severity);
    }, []);

    return (
        <SnackAlertContext.Provider value={showSnackAlert}>
            {props.children}
            <Snackbar
                open={label.length > 0}
                autoHideDuration={6000}
                onClose={closeSnackAlert}
                onExited={clearSeverity}
            >
                <Alert onClose={closeSnackAlert} severity={severity}>
                    {t(label)}
                </Alert>
            </Snackbar>
        </SnackAlertContext.Provider>
    );
};

export default SnackAlertProvider;
