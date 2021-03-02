import { useContext, useEffect, useMemo, useState } from "react";
import { Static } from "runtypes";
import {
    FSCurrentContest,
    FSLocaleString,
    FSPathMap,
    FSRestaurant,
    FSTier,
    FSUpcomingContest,
} from "../../common/types/firestore";
import { fsUpload, fsUploadType } from "../../common/utils/firestore/queries";
import { useSafeSelector } from "../../redux/selectors";
import {
    numberFieldHandler,
    textFieldHandler,
    textFieldPropsGenerator,
} from "../../utils/genericHandlers";
import {
    deIndexArray,
    fMap,
    indexArray,
    maybeAll,
    tapLog,
} from "../../common/utils/fp";
import { RootState } from "../../redux";
import { SnackAlertContext } from "../../components/SnackAlertProvider";
import { Listified } from "../../components/logicalLib";
import { DeepPartial, Indexed } from "../../common/types/misc";
import { unsavedChangesPupUPContext } from "../../components/UnsavedChangesPopUp";
import { useSafeState } from "../../hooks/useSafeState";
import { ContestSettings, ContestSettingsProps } from "./ContestSettings";
import _ from "lodash/fp";

const toInt = (s: string): number => parseInt(s) || 0;

export type TierUpdateFunc<A> = (
    tier: Indexed<FSTier>,
    val: A
) => Indexed<FSTier>;
export type EditTier<A> = (
    index: number
) => (func: TierUpdateFunc<A>) => (val: A) => any;

export type TierSettingsProps = {
    data: Indexed<FSTier>;
    onEdit: EditTier<any>;
};

export const useProgram = () => {
    const safeRestaurant = useSafeSelector<Static<typeof FSRestaurant>>(
        (s: RootState) => s.restaurant
    );

    const [conversionRate, setConversionRate] = useState<string>("");
    const [expiry, setExpiry] = useState<string>("");
    const [tiers, setTiers] = useState<Indexed<FSTier>[]>([]);

    useEffect(() => {
        safeRestaurant.ifJust((restauarnt) => {
            setConversionRate(restauarnt.conversionRate.toString());
            setExpiry(restauarnt.expiry.expire.months.toString());
            setTiers(indexArray(restauarnt.tiers.tiers));
        });
    }, [safeRestaurant]);

    const conversionRateField = textFieldPropsGenerator(numberFieldHandler)(
        conversionRate,
        setConversionRate
    );
    const expiryFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        expiry,
        setExpiry
    );
    const onEdit: EditTier<any> = (index) => (func) => (val) =>
        setTiers(
            fMap((tier) => (tier.index === index ? func(tier, val) : tier))
        );

    const showAlert = useContext(SnackAlertContext);
    const [
        safeCurrentContest,
        setCurrentContest,
    ] = useSafeState<FSCurrentContest>();
    const [
        safeUpcomingContest,
        setUpcomingContest,
    ] = useSafeState<FSUpcomingContest>();
    const disabled = useMemo(
        () =>
            maybeAll(
                safeRestaurant,
                safeCurrentContest,
                safeUpcomingContest
            ).mapOrDefault<boolean>(
                ([restauarnt, currentContest, upcomingContest]) =>
                    toInt(conversionRate) === restauarnt.conversionRate &&
                    toInt(expiry) === restauarnt.expiry.expire.months &&
                    tiers.every(({ index, ...tier }) =>
                        _.isEqual(tier, restauarnt.tiers.tiers[index])
                    ) &&
                    _.isEqual(upcomingContest, restauarnt.contest.upcoming) &&
                    _.isEqual(currentContest, restauarnt.contest.current),
                true
            ),
        [
            expiry,
            conversionRate,
            safeRestaurant,
            tiers,
            safeUpcomingContest,
            safeCurrentContest,
        ]
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
                expiry: {
                    expire: { months: toInt(expiry) },
                },
                conversionRate: toInt(conversionRate),
                tiers: { tiers: deIndexArray(tiers) },
                ...maybeAll(
                    safeCurrentContest,
                    safeUpcomingContest
                ).mapOrDefault<DeepPartial<FSRestaurant>>(
                    ([current, upcoming]) => ({
                        contest: { upcoming, current },
                    }),
                    {}
                ),
            },
        })
            .then(() => showAlert("Settings updated", "success"))
            .catch(() => showAlert("Failed to update Settings"));

    const saveButtonProps = {
        onClick: handleSave,
        disabled,
    };
    const tierSettingsListProps: Listified<TierSettingsProps> = {
        data: tiers,
        childProps: { onEdit },
    };
    const contestSettingsProps: ContestSettingsProps = {
        setCurrent: setCurrentContest,
        setUpcoming: setUpcomingContest,
    };
    return {
        tierSettingsListProps,
        conversionRateField,
        expiryFieldProps,
        saveButtonProps,
        contestSettingsProps,
    };
};

export const useTierSettings = (props: TierSettingsProps) => {
    //     const [points, setPoints] = useState<string>("");
    //     const [descriptionEn, setDescriptionEn] = useState<string>("");
    //     const [descriptionDK, setDescriptionDK] = useState<string>("");
    //
    //     useEffect(() => {
    //         setPoints(props.data.points.toString());
    //         setDescriptionEn(restaauarnt.expiry.expire.months.toString());
    //         setDescriptionDK(restauarnt.expiry.expire.months.toString());
    //     }, [props]);
    //

    const editFunc = props.onEdit(props.data.index);
    const descriptionFieldProps = {
        value: props.data.description,
        onChange: editFunc(
            (
                tier: Indexed<FSTier>,
                description: FSLocaleString
            ): Indexed<FSTier> => ({
                ...tier,
                description,
            })
        ),
    };
    const pointsFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        props.data.points.toString(),
        editFunc(
            (tier: Indexed<FSTier>, val: string): Indexed<FSTier> => ({
                ...tier,
                points: toInt(val),
            })
        )
    );
    return { descriptionFieldProps, pointsFieldProps };
};
