import React from 'react';
import {booleanify} from '../common/utils/fp';

export type ConditionalComponentProps<TParams = {}> = Partial<TParams> & {
    ifTrue?: boolean;
    ifFalse?: boolean;
};
type ConditionProps = {
    if: any;
    name?: string;
    children: React.ReactElement<ConditionalComponentProps>[];
};
export const Condition = (props: ConditionProps) => {
    return (
        <>
            {React.Children.map(props.children, (element, index) =>
                (props.children.length === 2 &&
                    !element.props.ifTrue &&
                    !element.props.ifFalse &&
                    (index === 0) === booleanify(props.if)) ||
                (booleanify(props.if) && element.props.ifTrue) ||
                (!props.if && element.props.ifFalse)
                    ? element
                    : null,
            )}
        </>
    );
};
