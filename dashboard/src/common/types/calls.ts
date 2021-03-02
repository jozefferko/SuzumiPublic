import { Boolean, Number, Partial, Record, Runtype, String } from "runtypes";
import { FSBirthday } from "./firestore";

export type CallSignature<A, B> = {
    signature: string;
    args: Runtype<A>;
    result: Runtype<B>;
};

const createCall = <A, B>(
    signature: string,
    args: Runtype<A>,
    result: Runtype<B>
): CallSignature<A, B> => ({
    signature,
    args,
    result,
});

export const EndpointFormat = Record({
    signature: String,
    args: Record({}),
});

export type Route<A, B> = {
    signature: CallSignature<A, B>;
    func: (args: A) => B | Promise<B>;
};

export const createRoute = <A, B>(
    signature: CallSignature<A, B>,
    func: (args: A) => B | Promise<B>
) => ({
    signature,
    func,
});

export const onCallSignatures = {
    createUser: createCall(
        "createUser",
        Record({
            phoneNumber: String,
            displayName: String,
            email: String,
        }).And(
            Partial({
                birthday: FSBirthday,
            })
        ),
        Record({
            status: Boolean,
            message: String,
        })
    ),
    cancelOrder: createCall(
        "cancelOrder",
        Record({
            transaction: String,
        }),
        Record({
            status: Boolean,
            message: String,
        })
    ),
    updateUser: createCall(
        "updateUser",
        Record({
            id: String,
        }).And(
            Partial({
                phoneNumber: String,
                birthday: FSBirthday,
                displayName: String,
                tier: Number,
                balance: Number,
                email: String,
            })
        ),
        Record({
            status: Boolean,
            message: String,
        })
    ),
    deleteUser: createCall(
        "deleteUser",
        Record({
            id: String,
        }),
        Record({
            status: Boolean,
            message: String,
        })
    ),
    ping: createCall(
        "ping",
        Record({
            message: String,
        }),
        Record({
            message: String,
        })
    ),
};

export type AppRoute<A, B> = {
    signature: CallSignature<A, B>;
    func: (uid: string) => (args: A) => B | Promise<B>;
};

export const createAppRoute = <A, B>(
    signature: CallSignature<A, B>,
    func: (uid: string) => (args: A) => B | Promise<B>
): AppRoute<A, B> => ({
    signature,
    func,
});
export const onCallAppSignatures = {
    purchase: createCall(
        "purchase",
        Record({
            productID: String,
        }),
        Record({
            status: Boolean,
            message: String,
        })
    ),
    activate: createCall(
        "activate",
        Record({
            purchaseID: String,
        }),
        Record({
            status: Boolean,
            message: String,
        })
    ),
    purchaseContest: createCall(
        "purchaseContest",
        Record({
            count: Number,
        }),
        Record({
            status: Boolean,
            message: String,
        })
    ),
    claimAchievement: createCall(
        "claimAchievement",
        Record({
            achievementID: Number,
        }),
        Record({
            status: Boolean,
            message: String,
        })
    ),
};
