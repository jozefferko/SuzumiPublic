import { FSDocumentPath } from "../common/types/firestore";
import { fsGet } from "../common/utils/firestore/getters";
import { MaybeAsync } from "purify-ts";

export const memoFSGet = <A>(
    path: FSDocumentPath<A>,
    invalidateAfter: number
): (() => MaybeAsync<A>) => {
    let cache: MaybeAsync<A> | undefined = undefined;
    let created: number = 0;
    return () => {
        const currentTime = new Date().getTime();
        if (!cache || currentTime > created + invalidateAfter) {
            console.log("trigger memo", path.path);
            cache = fsGet({ path }).toMaybeAsync();
            created = new Date().getTime();
        }
        return cache;
    };
};
