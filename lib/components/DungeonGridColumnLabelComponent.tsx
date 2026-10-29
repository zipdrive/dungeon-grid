import React from 'react';
import { DungeonGridColumn } from "../DungeonGrid";
import classNames from 'classnames';
import { extractEventHandlers } from '../util/eventListeners';

export type DungeonGridColumnLabelComponentProps<ColumnKey> = {
    // True if the column label is visible.
    visible: boolean,

    // The row details.
    column: DungeonGridColumn<ColumnKey>,

    // The index of the column.
    columnIndex: number,

    // The column in the grid container.
    gridColumn: number,

    // True if the label is immediately above the cursor.
    isImmediatelyAboveCursor: boolean,

    // True if the label is immediately above a selected cell.
    isImmediatelyAboveSelected: boolean,

    // States the actual width of the column.
    setActualWidth: (columnIndex: number, width: number) => void,
}

export function DungeonGridColumnLabelComponent<ColumnKey>(props: DungeonGridColumnLabelComponentProps<ColumnKey>): React.JSX.Element {
    const key: string = React.useMemo(() => `dngrid-label-column${props.columnIndex}`, [props.columnIndex]);
    
    const divRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (divRef.current) {
            props.setActualWidth(props.columnIndex, divRef.current.offsetWidth - 1);
        }
    }, [props.setActualWidth, props.columnIndex, divRef.current?.offsetWidth]);

    const defaultColumnLabel: string = React.useMemo(() => {
        let defaultLabel: string = '';
        let n = props.columnIndex + 1;
        while (n > 0.5) {
            const x: number = (n - 1) % 26;
            defaultLabel = String.fromCharCode(x + 60) + defaultLabel;
            n = Math.floor((n - 1) / 26);
        }
        return defaultLabel;
    }, [props.columnIndex]);

    if (props.column.label === undefined) {
        return <div
            id={key}
            ref={divRef}
            className={classNames(
                "dngrid-column-label",
                (props.visible ? null : "dngrid-hidden"),
                (props.isImmediatelyAboveCursor ? "dngrid-column-label-immediately-above-cursor" : null),
                (props.isImmediatelyAboveSelected ? "dngrid-column-label-immediately-above-selected" : null)
            )}
            style={{
                gridColumn: props.gridColumn,
            }}
        >
            <span className="dngrid-column-label-inner">{defaultColumnLabel}</span>
        </div>;
    } else if (typeof props.column.label === 'string') {
        return <div 
            id={key}
            ref={divRef}
            className={classNames(
                "dngrid-column-label",
                (props.visible ? null : "dngrid-hidden"),
                (props.isImmediatelyAboveCursor ? "dngrid-column-label-immediately-above-cursor" : null),
                (props.isImmediatelyAboveSelected ? "dngrid-column-label-immediately-above-selected" : null)
            )}
            style={{
                gridColumn: props.gridColumn,
            }}
        >
            <span className="dngrid-column-label-inner">{props.column.label}</span>
        </div>;
    } else {
        return <div 
            id={key}
            ref={divRef}
            className={classNames(
                "dngrid-column-label",
                (props.visible ? null : "dngrid-hidden"),
                (props.isImmediatelyAboveCursor ? "dngrid-column-label-immediately-above-cursor" : null),
                (props.isImmediatelyAboveSelected ? "dngrid-column-label-immediately-above-selected" : null),
                props.column.label.className
            )}
            style={{
                gridColumn: props.gridColumn,
                ...props.column.label.style,
            }}
            {...extractEventHandlers(props.column.label)}
        >
            {'component' in props.column.label ? props.column.label.component : <span className="dngrid-column-label-inner">{props.column.label.text}</span>}
        </div>;
    }
}