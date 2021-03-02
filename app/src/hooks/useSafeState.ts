import {Maybe} from 'purify-ts';
import {useCallback, useState} from 'react';

type state<A> = A | Maybe<A> | null | undefined | void;

export type SafeSetter<A> = (a: state<A>) => void;

const toValue = <A>(a: state<A>): Maybe<A> =>
    Maybe.isMaybe<A>(a) ? a : Maybe.fromNullable(a);

export const useSafeState = <A>(): [Maybe<A>, SafeSetter<A>] => {
    const [val, valSetter] = useState<Maybe<A>>(Maybe.empty());
    const setter: SafeSetter<A> = useCallback((a) => valSetter(toValue(a)), []);
    return [val, setter];
};
