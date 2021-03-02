import {Maybe} from 'purify-ts';
import {useEffect} from 'react';
import {
    achievementIndexes,
    FSAchievementStatus,
    FSTransaction,
    FSUser,
} from '../../../common/types/firestore';
import {maybeAll} from '../../../common/utils/fp';
import {ProgressUpdater} from './useAchievements';

const achievementIndex = achievementIndexes.eatEarly;
const beforeHour = 16;

const stubAchievementStatus: FSAchievementStatus = {claimed: 0, progress: 0};

const getProgress = (transactions: {[id: string]: FSTransaction}): number =>
    Object.values(transactions)
        .filter((transaction) => transaction.type === 'order')
        .map((transaction) => transaction.timestamp)
        .filter(
            (timestamp) =>
                new Date(timestamp.seconds * 1000).getHours() < beforeHour,
        ).length;

export const useEatEarlyAchievement = (
    safeUser: Maybe<FSUser>,
    safeTransactions: Maybe<{[id: string]: FSTransaction}>,
    updater: ProgressUpdater,
) => {
    useEffect(() => {
        maybeAll(safeUser, safeTransactions).ifJust(([user, transactions]) =>
            updater([
                {
                    index: achievementIndex,
                    progress: getProgress(transactions),
                },
            ]),
        );
    }, [safeTransactions, safeUser, updater]);
};
