import { useContext, useEffect, useMemo, useState } from "react";
import { Static } from "runtypes";
import { FSPathMap, FSRestaurant } from "../../common/types/firestore";
import { fsUpload, fsUploadType } from "../../common/utils/firestore/queries";
import { useSafeSelector } from "../../redux/selectors";
import {
    textFieldHandler,
    textFieldPropsGenerator,
} from "../../utils/genericHandlers";
import { RootState } from "../../redux";
import { SnackAlertContext } from "../../components/SnackAlertProvider";
import { unsavedChangesPupUPContext } from "../../components/UnsavedChangesPopUp";

export const useSettings = () => {
    const safeRestaurant = useSafeSelector<Static<typeof FSRestaurant>>(
        (s: RootState) => s.restaurant
    );
    const [takeawayA, setTakeawayA] = useState<string>("");
    const [takeawayB, setTakeawayB] = useState<string>("");
    const [bookingA, setBookingA] = useState<string>("");
    const [bookingB, setBookingB] = useState<string>("");
    const [qrContains, setQrContains] = useState<string>("");

    useEffect(() => {
        safeRestaurant.ifJust((restauarnt) => {
            setTakeawayA(restauarnt.links.takeaway.aalborg);
            setTakeawayB(restauarnt.links.takeaway.randers);
            setBookingA(restauarnt.links.booking.aalborg);
            setBookingB(restauarnt.links.booking.randers);
            setQrContains(restauarnt.qrContains);
        });
    }, [safeRestaurant]);

    const takeawayAFieldProps = textFieldPropsGenerator(textFieldHandler)(
        takeawayA,
        setTakeawayA
    );
    const takeawayBFieldProps = textFieldPropsGenerator(textFieldHandler)(
        takeawayB,
        setTakeawayB
    );
    const bookingAFieldProps = textFieldPropsGenerator(textFieldHandler)(
        bookingA,
        setBookingA
    );
    const bookingBFieldProps = textFieldPropsGenerator(textFieldHandler)(
        bookingB,
        setBookingB
    );
    const qrContainsFieldProps = textFieldPropsGenerator(textFieldHandler)(
        qrContains,
        setQrContains
    );
    const showAlert = useContext(SnackAlertContext);
    const disabled = useMemo(
        () =>
            safeRestaurant.mapOrDefault(
                (restauarnt) =>
                    takeawayA === restauarnt.links.takeaway.aalborg &&
                    takeawayB === restauarnt.links.takeaway.randers &&
                    bookingA === restauarnt.links.booking.aalborg &&
                    bookingB === restauarnt.links.booking.randers &&
                    qrContains === restauarnt.qrContains,
                true
            ),
        [bookingA, bookingB, safeRestaurant, takeawayA, takeawayB, qrContains]
    );
    const { setUnsavedChanges } = useContext(unsavedChangesPupUPContext);
    useEffect(() => {
        setUnsavedChanges(!disabled);
    }, [disabled, setUnsavedChanges]);
    const handleSave = () =>
        fsUpload({
            type: fsUploadType.update,
            path: FSPathMap.restaurant,
            data: {
                links: {
                    takeaway: { aalborg: takeawayA, randers: takeawayB },
                    booking: { aalborg: bookingA, randers: bookingB },
                },
                qrContains,
            },
        })
            .then(() => showAlert("Settings updated", "success"))
            .catch(() => showAlert("Failed to update Settings"));
    const saveButtonProps = {
        onClick: handleSave,
        disabled,
    };
    return {
        takeawayAFieldProps,
        takeawayBFieldProps,
        bookingAFieldProps,
        bookingBFieldProps,
        qrContainsFieldProps,
        saveButtonProps,
    };
};
