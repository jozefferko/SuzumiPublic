import { Number, Runtype, Static } from "runtypes";
import { FsFieldValue } from "../utils/firestore/queries";
import { FSAchievementGroup, FSLocale } from "./firestore";

export const Year = Number.withConstraint((a) => a > 1900 && a < 10000);
export const Month = Number.withConstraint((a) => a > 0 && a <= 12);
export const Day = Number.withConstraint((a) => a > 0 && a <= 31);

export const I0p = Number.withConstraint((n) => n >= 0 && n % 1 === 0);
export const Ip = Number.withConstraint((n) => n > 0 && n % 1 === 0);
export const I = Number.withConstraint((n) => n % 1 === 0);
export const Index = Number.withConstraint((n) => n >= -1 && n % 1 === 0);
export const F0p = Number.withConstraint((n) => n >= 0);

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type OmitId<A extends Runtype<{ id: string }>> = Omit<Static<A>, "id">;
export interface Dictionary<T> {
    [key: string]: T;
}

export type wID = { id: string };
export type Indexed<A> = A & { index: number };
export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]> | FsFieldValue;
};
export const broadcastTopic = (lang: Static<typeof FSLocale>) =>
    `broadcast_${lang}`;
export const unicastTopic = (lang: Static<typeof FSLocale>) => (uid: string) =>
    `${uid}_${lang}`;

export const achievementsStaging: FSAchievementGroup[] = [
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: { en: "Register", dk: "Tilmeld" },
                goal: 1,
                reward: 200,
            },
        ],
    },
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 5 times in spring season.",
                    dk: "danish placeholder",
                },
                goal: 5,
                reward: 200,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 10 times in spring season.",
                    dk: "danish placeholder",
                },
                goal: 10,
                reward: 300,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 20 times in spring season.",
                    dk: "danish placeholder",
                },
                goal: 20,
                reward: 500,
            },
        ],
    },
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 5 times in summer season.",
                    dk: "danish placeholder",
                },
                goal: 5,
                reward: 200,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 10 times in summer season.",
                    dk: "danish placeholder",
                },
                goal: 10,
                reward: 300,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 20 times in summer season.",
                    dk: "danish placeholder",
                },
                goal: 20,
                reward: 500,
            },
        ],
    },
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 5 times in fall season.",
                    dk: "danish placeholder",
                },
                goal: 5,
                reward: 200,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 10 times in fall season.",
                    dk: "danish placeholder",
                },
                goal: 10,
                reward: 300,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 20 times in fall season.",
                    dk: "danish placeholder",
                },
                goal: 20,
                reward: 500,
            },
        ],
    },
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 5 times in winter season.",
                    dk: "danish placeholder",
                },
                goal: 5,
                reward: 200,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 10 times in winter season.",
                    dk: "danish placeholder",
                },
                goal: 10,
                reward: 300,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi 20 times in winter season.",
                    dk: "danish placeholder",
                },
                goal: 20,
                reward: 500,
            },
        ],
    },
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat with 3 friends.",
                    dk: "danish placeholder",
                },
                goal: 3,
                reward: 100,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat with 5 friends.",
                    dk: "danish placeholder",
                },
                goal: 5,
                reward: 100,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat with 9 friends.",
                    dk: "danish placeholder",
                },
                goal: 9,
                reward: 100,
            },
        ],
    },
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Open app 3 days in a row.",
                    dk: "danish placeholder",
                },
                goal: 3,
                reward: 50,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Open app 3 days in a row.",
                    dk: "danish placeholder",
                },
                goal: 7,
                reward: 100,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Open app 3 days in a row.",
                    dk: "danish placeholder",
                },
                goal: 21,
                reward: 150,
            },
        ],
    },
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi before 16:00.",
                    dk: "danish placeholder",
                },
                goal: 2,
                reward: 100,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi before 16:00.",
                    dk: "danish placeholder",
                },
                goal: 5,
                reward: 100,
            },
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Eat at Suzumi before 16:00.",
                    dk: "danish placeholder",
                },
                goal: 10,
                reward: 100,
            },
        ],
    },
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Unlock tiers by collecting 1000 points in 90 days",
                    dk: "danish placeholder",
                },
                goal: 1000,
                reward: 0,
            },
        ],
    },
    {
        active: true,
        custom: false,
        tiers: [
            {
                displayName: { en: '"fun" name', dk: '"sjovt" navn' },
                description: {
                    en: "Unlock all achievements",
                    dk: "danish placeholder",
                },
                goal: 22,
                reward: 100,
            },
        ],
    },
];
