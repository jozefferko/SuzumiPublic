import {createSelector} from '@reduxjs/toolkit';
import _ from 'lodash/fp';
import {Maybe} from 'purify-ts';
import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {Static} from 'runtypes';
import {
    FSAchievement,
    FSAchievementGroup,
    FSAchievementStatus,
    FSContestEntry,
    FSOffer,
    FSPathMap,
    FSProduct,
    FSPurchase,
    FSTimestamp,
    FSTransaction,
    FSUser,
} from '../common/types/firestore';
import {
    fsTimestampComparator,
    fsTimestampEquals,
    secondsSinceFSTimestamp,
} from '../common/utils/dateOperations';
import {getOrderedCollection} from '../common/utils/firestore/orderedCollection';
import {tapLog} from '../common/utils/fp';
import {activeDuration} from '../Screens/MainStack/Home/Products/ClaimedListItem';
import {RootState} from './index';
import {loadedState, UserStatus} from './userSlice';
import ContestItem from '../Screens/MainStack/Home/Products/ContestItem';

export type Product = FSProduct & {
    available: boolean;
};

const countPurchases = (purchases: {[id: string]: FSPurchase}) => (
    id: string,
): number =>
    Object.values(purchases).reduce(
        (acc, val) => (val.product === id ? acc + 1 : acc),
        0,
    );
export const orderedProductsSelector = () =>
    createSelector(
        (state: RootState) => state.user,
        (state: RootState) => state.products,
        (state: RootState) => state.cache,
        (state: RootState) => state.purchases,
        (user, products, cache, purchases): Product[] =>
            cache && user.status === UserStatus.loaded
                ? getOrderedCollection(FSPathMap.products, products, cache)
                      .map((product) => ({
                          ...product,
                          available: product.price <= user.balance,
                      }))
                      .filter((a) => !a.flags.includes('delete'))
                      .filter(
                          (product) =>
                              product.maxPurchase <= 0 ||
                              product.maxPurchase <=
                                  countPurchases(purchases)(product.id),
                      )
                : [],
    );
export const contestProductSelector = () =>
    createSelector(
        (state: RootState) => state.products,
        (state: RootState) => state.restaurant,
        (products, restaurant): Maybe<FSProduct> =>
            Maybe.fromNullable(restaurant?.contest)
                .filter((contest) => contest.enabled)
                .chainNullable((contest) => products[contest.current.product]),
    );

export const currentEntriesSelector = () =>
    createSelector(
        (state: RootState) => state.contest,
        (state: RootState) => state.restaurant,
        (contest, restaurant): Maybe<FSContestEntry> =>
            restaurant
                ? Maybe.fromNullable(
                      Object.values(contest).find((entry) =>
                          fsTimestampEquals(
                              entry.endDate,
                              restaurant.contest.current.endDate,
                          ),
                      ),
                  )
                : Maybe.empty(),
    );

export const orderedOffersSelector = () =>
    createSelector(
        (state: RootState) => state.offers,
        (state: RootState) => state.cache,
        (offers, cache) =>
            cache ? getOrderedCollection(FSPathMap.offers, offers, cache) : [],
    );

export type Achievement = Static<typeof FSAchievement> & {
    tier: number;
    unlocked: boolean;
    progress: number;
    claimed: boolean;
    id: number;
};

// const getTier = (
//     achievement: Static<typeof FSAchievement>,
//     arr: Static<typeof FSAchievement>[],
// ): number =>
//     Maybe.fromNullable(achievement.parent).mapOrDefault(
//         (parent) => 1 + getTier(arr[parent], arr),
//         0,
//     );
//
// const isVisible = (
//     achievement: Static<typeof FSAchievement>,
//     user: loadedState,
// ): boolean =>
//     Maybe.fromNullable(achievement.parent).mapOrDefault(
//         (parent) =>
//             Maybe.fromNullable(user.achievementStatus[parent]).mapOrDefault(
//                 (status) => status.claimed,
//                 false,
//             ),
//         true,
//     );

