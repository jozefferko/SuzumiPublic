import React, { useMemo, useState } from "react";
import { useLocale } from "../hooks/useLocale";
import { Prompt } from "react-router-dom";

export type UnsavedChangesPupUPContext = {
    unsavedChanges: boolean;
    setUnsavedChanges: (val: boolean) => void;
};

export const unsavedChangesPupUPContext = React.createContext<UnsavedChangesPupUPContext>(
    {
        unsavedChanges: false,
        setUnsavedChanges: () => {},
    }
);
export type UnsavedChangesPupUPProps = {
    children: React.ReactNode;
};
const UnsavedChangesPupUP = (props: UnsavedChangesPupUPProps) => {
    const { t } = useLocale();

    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
    const contextValue: UnsavedChangesPupUPContext = useMemo(
        () => ({
            unsavedChanges,
            setUnsavedChanges,
        }),
        [unsavedChanges]
    );
    return (
        <unsavedChangesPupUPContext.Provider value={contextValue}>
            {props.children}
            <Prompt
                when={unsavedChanges}
                message={t("Are you sure you want to leave without saving?")}
            />
        </unsavedChangesPupUPContext.Provider>
    );
};

export default UnsavedChangesPupUP;
