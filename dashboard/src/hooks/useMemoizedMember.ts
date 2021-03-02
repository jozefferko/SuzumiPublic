import { MaybeAsync, Maybe } from "purify-ts";
import { useCallback, useEffect, useState } from "react";
import { FSPathMap, FSUser } from "../common/types/firestore";
import { useDispatch, useSelector } from "react-redux";
import { useSafeSelector } from "../redux/selectors";
import { fsGet } from "../common/utils/firestore/getters";
import _ from "lodash/fp";
import { cacheMember } from "../redux/cachedMembersSlice";
import { nothingLog } from "../common/utils/fp";

export const useMemoizedMember = (id: string): Maybe<FSUser> => {
    const d = useDispatch();
    const user = useSafeSelector<FSUser>((state) => state.cachedMembers[id]);
    useEffect(() => {
        user.ifNothing(() => {
            fsGet({ path: FSPathMap.users.doc(id) })
                .ifRight(_.flow(cacheMember, d))
                .run();
        });
    }, [user, id, d]);

    return user;
};