// export const achievementsSelector = () =>
//     createSelector(
//         (state: RootState) => state.user,
//         (state: RootState) => state.restaurant,
//         (user, restaurant): Achievement[] =>
//             user.status === UserStatus.loaded && restaurant
//                 ? restaurant.achievements.map(
//                       (
//                           current: Static<typeof FSAchievement>,
//                           i: number,
//                           arr: Static<typeof FSAchievement>[],
//                       ) => ({
//                           ...current,
//                           id: i,
//                           ...,
//                           tier: getTier(current, arr),
//                           show: isVisible(current, user),
//                       }),
//                   )
//                 : [],
//     );

const getStatus = (user: FSUser, index: number): FSAchievementStatus =>
    Maybe.fromNullable(user.achievementStatus[index]).orDefault({
        progress: 0,
        claimed: undefined,
    });
const getCurrentTierIndex = (
    group: FSAchievementGroup,
    status: FSAchievementStatus,
) =>
    _.cond<number, number>([
        [(s) => s === -1, _.always(0)],
        [(s) => s < group.tiers.length - 1, (s) => s + 1],
        [_.stubTrue, (s) => group.tiers.length - 1],
    ])(Maybe.fromNullable(status.claimed).orDefault(-1));

const achievementFactory = (
    group: FSAchievementGroup,
    status: FSAchievementStatus,
    currentIndex: number,
    groupIndex: number,
): Achievement => ({
    ...group.tiers[currentIndex],
    unlocked: Maybe.fromNullable(status.claimed).isJust(),
    tier: group.tiers.length - currentIndex - 1,
    progress: status.progress,
    claimed: Maybe.fromNullable(status.claimed).orDefault(-1) >= currentIndex,
    id: groupIndex,
});
export const achievementsSelector = () =>
    createSelector(
        (state: RootState) => state.user,
        (state: RootState) => state.restaurant,
        (user, restaurant): Achievement[] =>
            user.status === UserStatus.loaded && restaurant
                ? restaurant.achievements
                      .filter((group) => group.active)
                      .map((group, index) =>
                          achievementFactory(
                              group,
                              getStatus(user, index),
                              getCurrentTierIndex(
                                  group,
                                  getStatus(user, index),
                              ),
                              index,
                          ),
                      )
                : [],
    );

export const unclaimedAchievements = () =>
    createSelector(
        (state: RootState) => state.user,
        (state: RootState) => state.restaurant,
        (user, restaurant): boolean =>
            user.status === UserStatus.loaded && restaurant
                ? restaurant.achievements
                      .filter((group) => group.active)
                      .map((group, index) =>
                          achievementFactory(
                              group,
                              getStatus(user, index),
                              getCurrentTierIndex(
                                  group,
                                  getStatus(user, index),
                              ),
                              index,
                          ),
                      )
                      .some(
                          (achievement) =>
                              !achievement.claimed &&
                              achievement.progress >= achievement.goal,
                      )
                : false,
    );

export type Purchase = Static<typeof FSPurchase> & {
    productData: Static<typeof FSProduct>;
    expired: boolean;
};

export type ContestEntry = FSContestEntry & {
    expired: boolean;
};

const expiredPurchasePredicate = (
    purchase: Static<typeof FSPurchase>,
): boolean =>
    purchase.activated
        ? secondsSinceFSTimestamp(purchase.activated) >= activeDuration * 60
        : false;

const expiredContestEntryPredicate = (entry: FSContestEntry): boolean =>
    secondsSinceFSTimestamp(entry.endDate) >= 0;
