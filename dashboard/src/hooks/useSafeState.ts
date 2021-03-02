import { Maybe } from "purify-ts";
import { useCallback, useState } from "react";

type state<A> = A | Maybe<A> | null | undefined | void;

type safeSetter<A> = (a: state<A>) => void;

const toValue = <A>(a: state<A>): Maybe<A> =>
    Maybe.isMaybe<A>(a) ? a : Maybe.fromNullable(a);

export const useSafeState = <A>(): [Maybe<A>, safeSetter<A>] => {
    const [val, valSetter] = useState<Maybe<A>>(Maybe.empty());
    const setter: safeSetter<A> = useCallback((a) => valSetter(toValue(a)), []);
    return [val, setter];
};
