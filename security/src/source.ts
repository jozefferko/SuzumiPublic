// @ts-ignore
import {
    //@ts-ignore
    Boolean, //@ts-ignore
    Index, //@ts-ignore
    Literal, //@ts-ignore
    Number, //@ts-ignore
    Partial, //@ts-ignore
    Record, //@ts-ignore
    String, //@ts-ignore
    Timestamp, //@ts-ignore
    Union, //@ts-ignore
    Array, //@ts-ignore
    Dictionary, //@ts-ignore
    I, //@ts-ignore
    I0p, //@ts-ignore
    Ip, //@ts-ignore
    F0p, //@ts-ignore
    Year, //@ts-ignore
    Month, //@ts-ignore
    Day, //@ts-ignore
    Nully, //@ts-ignore,
    Runtype, //@ts-ignore,
    FSCollectionPath, //@ts-ignore,
    FSDocumentPath, //@ts-ignore,
    Static, //@ts-ignore,
} from "./converter";

//AUTO_COPY

export type FSTimestamp = Static<typeof FSTimestamp>;
export const FSTimestamp = Record({
    seconds: Number,
    nanoseconds: Number,
});

export const FSRole = Union(Literal("owner"), Literal("employee"));

export const FSLocale = Union(Literal("en"), Literal("dk"));
export type FSLocaleString = Static<typeof FSLocaleString>;
export const FSLocaleString = Record({ en: String, dk: String });
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
export type FSUser = Static<typeof FSUser>;
export const FSUser = Record({
    id: String,
    created: FSTimestamp,
    referredBy: String,
    balance: I0p,
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
}).And(Partial({ birthday: FSBirthday }));
//when earning points add to cummulative and check,
// to keep track of the

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
});

export const FSRoles = Dictionary(FSRole);

export const FSCounter = Record({
    lastIdempotentKey: String,
    count: I0p,
});

export const FSCache = Record({
    id: String,
    linkListFirstIds: Dictionary(String),
    orderedCollections: Dictionary(Array(String)),
});

export const FSStats = Record({ id: String, counters: Dictionary(FSCounter) });

export type FSProduct = Static<typeof FSProduct>;
export const FSProduct = Record({
    id: String,
    imgUrl: String,
    displayName: FSLocaleString,
    description: FSLocaleString,
    price: I0p,
    flags: Array(String),
    maxPurchase: I0p,
});

export type FSPurchase = Static<typeof FSPurchase>;
export const FSPurchase = Record({
    id: String,
    purchased: FSTimestamp,
    product: String,
    user: String,
}).And(Partial({ activated: FSTimestamp }));

export const FSOfferType = Union(Literal("link"), Literal("inApp"));
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
});
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

export const FSPathMap = {
    offers: FSCollectionPath(FSOffer, "offers"),
    users: FSCollectionPath(FSUser, "users"),
    restaurant: FSDocumentPath(FSRestaurant, "config/restaurant"),
    products: FSCollectionPath(FSProduct, "products"),
    purchases: FSCollectionPath(FSPurchase, "purchases"),
    transactions: FSCollectionPath(FSTransaction, "transactions"),
    cache: FSDocumentPath(FSCache, "config/cache"),
    stats: FSDocumentPath(FSStats, "config/stats"),
};
