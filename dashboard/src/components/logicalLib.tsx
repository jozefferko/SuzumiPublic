import { Maybe } from "purify-ts";
import React from "react";
import {
    DragDropContext,
    Draggable,
    DraggableProvidedDragHandleProps,
    Droppable,
    DropResult,
    ResponderProvided,
} from "react-beautiful-dnd";

export type ConditionalComponentProps<TParams = {}> = Partial<TParams> & {
    ifTrue?: boolean;
    ifFalse?: boolean;
};
type ConditionProps = {
    value: any;
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
                    (index === 0) === props.value) ||
                (props.value && element.props.ifTrue) ||
                (!props.value && element.props.ifFalse)
                    ? element
                    : null
            )}
        </>
    );
};

export type WKey = {
    key?: any;
    id?: any;
};

export type Listified<A extends { data: any }> = {
    data: A["data"][];
    childProps: Omit<A, "data">;
};

type ListOverload = {
    <A>(props: {
        data: A[] | null | undefined | Maybe<A[]>;
        component: (props: { data: A }) => React.ReactElement;
    }): React.ReactElement;
    <A, B>(props: {
        data: A[] | null | undefined | Maybe<A[]>;
        component: (props: { data: A } & B) => React.ReactElement;
        childProps: B;
    }): React.ReactElement;
};
export const List: ListOverload = (props: any) => (
    <>
        {(Maybe.isMaybe(props.data)
            ? props.data
            : Maybe.fromNullable(props.data)
        )
            .orDefault([])
            .map((item: any, index: any) => (
                <props.component
                    key={Maybe.fromNullable((item as WKey).key)
                        .alt(Maybe.fromNullable((item as WKey).id))
                        .orDefault(index)}
                    data={item}
                    {...props.childProps}
                />
            ))}
    </>
);
// type ListProps<T, A> = {
//     data: T[] | null | undefined | Maybe<T[]>;
//     component: (props: { data: T } & A) => React.ReactElement;
//     childProps: A;
// };
// export const List = <T, A>(props: ListProps<T, A>) => (
//     <>
//         {(Maybe.isMaybe(props.data)
//             ? props.data
//             : Maybe.fromNullable(props.data)
//         )
//             .orDefault([])
//             .map((item, index) => (
//                 <props.component
//                     key={Maybe.fromNullable((item as WKey).key)
//                         .alt(Maybe.fromNullable((item as WKey).id))
//                         .orDefault(index)}
//                     data={item}
//                     {...props.childProps}
//                 />
//             ))}
//     </>
// );

export type DraggableComponentProps<T> = {
    data: T;
    dragHandleProps: DraggableProvidedDragHandleProps | undefined;
};

export type wID = {
    id: string;
};
export const DraggableList = <A extends wID, T>(props: {
    childProps: T;
    data: A[] | null | undefined | Maybe<A[]>;
    component: (props: T & DraggableComponentProps<A>) => React.ReactElement;
    onDragEnd: (
        result: DropResult,
        provided: ResponderProvided
    ) => void | undefined;
}) => (
    <DragDropContext onDragEnd={props.onDragEnd}>
        <Droppable droppableId={"list"} type={"category"}>
            {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                    {(Maybe.isMaybe(props.data)
                        ? props.data
                        : Maybe.fromNullable(props.data)
                    )
                        .orDefault([])
                        .map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                            >
                                {(provided) => (
                                    <div
                                        {...provided.draggableProps}
                                        ref={provided.innerRef}
                                    >
                                        <props.component
                                            {...props.childProps}
                                            data={item}
                                            dragHandleProps={
                                                provided.dragHandleProps
                                            }
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    </DragDropContext>
);
