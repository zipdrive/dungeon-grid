import React from 'react';
import { DungeonGridRow } from "../DungeonGrid";
import classNames from 'classnames';
import { extractEventHandlers } from '../util/eventListeners';

export type DungeonGridRowLabelComponentProps<RowKey> = {
    // True if the row label is visible.
    visible: boolean,

    // The row details.
    row: DungeonGridRow<RowKey>,

    // The index of the row.
    rowIndex: number,

    // The row in the grid container.
    gridRow: number,

    // States the actual height of the row.
    setActualHeight: (rowIndex: number, height: number) => void,
}

export function DungeonGridRowLabelComponent<RowKey>(props: DungeonGridRowLabelComponentProps<RowKey>): React.JSX.Element {
    const key: string = React.useMemo(() => `dngrid-label-row${props.rowIndex}`, [props.rowIndex]);

    const divRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (divRef.current) {
            props.setActualHeight(props.rowIndex, divRef.current.offsetHeight - 1);
        }
    }, [props.setActualHeight, props.rowIndex, divRef.current?.offsetHeight]);

    if (props.row.label === undefined) {
        return <div
            id={key}
            ref={divRef}
            className={classNames(
                "dngrid-row-label",
                (props.visible ? null : "dngrid-hidden")
            )}
            style={{
                gridRow: props.gridRow,
            }}
        >
            {props.rowIndex}
        </div>;
    } else if (typeof props.row.label === 'string') {
        return <div 
            id={key}
            ref={divRef}
            className={classNames(
                "dngrid-row-label",
                (props.visible ? null : "dngrid-hidden")
            )}
            style={{
                gridRow: props.gridRow,
            }}
        >
            {props.row.label}
        </div>;
    } else {
        return <div 
            id={key}
            ref={divRef}
            className={classNames(
                "dngrid-row-label",
                (props.visible ? null : "dngrid-hidden"),
                props.row.label.className
            )}
            style={{
                gridRow: props.gridRow,
                ...props.row.label.style,
            }}
            {...extractEventHandlers(props.row.label)}
        >
            {'component' in props.row.label ? props.row.label.component : props.row.label.text}
        </div>;
    }
}