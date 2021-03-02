import { Either, Maybe, MaybeAsync } from "purify-ts";
import { Indexed } from "../types/misc";
import { FSLocaleString } from "../types/firestore";

export const fromThrowable = <A, T>(func: (a: A) => T, param: A): Maybe<T> => {
    try {
        return Maybe.of(func(param));
    } catch (e) {
        console.log(e);
        console.log("error param", param);
        return Maybe.empty();
    }
};
export const fromThrowableC = <A, T>(func: (a: A) => T) => (
    param: A
): Maybe<T> => fromThrowable(func, param);

export const fromThrowableAsync = async <A, T>(
    func: (a: A) => Promise<T>,
    param: A
): Promise<Maybe<T>> => {
    try {
        return Maybe.of(await func(param));
    } catch (e) {
        console.log(e);
        return Maybe.empty();
    }
};

export const nothingLog = (loc: string) => () => {
    console.log(`NOTHING happened at ${loc}`);
};

export const catchLog = (error: any) => {
    console.log(error);
    throw new Error(error);
};
export const tapLog = (loc: string) => <A>(message: A): A => {
    console.log(loc, message);
    return message;
};

export const reduceC = <A, B>(reducer: (acc: A, b: B) => A) => (
    collection: B[]
) => (acc: A): A => collection.reduce(reducer, acc);

type fn<A, B> = (...args: A[]) => B;
export const functionLogger = <A, B, C extends fn<A, B>>(func: C) => (
    ...args: A[]
): B => {
    console.log("in", args);
    const a = func(...args);
    console.log("out", a);
    return a;
};
export const stubFunc = () => {
    return;
};
export const stubFSLocaleString: FSLocaleString = { en: "", dk: "" };
export const booleanify = (a: any): boolean => !!a;

export const fMap = <A, B>(iterator: (a: A, index: number) => B) => (
    arr: A[]
): B[] => arr.map(iterator);
export const fFilter = <A>(predicate: (a: A, index: number) => boolean) => (
    arr: A[]
): A[] => arr.filter(predicate);

export const fThen = <A, B>(func: (a: A) => B) => (
    promise: Promise<A>
): Promise<B> => promise.then(func);
export const safeFind = <A>(iterator: (a: A, index: number) => boolean) => (
    arr: A[]
): Maybe<A> => Maybe.fromNullable(arr.find(iterator));

export const fReduce = <A, B>(
    reducer: (acc: B, item: A, index: number) => B
) => (start: B) => (arr: A[]): B => arr.reduce(reducer, start);

export const trigger = <A, B>(func: (a: A) => B) => (arg: A) => (): B =>
    func(arg);
export const effect = (func: () => any) => (): void => {
    func();
};
export const indexArray = <A>(arr: A[]): Indexed<A>[] =>
    arr.map((val, index) => ({ ...val, index }));

export const deIndexArray = <A extends { index: number }>(
    arr: A[]
): Omit<A, "index">[] => arr.map(({ index, ...val }) => ({ ...val }));

type MaybeAllOverload = {
    <A>(a: Maybe<A>): Maybe<[A]>;
    <A, B>(a: Maybe<A>, b: Maybe<B>): Maybe<[A, B]>;
    <A, B, C>(a: Maybe<A>, b: Maybe<B>, c: Maybe<C>): Maybe<[A, B, C]>;
    <A, B, C, D>(a: Maybe<A>, b: Maybe<B>, c: Maybe<C>, d: Maybe<D>): Maybe<
        [A, B, C, D]
    >;
    <A, B, C, D, E>(
        a: Maybe<A>,
        b: Maybe<B>,
        c: Maybe<C>,
        d: Maybe<D>,
        e: Maybe<E>
    ): Maybe<[A, B, C, D, E]>;
};

export const maybeAll: MaybeAllOverload = (...args: any) =>
    args.reduce(
        (acc: Maybe<any[]>, safeVal: Maybe<any>) =>
            safeVal.chain((val) => acc.map(($) => [...$, val])),
        Maybe.of([])
    );

type MaybeAsyncAllOverload = {
    <A>(a: MaybeAsync<A>): MaybeAsync<[A]>;
    <A, B>(a: MaybeAsync<A>, b: MaybeAsync<B>): MaybeAsync<[A, B]>;
    <A, B, C>(a: MaybeAsync<A>, b: MaybeAsync<B>, c: MaybeAsync<C>): MaybeAsync<
        [A, B, C]
    >;
    <A, B, C, D>(
        a: MaybeAsync<A>,
        b: MaybeAsync<B>,
        c: MaybeAsync<C>,
        d: MaybeAsync<D>
    ): MaybeAsync<[A, B, C, D]>;
    <A, B, C, D, E>(
        a: MaybeAsync<A>,
        b: MaybeAsync<B>,
        c: MaybeAsync<C>,
        d: MaybeAsync<D>,
        e: MaybeAsync<E>
    ): MaybeAsync<[A, B, C, D, E]>;
};
export const maybeAsyncAll: MaybeAsyncAllOverload = (...args: any) =>
    args.reduce(
        (acc: MaybeAsync<any[]>, safeVal: MaybeAsync<any>) =>
            safeVal.chain((val) => acc.map(($) => [...$, val])),
        MaybeAsync.liftMaybe(Maybe.of([]))
    );
export const filterMaybe = <T>(pred: (val: T) => boolean) => (m: Maybe<T>) =>
    m.filter(pred);

export const mapMaybe = <A, B>(f: (val: A) => B) => (m: Maybe<A>): Maybe<B> =>
    m.map(f);

export const mapOrDefaultMaybe = <A, B>(f: (val: A) => B, d: B) => (
    m: Maybe<A>
): B => m.mapOrDefault(f, d);

export const ifJustMaybe = <A>(f: (val: A) => any) => (m: Maybe<A>): Maybe<A> =>
    m.ifJust(f);

export const mapMaybeAsync = <A, B>(f: (val: A) => B) => (
    m: MaybeAsync<A>
): MaybeAsync<B> => m.map(f);

export const chainMaybeAsync = <A, B>(f: (val: A) => PromiseLike<Maybe<B>>) => (
    m: MaybeAsync<A>
): MaybeAsync<B> => m.chain(f);

export const tapMaybeAsync = <A>(f: (val: A) => PromiseLike<any> | any) => (
    m: MaybeAsync<A>
): MaybeAsync<A> =>
    m.chain(async (value) => {
        await f(value);
        return Maybe.of(value);
    });

export const orDefaultMaybe = <T>(d: T) => (m: Maybe<T>) => m.orDefault(d);
export const eitherToMaybe = <A, B>(e: Either<A, B>) => e.toMaybe();
export const nonEmptyArrayPredicate = <A>(a: A[]): boolean => a.length > 0;
