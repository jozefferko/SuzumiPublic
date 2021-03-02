import _ from 'lodash/fp';
import {Maybe} from 'purify-ts';
import {useEffect} from 'react';
import {
    achievementIndexes,
    FSAchievementGroup,
    FSRestaurant,
    FSTimestamp,
    FSTransaction,
    FSUser,
} from '../../../common/types/firestore';
import {maybeAll, tapLog} from '../../../common/utils/fp';
import {loadedState} from '../../../redux/userSlice';
import {Progress, ProgressUpdater} from './useAchievements';

const seasonalAchievementGroups = [
    achievementIndexes.spring,
    achievementIndexes.summer,
    achievementIndexes.fall,
    achievementIndexes.winter,
];

const isBetween = (a: number, b: number, orEqual: boolean = false) => (
    c: number,
) => (orEqual ? a <= c && c <= b : a < c && c < b);
enum Season {
    'spring',
    'summer',
    'fall',
    'winter',
}
const seasonFromFSTimestamp = (timestamp: FSTimestamp) =>
    _.cond([
        [isBetween(3, 5, true), _.always(Season.spring)],
        [isBetween(6, 8, true), _.always(Season.summer)],
        [isBetween(9, 11, true), _.always(Season.fall)],
        [_.stubTrue, _.always(Season.winter)],
    ])(new Date(timestamp.seconds * 1000).getMonth());

const sortBySeason = (
    timestamps: FSTimestamp[],
): {[key in Season]: FSTimestamp[]} =>
    timestamps.reduce(
        (acc: {[key in Season]: FSTimestamp[]}, timestamp: FSTimestamp) => ({
            ...acc,
            ..._.flow(seasonFromFSTimestamp, (season) => ({
                [season]: [...acc[season], timestamp],
            }))(timestamp),
        }),
        {
            0: [],
            1: [],
            2: [],
            3: [],
        },
    );

const transactionsPerSeason = _.flow(
    _.filter(($: FSTransaction) => $.type === 'order'),
    _.map(($) => $.timestamp),
    sortBySeason,
    tapLog('afterSort'),
    ($) => [$[0], $[1], $[2], $[3]],
);

// const seasonalAchievementGroups = achievements;

const claimedLevel = (user: FSUser, achievementIndex: number): number =>
    Maybe.fromNullable(user.achievementStatus[achievementIndex])
        .chainNullable(($) => $.claimed)
        .orDefault(0);

type SafeSeasonalAchievementGroups = Maybe<FSAchievementGroup>[];

const safeSeasonalAchievementGroups = (
    user: FSUser,
    achievementGroups: FSAchievementGroup[],
): Maybe<FSAchievementGroup>[] =>
    seasonalAchievementGroups.map((achievementIndex) =>
        Maybe.fromPredicate(
            ($: FSAchievementGroup) =>
                $.active &&
                claimedLevel(user, achievementIndex) <
                    achievementGroups[achievementIndex].tiers.length,
        )(achievementGroups[achievementIndex]),
    );
const calculateSafeProgress = (
    safeGroups: SafeSeasonalAchievementGroups,
    seasonalTransactions: FSTimestamp[][],
) =>
    safeGroups.map((group, index) =>
        group.map(($) => seasonalTransactions[index].length),
    );

const calculateSeasonalAchievements = (
    user: FSUser,
    achievementGroups: FSAchievementGroup[],
    transactions: FSTransaction[],
) =>
    calculateSafeProgress(
        safeSeasonalAchievementGroups(user, achievementGroups),
        transactionsPerSeason(transactions),
    );

export const useSeasonalAchievements = (
    safeUser: Maybe<loadedState>,
    safeRestaurant: Maybe<FSRestaurant>,
    safeTransactions: Maybe<{[id: string]: FSTransaction}>,
    updater: ProgressUpdater,
) => {
    useEffect(() => {
        maybeAll(safeUser, safeRestaurant, safeTransactions).ifJust(
            ([user, restaurant, transactions]) =>
                updater(
                    calculateSeasonalAchievements(
                        user,
                        restaurant.achievements,
                        Object.values(transactions),
                    ).reduce(
                        (acc: Progress[], safeProgress, index) =>
                            safeProgress.mapOrDefault(
                                (progress) => [
                                    ...acc,
                                    {
                                        index: seasonalAchievementGroups[index],
                                        progress,
                                    },
                                ],
                                acc,
                            ),
                        [],
                    ),
                ),
        );
    }, [safeRestaurant, safeTransactions, safeUser, updater]);
};
