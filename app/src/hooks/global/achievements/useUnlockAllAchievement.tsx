import {Maybe} from 'purify-ts';
import {useEffect} from 'react';
import {
    achievementIndexes,
    FSAchievementStatus,
    FSRestaurant,
    FSUser,
} from '../../../common/types/firestore';
import {
    mapMaybe,
    maybeAll,
    orDefaultMaybe,
    tapLog,
} from '../../../common/utils/fp';
import {loadedState} from '../../../redux/userSlice';
import {ProgressUpdater} from './useAchievements';
import _ from 'lodash/fp';

const achievementIndex = achievementIndexes.unlockAll;

const getProgress = (user: FSUser) =>
    Object.values(user.achievementStatus)
        .map(
            _.flow(
                ($) => $.claimed,
                Maybe.fromNullable,
                mapMaybe(($) => $ + 1),
                orDefaultMaybe(0),
            ),
        )
        .reduce((acc, stat) => acc + stat, 0);

export const useUnlockAllAchievement = (
    safeUser: Maybe<loadedState>,
    safeRestaurant: Maybe<FSRestaurant>,
    updater: ProgressUpdater,
) => {
    useEffect(() => {
        maybeAll(safeUser, safeRestaurant).ifJust(([user, restaurant]) =>
            updater(
                Maybe.fromNullable(user.achievementStatus[achievementIndex])
                    .chainNullable(($) => $.claimed)
                    .isJust()
                    ? []
                    : [
                          {
                              index: achievementIndex,
                              progress: getProgress(user),
                          },
                      ],
            ),
        );
    }, [safeRestaurant, safeUser, updater]);
};
