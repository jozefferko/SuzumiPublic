import { createSelector } from "@reduxjs/toolkit";
import { Maybe } from "purify-ts";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { FSAchievement, FSPathMap, FSProduct } from "../common/types/firestore";
import { getOrderedCollection } from "../common/utils/firestore/orderedCollection";
import { RootState } from "./index";

export const orderedProductsSelector = () =>
    createSelector(
        (state: RootState) => state.products,
        (state: RootState) => state.cache,
        (products, cache): FSProduct[] =>
            cache
                ? getOrderedCollection(
                      FSPathMap.products,
                      products,
                      cache
                  ).filter((a) => !a.flags.includes("delete"))
                : []
    );

export const orderedOffersSelector = () =>
    createSelector(
        (state: RootState) => state.offers,
        (state: RootState) => state.cache,
        (offers, cache) =>
            cache ? getOrderedCollection(FSPathMap.offers, offers, cache) : []
    );

export type AchievementGroup = {
    index: number;
    tiers: Achievement[];
    active: boolean;
};
export type Achievement = FSAchievement & { index: number; tier: number };

export const indexedAchievements = () =>
    createSelector(
        (state: RootState) => state.restaurant,
        (restaurant): AchievementGroup[] =>
            restaurant
                ? restaurant.achievements.map((achievement, index) => ({
                      index: index,
                      tiers: achievement.tiers.map(
                          (a, tier): Achievement => ({
                              index,
                              tier: achievement.tiers.length - tier - 1,
                              ...a,
                          })
                      ),
                      active: achievement.active,
                  }))
                : []
    );

export const membersWithComments = () =>
    createSelector(
        (state: RootState) => state.cachedMembers,
        (members) =>
            Object.values(members).filter(
                (member) => (member.feedback?.comment.length ?? 0) > 0
            )
    );
// export const safeSelector = <T>(selector: (s: RootState) => T) =>
//     createSelector(selector, Maybe.fromNullable);
export const useSafeSelector = <T>(
    selector: (s: RootState) => any
): Maybe<T> => {
    const selected = useSelector(selector);
    return useMemo(() => Maybe.fromNullable(selected), [selected]);
};
