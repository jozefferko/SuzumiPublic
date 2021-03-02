import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Static } from "runtypes";
import { FSLocaleString } from "../common/types/firestore";

export const useLocale = () => {
    const { t, i18n } = useTranslation();
    const localePicker = useCallback(
        (
            localeString: Static<typeof FSLocaleString> | string,
            params: any = {}
        ): string =>
            typeof localeString === "string"
                ? t(localeString, {
                      interpolation: { escapeValue: false },
                      ...params,
                  })
                : (i18n.language === "en"
                      ? localeString.en
                      : localeString.dk) ||
                  localeString.en ||
                  localeString.dk,
        [i18n.language, t]
    );
    return { t: localePicker, i18n, fsT: localePicker };
};
