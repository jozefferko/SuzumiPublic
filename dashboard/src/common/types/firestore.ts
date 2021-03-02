import {
    Array,
    Boolean,
    Dictionary,
    Literal,
    Number,
    Partial,
    Record,
    Runtype,
    String,
    Union,
} from "runtypes";
import { Static } from "runtypes/lib/runtype";
import { F0p, I, I0p, Ip, Year, Month, Day } from "./misc";

export type FSTimestamp = Static<typeof FSTimestamp>;
export const FSTimestamp = Record({
    seconds: Number,
    nanoseconds: Number,
});

export const FSRole = Union(Literal("owner"), Literal("employee"));

export type FSLocale = Static<typeof FSLocale>;
export const FSLocale = Union(Literal("en"), Literal("dk"));
export type FSLocaleString = Static<typeof FSLocaleString>;
export const FSLocaleString = Record({ en: String, dk: String });

export type FSSearchIndex = Static<typeof FSSearchIndex>;
export const FSSearchIndex = Record({
    0: String,
    1: String,
    2: String,
    3: String,
    4: String,
    5: String,
    6: String,
    7: String,
    8: String,
    9: String,
});

export type FSBirthday = Static<typeof FSBirthday>;
export const FSBirthday = Record({
    year: Year,
    month: Month,
    day: Day,
});

export type FSAchievementStatus = Static<typeof FSAchievementStatus>;
const FSAchievementStatus = Record({
    progress: F0p,
}).And(
    Partial({
        claimed: I0p,
    })
);

export type FSCachedTransaction = Static<typeof FSCachedTransaction>;
export const FSCachedTransaction = Record({
    amount: I0p,
    created: FSTimestamp,
});

export type FSTierExpiry = Static<typeof FSTierExpiry>;
export const FSTierExpiry = Record({
    amountToMaintain: I,
    expires: Boolean,
    start: FSTimestamp,
    end: FSTimestamp,
});

export type FSUserFeedback = Static<typeof FSUserFeedback>;
const FSUserFeedback = Record({
    comment: String,
    saved: FSTimestamp,
}).And(
    Partial({
        answers: Dictionary(Boolean),
    })
);
export type FSContestEntries = Static<typeof FSContestEntries>;
const FSContestEntries = Record({
    endDate: FSTimestamp,
    entries: I0p,
});
export type FSUser = Static<typeof FSUser>;
export const FSUser = Record({
    id: String,
    created: FSTimestamp,
    referredBy: String,
    balance: I,
    phoneNumber: String,
    photoUrl: String,
    displayName: String,
    email: String,
    referralCount: I0p,
    expiryDate: FSTimestamp,
    flags: Array(String),
    searchIndex: FSSearchIndex,
    achievementStatus: Dictionary(FSAchievementStatus),
    recentPoints: Dictionary(FSCachedTransaction),
    tiers: Record({
        enabled: Boolean,
        currentTier: I0p,
        expiry: FSTierExpiry,
    }),
}).And(
    Partial({
        birthday: FSBirthday,
        feedback: FSUserFeedback,
        contest: FSContestEntries,
    })
);

export const FSNotification = Record({
    title: String,
    body: String,
});

const FSLocationString = Record({
    aalborg: String,
    randers: String,
});

export const achievementIndexes = {
    register: 0,
    spring: 1,
    summer: 2,
    fall: 3,
    winter: 4,
    eatWithFriends: 5,
    openDaily: 6,
    eatEarly: 7,
    unlockTiers: 8,
    unlockAll: 9,
};

export type FSTier = Static<typeof FSTier>;
const FSTier = Record({
    displayName: FSLocaleString,
    description: FSLocaleString,
    points: Number,
    maintainPoints: F0p,
    expire: Boolean,
    color: String,
});

export type FSAchievement = Static<typeof FSAchievement>;
export const FSAchievement = Record({
    goal: Ip,
    displayName: FSLocaleString,
    description: FSLocaleString,
    reward: I0p,
});

export type FSAchievementGroup = Static<typeof FSAchievementGroup>;
export const FSAchievementGroup = Record({
    active: Boolean,
    custom: Boolean,
    tiers: Array(FSAchievement),
});
export type FSFeedbackQuestion = Static<typeof FSFeedbackQuestion>;
const FSFeedbackQuestion = Record({
    active: Boolean,
    displayName: FSLocaleString,
});

export type FSUpcomingContest = Static<typeof FSUpcomingContest>;
const FSUpcomingContest = Record({ months: Ip, product: String, price: Ip });

export type FSCurrentContest = Static<typeof FSCurrentContest>;
const FSCurrentContest = Record({
    endDate: FSTimestamp,
    product: String,
    price: Ip,
});
export type FSContest = Static<typeof FSContest>;
const FSContest = Record({
    enabled: Boolean,
    current: FSCurrentContest,
    upcoming: FSUpcomingContest,
});

