import _ from 'lodash/fp';
import {Maybe, MaybeAsync} from 'purify-ts';
import {Static} from 'runtypes';
import {CallSignature, EndpointFormat} from '../common/types/calls';
import {fromThrowableC, nothingLog} from '../common/utils/fp';
import functions from '@react-native-firebase/functions';

const formatSignature = <A, B>(call: CallSignature<A, B>) => (
    request: A,
): Static<typeof EndpointFormat> => ({
    signature: call.signature,
    args: request,
});

const shallowRemoveUndefined = (request: any): any =>
    Object.keys(request).reduce(
        (acc, key) =>
            Maybe.fromNullable<any>(request[key]).mapOrDefault(
                (val) => ({...acc, [key]: val}),
                acc,
            ),
        {},
    );
export const endpoint = <A, B>(signature: CallSignature<A, B>) => (
    request: A,
): MaybeAsync<B> =>
    MaybeAsync.fromPromise(() =>
        _.flow(
            shallowRemoveUndefined,
            formatSignature(signature),
            functions().httpsCallable('callableAppEndpoint'),
        )(request)
            .then(_.flow((_) => _.data, fromThrowableC(signature.result.check)))
            .catch(
                (error: any) =>
                    Maybe.empty().ifNothing(nothingLog(error)) as Maybe<B>,
            ),
    );