export const isContestEntry = (a: any): a is ContestEntry => !!a.endDate;
export const purchasesSelector = () =>
    createSelector(
        (state: RootState) => state.purchases,
        (state: RootState) => state.products,
        (state: RootState) => state.contest,
        (purchases, products, contest): (Purchase | ContestEntry)[] =>
            purchases && products
                ? [
                      ...Object.values(purchases).map((purchase) => ({
                          ...purchase,
                          productData: products[purchase.product],
                          expired: expiredPurchasePredicate(purchase),
                      })),
                      ...Object.values(contest).map((contestEntry) => ({
                          ...contestEntry,
                          expired: expiredContestEntryPredicate(contestEntry),
                      })),
                  ].sort(
                      (
                          a: Purchase | ContestEntry,
                          b: Purchase | ContestEntry,
                      ) =>
                          fsTimestampComparator(false)(
                              isContestEntry(a) ? a.endDate : a.purchased,
                              isContestEntry(b) ? b.endDate : b.purchased,
                          ),
                  )
                : [],
    );

export const indexedAchievements = () =>
    createSelector(
        (state: RootState) => state.restaurant,
        (restaurant) =>
            restaurant
                ? restaurant.achievements.map((achievement, index) => ({
                      index,
                      ...achievement,
                  }))
                : [],
    );

export const unclaimedRewards = () =>
    createSelector(
        (state: RootState) => state.purchases,
        (purchases): boolean =>
            Object.values(purchases).some((purchase) => !purchase.activated),
    );

export const claimedRewardsCount = () =>
    createSelector(
        (state: RootState) => state.purchases,
        (purchases): number => Object.values(purchases).length,
    );

export const achievementsAchieved = () =>
    createSelector(
        (state: RootState) => state.user,
        (user): number =>
            user.status === UserStatus.loaded
                ? Object.values(user.achievementStatus)
                      .map((status) => (status.claimed ?? -1) + 1)
                      .reduce((acc, val) => acc + val, 0)
                : 0,
    );

export const lastDayOpened = () =>
    createSelector(
        (state: RootState) => state.settings,
        (settings) => settings?.daysOpened.lastDate,
    );

export const offersNotSeen = () =>
    createSelector(
        (state: RootState) => state.offers,
        (state: RootState) => state.settings,
        (offers, settings): boolean =>
            Object.values(offers).some(
                (offer: FSOffer) =>
                    offer.publish.seconds >
                    Maybe.fromNullable(settings).mapOrDefault(
                        ($) => $.lastOfferSeen,
                        0,
                    ),
            ),
    );

export const feedbackShown = () =>
    createSelector(
        (state: RootState) => state.transactions,
        (state: RootState) => state.settings,
        (state: RootState) => state.user,
        (state: RootState) => state.restaurant,
        (transactions, settings, user, restaurant): boolean =>
            user.status === UserStatus.loaded
                ? Maybe.fromNullable(restaurant?.feedback.enabled).orDefault(
                      false,
                  ) &&
                  !Maybe.fromNullable(settings?.hideFeedback).orDefault(
                      false,
                  ) &&
                  Maybe.fromNullable<FSTransaction>(
                      Object.values(transactions).find(
                          ($) => $.type === 'order',
                      ),
                  )
                      .map(($) => $.timestamp)
                      .map((recentVisit) =>
                          Maybe.fromNullable(user.feedback)
                              .map((feedback) =>
                                  fsTimestampComparator(true)(
                                      recentVisit,
                                      feedback.saved,
                                  ),
                              )
                              .orDefault(1),
                      )
                      .orDefault(0) === 1
                : false,
    );
//fsTimestampComparator(true)()===1
// .isNothing()
export const safeUserSelector = () =>
    createSelector(
        (state: RootState) => state.user,
        (user): Maybe<loadedState> =>
            user.status === UserStatus.loaded ? Maybe.of(user) : Maybe.empty(),
    );

export const useSafeSelector = <T>(
    selector: (s: RootState) => any,
): Maybe<T> => {
    const selected = useSelector(selector);
    return useMemo(() => Maybe.fromNullable(selected), [selected]);
};
