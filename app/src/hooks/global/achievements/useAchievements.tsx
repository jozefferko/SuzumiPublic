import {Dictionary} from '@reduxjs/toolkit';
import _ from 'lodash/fp';
import {Maybe} from 'purify-ts';
import {useCallback, useEffect, useState} from 'react';
import {Static} from 'runtypes';
import {
    FSPathMap,
    FSRestaurant,
    FSTransaction,
    FSUser,
} from '../../../common/types/firestore';
import {fsUpload, fsUploadType} from '../../../common/utils/firestore/queries';
import {
    mapMaybe,
    nonEmptyArrayPredicate,
    orDefaultMaybe,
    tapLog,
} from '../../../common/utils/fp';
import {useSafeSelector} from '../../../redux/selectors';
import {SettingsSliceState} from '../../../redux/settingsSlice';
import {loadedState, UserStatus} from '../../../redux/userSlice';
import {useEatEarlyAchievement} from './useEatEarlyAchievement';
import {useOpenDailyAchievement} from './useOpenDailyAchievement';
import {useSeasonalAchievements} from './useSeasonalAchievements';
import {useUnlockAllAchievement} from './useUnlockAllAchievement';

/*
0-register
1-spring
2-sumer
3-fall
4-winter

 */

export type Progress = {
    index: number;
    progress: number;
};
export type ProgressUpdater = {
    (p: Progress[]): any;
};
const isProgressDifferentPredicate = (
    newProgresses: Progress[],
    currentProgresses: Progress[],
): boolean =>
    newProgresses.reduce(
        (acc: boolean, val) => acc || filterPredicate(currentProgresses)(val),
        false,
    );

const filterPredicate = (current: Progress[]) => (p: Progress): boolean =>
    _.flow(
        _.find((status: Progress) => status.index === p.index),
        Maybe.fromNullable,
        mapMaybe(($) => $.progress < p.progress),
        orDefaultMaybe(true),
    )(current);

const filterProgresses = (
    newProgresses: Progress[],
    currentProgresses: Progress[],
): Progress[] => newProgresses.filter(filterPredicate(currentProgresses));

const extractProgressFromUser = (user: loadedState): Progress[] =>
    Object.keys(user.achievementStatus).map((key) => ({
        index: parseInt(key),
        progress: user.achievementStatus[key].progress,
    }));

const updateAchievements = (user: FSUser, progresses: Progress[]) =>
    fsUpload({
        path: FSPathMap.users.doc(user.id),
        type: fsUploadType.update,
        data: {
            achievementStatus: progresses.reduce(
                (acc: Dictionary<{progress: number}>, val) => ({
                    ...acc,
                    [val.index]: {progress: val.progress},
                }),
                {},
            ),
        },
    });
const containsProgress = (arr: Progress[]) => (p: Progress) =>
    arr.map(($) => $.index).some(_.equals(p.index));
const useAchievementStatusUpdater = (
    safeUser: Maybe<loadedState>,
): ProgressUpdater => {
    const [achievementStatuses, setAchievementStatuses] = useState<Progress[]>(
        [],
    );

    useEffect(() => {
        safeUser
            .filter(
                _.flow(
                    extractProgressFromUser,
                    (currentProgresses) =>
                        filterProgresses(
                            achievementStatuses,
                            currentProgresses,
                        ),
                    nonEmptyArrayPredicate,
                ),
            )
            .ifJust((user) => {
                console.log('update list', achievementStatuses);
                return achievementStatuses.length > 0
                    ? updateAchievements(user, achievementStatuses)
                    : null;
            });
    }, [achievementStatuses, safeUser]);
    return useCallback(
        (incoming: Progress[]) =>
            setAchievementStatuses((statuses) =>
                _.flow(filterProgresses, (filteredProgresses) =>
                    filteredProgresses.length > 0
                        ? [
                              ...statuses.filter(
                                  _.negate(
                                      containsProgress(filteredProgresses),
                                  ),
                              ),
                              ...filteredProgresses,
                          ]
                        : statuses,
                )(incoming, statuses),
            ),
        [],
    );
};

export const useAchievements = () => {
    const safeUser = useSafeSelector<loadedState>((state) =>
        state.user.status === UserStatus.loaded ? state.user : null,
    );
    const safeRestaurant = useSafeSelector<FSRestaurant>(
        (state) => state.restaurant,
    );
    const safeTransactions = useSafeSelector<{[id: string]: FSTransaction}>(
        (state) => state.transactions,
    );
    const safeSettings = useSafeSelector<Static<typeof SettingsSliceState>>(
        (state) => state.settings,
    );
    const updateStatus = useAchievementStatusUpdater(safeUser);

    useSeasonalAchievements(
        safeUser,
        safeRestaurant,
        safeTransactions,
        updateStatus,
    );
    useUnlockAllAchievement(safeUser, safeRestaurant, updateStatus);
    useEatEarlyAchievement(safeUser, safeTransactions, updateStatus);
    useOpenDailyAchievement(safeUser, safeSettings, updateStatus);
};
