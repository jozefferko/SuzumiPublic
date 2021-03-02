import _ from "lodash/fp";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Static } from "runtypes";
import {
    FSAchievement,
    FSLocaleString,
    FSPathMap,
    FSRestaurant,
} from "../../common/types/firestore";
import { fsRunTransaction } from "../../common/utils/firestore/fsTransaction";
import {
    Achievement,
    AchievementGroup,
    indexedAchievements,
} from "../../redux/selectors";
import { Listified } from "../../components/logicalLib";
import {
    checkBoxHandler,
    numberFieldHandler,
    textFieldHandler,
    textFieldPropsGenerator,
} from "../../utils/genericHandlers";
import { stubFSLocaleString, trigger } from "../../common/utils/fp";
import { LocalizedTextFieldProps } from "../../components/LocalizedTextField";
import { SnackAlertContext } from "../../components/SnackAlertProvider";

type HandleConfirm = (args: Achievement) => any;
type PopUpState = {
    open: boolean;
    item: Achievement | undefined;
};

export type AchievementPopUpProps = PopUpState & {
    onClose: () => void;
    handleConfirm: HandleConfirm;
    loading: boolean;
};

type openPopUp = (item?: Achievement) => void;
const initialPopUpState: PopUpState = { open: false, item: undefined };

export type SetAchievementEnabled = (
    group: number,
    enabled: boolean
) => Promise<any>;

export type AchievementGroupCardProps = {
    data: AchievementGroup;
    onEdit: (item: Achievement) => void;
    onEnable: SetAchievementEnabled;
};
export const useAchievements = (): {
    achievementListProps: Listified<AchievementGroupCardProps>;
    popUpProps: AchievementPopUpProps;
} => {
    const achievements: AchievementGroup[] = useSelector(indexedAchievements());
    const [popUp, setPopUp] = useState<PopUpState>(initialPopUpState);
    const [popUpLoading, setPopUpLoading] = useState<boolean>(false);
    const showAlert = useContext(SnackAlertContext);

    const handleConfirm = useCallback<HandleConfirm>((args) => {
        setPopUpLoading(true);
        const { index, tier, ...achievement } = args;
        fsRunTransaction((transaction) =>
            transaction
                .get(FSPathMap.restaurant)
                .map((restaurant: Static<typeof FSRestaurant>) =>
                    transaction.update(FSPathMap.restaurant)({
                        achievements: restaurant.achievements.map(
                            (group, groupIndex) =>
                                groupIndex === index
                                    ? {
                                          ...group,
                                          tiers: group.tiers.map(
                                              (oldAchievement, tierIndex) =>
                                                  tierIndex ===
                                                  group.tiers.length - tier - 1
                                                      ? achievement
                                                      : oldAchievement
                                          ),
                                      }
                                    : group
                        ),
                    })
                )
                .run()
        ).then(() => {
            showAlert("Operation successful", "success");
            setPopUp((state) => ({ ...state, open: false }));
            setTimeout(() => {
                setPopUp(initialPopUpState);
                setPopUpLoading(false);
            }, 200);
        });
    }, []);

    const setEnabled = (group: number, enabled: boolean) =>
        fsRunTransaction((transaction) =>
            transaction
                .get(FSPathMap.restaurant)
                .map((restaurant: Static<typeof FSRestaurant>) =>
                    transaction.update(FSPathMap.restaurant)({
                        achievements: [
                            ...restaurant.achievements.slice(0, group),
                            {
                                ...restaurant.achievements[group],
                                active: enabled,
                            },
                            ...restaurant.achievements.slice(group + 1),
                        ],
                    })
                )
                .map(_.stubTrue)
                .run()
        );

    const popUpProps: AchievementPopUpProps = useMemo(
        () => ({
            ...popUp,
            onClose: () => setPopUp(initialPopUpState),
            handleConfirm,
            loading: popUpLoading,
        }),
        [handleConfirm, popUp, popUpLoading]
    );
    const openPopUp: openPopUp = useCallback<openPopUp>(
        (item) => setPopUp({ open: true, item }),
        []
    );

    const achievementListProps = {
        data: achievements,
        childProps: { onEnable: setEnabled, onEdit: openPopUp },
    };
    return {
        achievementListProps,
        popUpProps,
    };
};

export type AchievementTierProps = {
    data: Achievement;
    onEdit: (achievement: Achievement) => any;
};
export const useAchievementGroupCard = (props: AchievementGroupCardProps) => {
    const { data, onEdit, onEnable } = props;
    const achievementTierListProps: Listified<AchievementTierProps> = {
        data: data.tiers,
        childProps: { onEdit },
    };
    const switchProps = {
        checked: data.active,
        onChange: checkBoxHandler((v) => onEnable(data.index, v)),
    };
    return { achievementTierListProps, switchProps };
};

export type AchievementEditorProps = {
    data: FSAchievement;
    onChange: (i: FSAchievement) => any;
};
export const useAchievementEditor = (props: AchievementPopUpProps) => {
    const { item, handleConfirm } = props;
    const [displayName, setDisplayName] = useState<FSLocaleString>(
        stubFSLocaleString
    );
    const [description, setDescription] = useState<FSLocaleString>(
        stubFSLocaleString
    );
    const [reward, setReward] = useState<string>("");
    const [goal, setGoal] = useState<string>("");

    useEffect(() => {
        if (item) {
            setDisplayName(item.displayName);
            setDescription(item.description);
            setReward(item.reward.toString());
            setGoal(item.goal.toString());
        }
    }, [item]);

    const displayNameFieldProps: LocalizedTextFieldProps = {
        onChange: setDisplayName,
        value: displayName,
    };
    const descriptionFieldProps: LocalizedTextFieldProps = {
        onChange: setDescription,
        value: description,
    };

    const rewardFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        reward,
        setReward
    );
    const goalFieldProps = textFieldPropsGenerator(numberFieldHandler)(
        goal,
        setGoal
    );
    const confirmButtonProps = {
        onClick: trigger(handleConfirm)({
            index: item?.index ?? -1,
            tier: item?.tier ?? -1,
            description,
            displayName,
            goal: parseInt(goal) || 0,
            reward: parseInt(reward) || 0,
        }),
    };
    return {
        displayNameFieldProps,
        descriptionFieldProps,
        rewardFieldProps,
        goalFieldProps,
        confirmButtonProps,
    };
};
