import React from 'react';
import { DungeonGridRow } from "../DungeonGrid";
import classNames from 'classnames';
import { extractEventHandlers } from '../util/eventListeners';

export type DungeonGridRowLabelComponentProps<RowKey> = {
    // The row details.
    row: DungeonGridRow<RowKey>,

    // The index of the row.
    rowIndex: number,

    // The row in the grid container.
    gridRow: number 
}

export function DungeonGridRowLabelComponent<RowKey>(props: DungeonGridRowLabelComponentProps<RowKey>): React.JSX.Element {
    const key: string = React.useMemo(() => `dngrid-label-row${props.rowIndex}`, [props.rowIndex]);
    if (props.row.label === undefined) {
        return <div
            key={key}
            className="dngrid-row-label"
            style={{
                gridRow: props.gridRow,
            }}
        >
            {props.rowIndex}
        </div>;
    } else if (typeof props.row.label === 'string') {
        return <div 
            key={key}
            className="dngrid-row-label"
            style={{
                gridRow: props.gridRow,
            }}
        >
            {props.row.label}
        </div>;
    } else {
        return <div 
            key={key}
            className={classNames(
                "dngrid-row-label",
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