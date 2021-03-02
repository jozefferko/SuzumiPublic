import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSafeSelector } from "../redux/selectors";
import { FSPathMap, FSStats } from "../common/types/firestore";
import { fsGet } from "../common/utils/firestore/getters";
import { setStats } from "../redux/statsSlice";

export const useSafeStats = () => {
    const d = useDispatch();
    const safeStats = useSafeSelector<FSStats>((state) => state.stats);
    useEffect(() => {
        safeStats.ifNothing(() =>
            fsGet({ path: FSPathMap.stats })
                .ifRight((stats) => d(setStats(stats)))
                .run()
        );
    }, [d, safeStats]);
    return safeStats;
};
