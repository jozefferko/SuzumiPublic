import {Maybe} from 'purify-ts';
import {useEffect} from 'react';
import {Static} from 'runtypes';
import {achievementIndexes} from '../../../common/types/firestore';
import {maybeAll} from '../../../common/utils/fp';
import {SettingsSliceState} from '../../../redux/settingsSlice';
import {loadedState} from '../../../redux/userSlice';
import {ProgressUpdater} from './useAchievements';

const achievementIndex = achievementIndexes.openDaily;

export const useOpenDailyAchievement = (
    safeUser: Maybe<loadedState>,
    safeSettings: Maybe<Static<typeof SettingsSliceState>>,
    updater: ProgressUpdater,
) => {
    useEffect(() => {
        maybeAll(safeUser, safeSettings).ifJust(([user, settings]) =>
            updater(
                Maybe.fromNullable(user.achievementStatus[achievementIndex])
                    .chainNullable(($) => $.claimed)
                    .isJust()
                    ? []
                    : [
                          {
                              index: achievementIndex,
                              progress: settings.daysOpened.streak,
                          },
                      ],
            ),
        );
    }, [safeSettings, safeUser, updater]);
};