export type FSRestaurant = Static<typeof FSRestaurant>;
export const FSRestaurant = Record({
    id: String,
    signUpBonus: I0p,
    conversionRate: F0p,
    social: Record({
        fbPage: String,
    }),
    referrals: Record({
        enabled: Boolean,
        mustActivate: Boolean,
        reward: I0p,
        maximum: I0p,
    }),
    links: Record({
        booking: FSLocationString,
        takeaway: FSLocationString,
    }),
    expiry: Record({
        enabled: Boolean,
        notify: Array(
            Record({
                days: Number,
                notification: FSNotification,
            })
        ),
        expire: Record({
            months: Number,
            notification: FSNotification,
        }),
    }),
    tiers: Record({
        forceUnlock: I0p,
        enabled: Boolean,
        expiryPeriod: Ip,
        tiers: Array(FSTier),
    }),
    qrContains: String,
    achievements: Array(FSAchievementGroup),
    feedback: Record({
        enabled: Boolean,
        questions: Array(FSFeedbackQuestion),
    }),
    contest: FSContest,
});

export type FSRoles = Static<typeof FSRoles>;
export const FSRoles = Dictionary(FSRole);

export type FSCounter = Static<typeof FSCounter>;
export const FSCounter = Record({
    lastIdempotentKey: String,
    count: I0p,
});

export const FSCache = Record({
    id: String,
    linkListFirstIds: Dictionary(String),
    orderedCollections: Dictionary(Array(String)),
});

export type FSFeedbackStat = Static<typeof FSFeedbackStat>;
const FSFeedbackStat = Record({ positive: Number, answers: Number });

export type FSStats = Static<typeof FSStats>;
export const FSStats = Record({
    id: String,
    counters: Dictionary(FSCounter),
    feedback: Dictionary(FSFeedbackStat),
});

export type FSProduct = Static<typeof FSProduct>;
export const FSProduct = Record({
    id: String,
    imgUrl: String,
    displayName: FSLocaleString,
    description: FSLocaleString,
    claimedDescription: FSLocaleString,
    price: I0p,
    flags: Array(String),
    maxPurchase: I0p,
});

export type FSPurchase = Static<typeof FSPurchase>;
export const FSPurchase = Record({
    id: String,
    purchased: FSTimestamp,
    flags: Array(String),
    product: String,
    user: String,
}).And(
    Partial({
        activated: FSTimestamp,
    })
);

export const FSOfferType = Union(Literal("link"), Literal("inApp"));
export type FSOfferSection = Static<typeof FSOfferSection>;

export const FSOfferSection = Union(Literal("offer"), Literal("news"));

export type FSOffer = Static<typeof FSOffer>;
export const FSOffer = Record({
    id: String,
    imgUrl: String,
    displayName: FSLocaleString,
    description: FSLocaleString,
    type: FSOfferType,
    section: FSOfferSection,
    expiry: FSTimestamp,
    url: String,
    created: FSTimestamp,
    publish: FSTimestamp,
}).And(
    Partial({
        shouldExpire: Boolean,
    })
);
export type FSTransactionType = Static<typeof FSTransactionType>;
export const FSTransactionType = Union(
    Literal("order"),
    Literal("purchase"),
    Literal("expiry"),
    Literal("referral"),
    Literal("achievement"),
    Literal("correction"),
    Literal("other")
);

export type FSTransaction = Static<typeof FSTransaction>;
export const FSTransaction = Record({
    id: String,
    amount: I,
    user: String,
    ref: String,
    plainRef: FSLocaleString,
    type: FSTransactionType,
    timestamp: FSTimestamp,
});

export type FSContestEntry = Static<typeof FSContestEntry>;
export const FSContestEntry = Record({
    id: String,
    endDate: FSTimestamp,
    user: String,
    entries: I0p,
});

// TYPES & MAP

export enum FSPathType {
    collection,
    document,
}

export interface FSBasePath<T> {
    runtype: Runtype<T>;
    path: string;
    type: FSPathType;
}

export interface FSCollectionPath<T> extends FSBasePath<T> {
    type: FSPathType.collection;
    doc: (id: string) => FSDocumentPath<T>;
    runtype: Runtype<T>;
    path: string;
}
export interface FSDocumentPath<T> extends FSBasePath<T> {
    type: FSPathType.document;
    runtype: Runtype<T>;
    path: string;
    id: string;
    collection: () => FSCollectionPath<T>;
}

export type FSPath<T> = FSDocumentPath<T> | FSCollectionPath<T>;

export const fsCollectionPath = <T>(
    runtype: Runtype<T>,
    path: string
): FSCollectionPath<T> => ({
    runtype,
    path,
    type: FSPathType.collection,
    doc: (id: string) => fsDocumentPath(runtype, `${path}/${id}`),
});

export const fsDocumentPath = <T>(
    runtype: Runtype<T>,
    path: string
): FSDocumentPath<T> => ({
    runtype,
    path,
    type: FSPathType.document,
    id: path.substr(path.lastIndexOf("/") + 1),
    collection: () =>
        fsCollectionPath(runtype, path.substr(0, path.lastIndexOf("/"))),
});

export const FSPathMap = {
    offers: fsCollectionPath(FSOffer, "offers"),
    users: fsCollectionPath(FSUser, "users"),
    restaurant: fsDocumentPath(FSRestaurant, "config/restaurant"),
    products: fsCollectionPath(FSProduct, "products"),
    purchases: fsCollectionPath(FSPurchase, "purchases"),
    transactions: fsCollectionPath(FSTransaction, "transactions"),
    contest: fsCollectionPath(FSContestEntry, "contest"),
    cache: fsDocumentPath(FSCache, "config/cache"),
    stats: fsDocumentPath(FSStats, "config/stats"),
};
