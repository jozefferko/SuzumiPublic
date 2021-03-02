import * as admin from "firebase-admin";
import { FSLocale } from "../common/types/firestore";
import { unicastTopic } from "../common/types/misc";
import {
    MultilingualNotification,
    NotificationData,
} from "../common/types/notifications";

const brodcastTopic = (lang: FSLocale) => `broadcast_${lang}`;

export const sendNotification = (
    notification: NotificationData,
    topic: string
) =>
    admin.messaging().send({
        notification,
        condition: `'${topic}' in topics `,
    });

export const broadcastNotification = (
    notifications: MultilingualNotification
) =>
    Promise.all([
        sendNotification(notifications["en"], brodcastTopic("en")),
        sendNotification(notifications["dk"], brodcastTopic("dk")),
    ]);
export const unicastNotification = (
    notifications: MultilingualNotification
) => (uid: string) =>
    Promise.all([
        sendNotification(notifications["en"], unicastTopic("en")(uid)),
        sendNotification(notifications["dk"], unicastTopic("dk")(uid)),
    ]);
