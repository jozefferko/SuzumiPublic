export type NotificationData = {
    title: string;
    body: string;
};
export type MultilingualNotification = {
    en: NotificationData;
    dk: NotificationData;
};
export const tiersUnlockedNotification: MultilingualNotification = {
    en: {
        title: "Tiers unlocked",
        body: "Head into the app for an exciting new feature",
    },
    dk: {
        title: "Tiers unlocked på dansk",
        body: "Head into the app for an exciting new feature på dansk",
    },
};

export const pointsExpired: MultilingualNotification = {
    dk: {
        title: "Your points Expired",
        body: "Dansk dansk dansk dansk",
    },
    en: {
        title: "Your points Expired",
        body: "Your points have expired",
    },
};

export const tierExpired: MultilingualNotification = {
    dk: {
        title: "Your tier has Expired",
        body: "Dansk dansk dansk dansk",
    },
    en: {
        title: "Your tier has Expired",
        body:
            "Your tier has has expired and you have been demoted, better luck next time",
    },
};

export const notifyBeforeExpiry = (days: number): MultilingualNotification => ({
    dk: {
        title: `Your points will expiry in ${days}`,
        body: "Dansk dansk dansk dansk",
    },
    en: {
        title: `Your points will expiry in ${days}`,
        body: "Earn or recieve points to extend the period",
    },
});

export const earnedPointsNotification = (
    points: number
): MultilingualNotification => ({
    dk: {
        title: `You earned ${points} points!`,
        body: "Thank you for eating at Suzumi",
    },
    en: {
        title: `You earned ${points} points!`,
        body: "Thank you for eating at Suzumi",
    },
});
export const contestWon: MultilingualNotification = {
    dk: {
        title: `You won the contest!`,
        body: "Dansk dansk dansk dansk",
    },
    en: {
        title: "You won the contest!",
        body: "Head to the app to get your reward",
    },
};
