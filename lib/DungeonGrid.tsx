import React from 'react';
import { EventHandlers, extractEventHandlers } from './util/eventListeners';
import { DungeonGridCustomEditorProps } from './components/editors/customEditorProps';
import classNames from 'classnames';
import './DungeonGrid.css';
import { DungeonGridCell, GetDungeonGridCellContentFunction, GetDungeonGridCellUpdateFunction } from './DungeonGridCell';
import { DungeonGridCellComponent } from './components/DungeonGridCellComponent';
export { DungeonGridCell };


/**
 * A column of the grid.
 */
export type DungeonGridColumn<ColumnKey> = {
    /**
     * A unique identifier for the column.
     */
    key: ColumnKey,

    /**
     * Either the text of the column header (if a string), or else a configuration object for the column header. 
     */
    header?: string | ({
        /**
         * The class names for the column header. 
         */
        className?: string 
    } & EventHandlers & ({
        /**
         * The text of the column label.
         */
        text?: string 
    } | {
        /**
         * A custom component for the column header. 
         */
        component: React.ReactNode
    })),

    /**
     * The width of the column.
     * 
     * This property accepts any CSS column definition that could be passed into grid-template-columns (e.g. 150px, 50%, 1fr, auto, min-content, etc.)
     * 
     * The width of the column (in pixels) can also be specified as a number.
     */
    width?: number | string,

    /**
     * True if the column can be resized.
     */
    resizable?: boolean,

    /**
     * Callback function for after the column is resized.
     * @param width The new width of the column.
     */
    onResizeColumn?: (width: number) => any,
};

/**
 * A row of the grid.
 */
export type DungeonGridRow<RowKey> = {
    /**
     * A unique identifier for the row.
     */
    key: RowKey,

    /**
     * Either the text of the row label (if a string), or else a configuration object for the row label.
     */
    label?: string | ({
        /**
         * The class names for the row label.
         */
        className?: string
    } & EventHandlers & ({
        /**
         * The text of the row label.
         */
        text?: string 
    } | {
        /**
         * A custom component for the row label.
         */
        component: React.ReactNode 
    })),

    /**
     * The height of the row.
     * 
     * This property accepts any CSS row definition that could be passed into grid-template-rows (e.g. 150px, 50%, 1fr, auto, min-content, etc.)
     * 
     * The height (in pixels) can also be specified as a number.
     */
    height?: number | string,

    /**
     * True if the row can be resized.
     */
    resizable?: boolean,

    /**
     * Callback function for after the user finishes resizing the row.
     * @param height The new height of the row.
     */
    onRowResize?: (height: number) => any 
};


export type DungeonGridProps<RowKey, ColumnKey> = {
    /**
     * The class names for the grid.
     */
    className?: string,

    /**
     * The CSS style of the grid.
     */
    style?: React.CSSProperties,

    /**
     * The columns of the grid.
     */
    columns: DungeonGridColumn<ColumnKey>[],

    /**
     * The rows of the grid.
     */
    rows: DungeonGridRow<RowKey>[],

    /**
     * Function to get a cell of the grid.
     * @param rowKey The unique key for the row of the cell.
     * @param columnKey The unique key for the column of the cell.
     * @returns The content of the cell.
     */
    getCellContent: GetDungeonGridCellContentFunction<RowKey, ColumnKey>,

    /**
     * Function to get whether the content of a cell needs to be updated.
     * @param rowKey The unique key for the row of the cell.
     * @param columnKey The unique key for the column of the cell.
     * @returns True if the content of the cell should be updated. False if the content of the cell is the same as before.
     */
    getCellUpdate: GetDungeonGridCellUpdateFunction<RowKey, ColumnKey>,

    /**
     * True if column labels should be disabled.
     */
    disableColumnLabels?: boolean,

    /**
     * True if row labels should be disabled.
     */
    disableRowLabels?: boolean,

    /**
     * The number of columns to pin to the left of the grid.
     */
    pinColumnsLeft?: number,

    /**
     * The number of rows to pin to the top of the grid.
     */
    pinRowsTop?: number,
};

export function DungeonGrid<RowKey, ColumnKey>(props: DungeonGridProps<RowKey, ColumnKey>): React.JSX.Element {
    /**
     * Gets a cell by the row index and column index.
     */
    const getCellByIndex = React.useCallback((rowIndex: number, columnIndex: number) => {
        return props.getCellContent(props.rows[rowIndex].key, props.columns[columnIndex].key);
    }, [props.rows, props.columns, props.getCellContent]);

    const [rowHeights, setRowHeights] = React.useState<(number | string)[]>(props.rows.map(({ height }) => height !== undefined ? height : 'min-content'));
    React.useEffect(() => {
        setRowHeights(props.rows.map(({ height }) => height !== undefined ? height : 'min-content'));
    }, [props.rows.length]);
    const [columnWidths, setColumnWidths] = React.useState<(number | string)[]>(props.columns.map(({ width }) => width !== undefined ? width : 'min-content'));
    React.useEffect(() => {
        setColumnWidths(props.columns.map(({ width }) => width !== undefined ? width : 'min-content'));
    }, [props.columns.length]);
    const [rowLabelWidth, setRowLabelWidth] = React.useState<number | null>(null);
    const [columnHeaderHeight, setColumnHeaderHeight] = React.useState<number | null>(null);

    const [cursor, setCursor] = React.useState<{ rowIndex: number, columnIndex: number }>({ rowIndex: 0, columnIndex: 0 });
    const [selections, setSelections] = React.useState<{ rowIndex: number, columnIndex: number, rowSpan: number, columnSpan: number }[]>([]);
    
    // Clamp cursor to bounds of grid
    React.useEffect(() => {
        setCursor(({ rowIndex, columnIndex }) => {
            return {
                rowIndex: Math.max(0, Math.min(rowIndex, props.rows.length)),
                columnIndex
            };
        });
    }, [props.rows.length]);
    React.useEffect(() => {
        setCursor(({ rowIndex, columnIndex }) => {
            return {
                rowIndex,
                columnIndex: Math.max(0, Math.min(columnIndex, props.columns.length))
            };
        });
    }, [props.columns.length]);

    const setCursorByIndex = React.useCallback((rowIndex: number, columnIndex: number, mode: 'shift' | 'ctrl' | null) => {
        setCursor({ rowIndex, columnIndex });
        if (mode === 'ctrl') {
            setSelections((oldSelections) => {
                return [
                    {
                        rowIndex,
                        rowSpan: 0,
                        columnIndex,
                        columnSpan: 0
                    },
                    ...oldSelections
                ];
            });
        } else if (mode !== 'shift') {
            setSelections([]);
        }
    }, []);

    /**
     * The currently selected cells.
     */
    const selectedCells: ({ rowIndex: number, columnIndex: number, cell: DungeonGridCell } | null)[][] = React.useMemo(() => {
        let minRowIndex: number = Number.POSITIVE_INFINITY;
        let maxRowIndex: number = Number.NEGATIVE_INFINITY;
        let minColumnIndex: number = Number.POSITIVE_INFINITY;
        let maxColumnIndex: number = Number.NEGATIVE_INFINITY;
        let cellMap: Map<`row${number}column${number}`, DungeonGridCell> = new Map();

        // Iterate over selection ranges
        for (const selectionRange of selections) {
            for (let i = Math.abs(selectionRange.rowSpan); i >= 0; --i) {
                for (let j = Math.abs(selectionRange.columnSpan); j >= 0; --j) {
                    const rowIndex: number = (selectionRange.rowSpan > 0 ? i : -i) + selectionRange.rowIndex;
                    const columnIndex: number = (selectionRange.columnSpan > 0 ? j : -j) + selectionRange.columnIndex;
                    if (rowIndex < 0 || rowIndex >= props.rows.length
                        || columnIndex < 0 || columnIndex >= props.columns.length 
                    ) {
                        continue;
                    }

                    minRowIndex = Math.min(rowIndex, minRowIndex);
                    maxRowIndex = Math.max(rowIndex, maxRowIndex);
                    minColumnIndex = Math.min(columnIndex, minColumnIndex);
                    maxColumnIndex = Math.max(columnIndex, maxColumnIndex);

                    const cell = getCellByIndex(rowIndex, columnIndex);
                    if (cell.selectable !== false) {
                        cellMap.set(`row${rowIndex}column${columnIndex}`, cell);
                    }
                }
            }
        }

        // Iterate over bounded region
        const items: ({ rowIndex: number, columnIndex: number, cell: DungeonGridCell } | null)[][] = [];
        for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; ++rowIndex) {
            const rowItems: ({ rowIndex: number, columnIndex: number, cell: DungeonGridCell } | null)[] = [];
            for (let columnIndex = minColumnIndex; columnIndex <= maxColumnIndex; ++columnIndex) {
                const cell = cellMap.get(`row${rowIndex}column${columnIndex}`);
                if (cell) {
                    rowItems.push({
                        rowIndex,
                        columnIndex,
                        cell
                    });
                } else {
                    rowItems.push(null);
                }
            }
            items.push(rowItems);
        }
        return items;
    }, [selections, getCellByIndex, props.rows.length, props.columns.length]);

    /**
     * Tests if a cell is selected by the row index and column index.
     */
    const testIfSelectedByIndex = React.useCallback((rowIndex: number, columnIndex: number) => {
        return selectedCells
            .flatMap(c => c)
            .filter(c => c !== null)
            .some(({ rowIndex: selectedRowIndex, columnIndex: selectedColumnIndex }) => 
                selectedRowIndex == rowIndex && selectedColumnIndex == columnIndex
            );
    }, [selectedCells]);

    React.useEffect(() => {
        setSelections((oldSelections) => {
            if (oldSelections.length == 0) {
                return [{
                    rowIndex: cursor.rowIndex,
                    rowSpan: 0,
                    columnIndex: cursor.columnIndex,
                    columnSpan: 0
                }];
            } else {
                const [{ rowIndex, columnIndex }, ...otherRanges] = oldSelections;
                return [
                    {
                        rowIndex,
                        columnIndex,
                        rowSpan: cursor.rowIndex - rowIndex,
                        columnSpan: cursor.columnIndex - columnIndex
                    },
                    ...otherRanges
                ];
            }
        });
    }, [cursor]);

    /**
     * Shifts the cursor/selection in the grid.
     */
    const onKeyDown = React.useCallback((e: React.KeyboardEvent) => {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            e.stopPropagation();
            setCursor(({ rowIndex, columnIndex }) => {
                for (let r = rowIndex - 1; r >= 0; --r) {
                    if (getCellByIndex(rowIndex, columnIndex).selectable !== false) {
                        if (!e.shiftKey) {
                            setSelections([]);
                        }
                        return { rowIndex: r, columnIndex };
                    }
                }
                return { rowIndex, columnIndex };
            });
        } else if (e.key === "ArrowDown" || e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            setCursor(({ rowIndex, columnIndex }) => {
                for (let r = rowIndex + 1; r < props.rows.length; ++r) {
                    if (getCellByIndex(rowIndex, columnIndex).selectable !== false) {
                        if (!e.shiftKey) {
                            setSelections([]);
                        }
                        return { rowIndex: r, columnIndex };
                    }
                }
                // TODO add row automatically?
                return { rowIndex, columnIndex };
            });
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            e.stopPropagation();
            setCursor(({ rowIndex, columnIndex }) => {
                for (let c = columnIndex - 1; c >= 0; --c) {
                    if (getCellByIndex(rowIndex, columnIndex).selectable !== false) {
                        if (!e.shiftKey) {
                            setSelections([]);
                        }
                        return { rowIndex, columnIndex: c };
                    }
                }
                return { rowIndex, columnIndex };
            });

        } else if (e.key === "ArrowRight" || e.key === "Tab") {
            e.preventDefault();
            e.stopPropagation();
            setCursor(({ rowIndex, columnIndex }) => {
                for (let c = columnIndex + 1; c < props.columns.length; ++c) {
                    if (getCellByIndex(rowIndex, columnIndex).selectable !== false) {
                        if (!e.shiftKey) {
                            setSelections([]);
                        }
                        return { rowIndex, columnIndex: c };
                    }
                }
                // TODO add column automatically?
                return { rowIndex, columnIndex };
            });
        } else if (e.key === "Delete") {
            e.preventDefault();
            e.stopPropagation();
            // Clear each selected cell exactly once
            for (const { cell } of selectedCells.flatMap(r => r).filter(r => r !== null)) {
                cell.onClear?.();
            }
        }
    }, [props.rows.length, props.columns.length, selectedCells, getCellByIndex]);

    /**
     * Copy the data from the selected cells onto the clipboard.
     */
    const onCopy = React.useCallback((e: React.ClipboardEvent) => {
        // Copy data from selected cells onto clipboard
        const data: string = selectedCells.map((row) => row.map<string>((r) => {
            if (r) {
                try {
                    const { cell } = r;
                    return cell.onCopy?.() ?? '';
                } catch (e) {
                    // TODO
                    return '';
                }
            } else {
                return '';
            }
        }).join('\t')).join('\n');
        e.clipboardData.setData('text/plain', data);
    }, [selectedCells]);
    
    /**
     * Copy the data from the selected cells onto the clipboard, then clear the selected cells.
     */
    const onCut = React.useCallback((e: React.ClipboardEvent) => {
        onCopy(e);

        // Clear each selected cell exactly once
        for (const { cell } of selectedCells.flatMap(r => r).filter(r => r !== null)) {
            cell.onClear?.();
        }
    }, [selectedCells, onCopy]);

    /**
     * Paste the data from the clipboard at the cursor location.
     */
    const onPaste = React.useCallback(async (e: React.ClipboardEvent) => {
        if (e.clipboardData.types.indexOf('text/plain') >= 0) {
            const rawData: string = e.clipboardData.getData('text/plain');
            const data: string[][] = rawData.split('\n').map((row) => row.split('\t'));
            for (let i = 0; i < data.length; ++i) {
                for (let j = 0; j < data[i].length; ++j) {
                    const rowIndex: number = cursor.rowIndex + i;
                    const columnIndex: number = cursor.columnIndex + j;
                    if (rowIndex >= props.rows.length) {
                        // TODO add rows?
                        continue;
                    }
                    if (columnIndex >= props.columns.length) {
                        // TODO add columns?
                        continue;
                    }

                    try {
                        const cell = getCellByIndex(rowIndex, columnIndex);
                        cell.onPaste?.(data[i][j]);
                    } catch (e) {
                        // TODO
                    }
                }
            }
        }
    }, [cursor, props.columns.length, props.rows.length, getCellByIndex]);



    // The default header for each column, in case not specified.
    const defaultColumnHeaders: string[] = React.useMemo(() => {
        return [...Array(props.columns.length).keys().map<string>((columnIndex) => {
            let defaultLabel: string = '';
            let n = columnIndex + 1;
            while (n > 0.5) {
                const x: number = (n - 1) % 26;
                defaultLabel = String.fromCharCode(x + 60) + defaultLabel;
                n = Math.floor((n - 1) / 26);
            }
            return defaultLabel;
        })];
    }, [props.columns.length]);

    /**
     * The grid style
     */
    const dngridStyle: React.CSSProperties = React.useMemo(() => {
        return Object.assign({
            gridTemplateColumns: (props.disableRowLabels ? [] : [rowLabelWidth !== null ? `${rowLabelWidth}px` : 'min-content'])
                .concat(columnWidths.map((width) => {
                    if (typeof width === 'number') {
                        return `${width}px`;
                    } else {
                        return width;
                    }
                }))
                .join(' '),
            gridTemplateRows: (props.disableColumnLabels ? [] : [columnHeaderHeight !== null ? `${columnHeaderHeight}px` : 'min-content'])
                .concat(rowHeights.map((height) => {
                    if (typeof height === 'number') {
                        return `${height}px`;
                    } else {
                        return height;
                    }
                }))
                .join(' ')
        }, props.style);
    }, [props.disableRowLabels, props.disableColumnLabels, columnWidths, rowHeights, columnHeaderHeight, rowLabelWidth]);

    
    return <div 
        style={dngridStyle}
        className={classNames(
            'dngrid', 
            (props.className ?? null)
        )}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onCopy={onCopy}
        onCut={onCut}
        onPaste={onPaste}
    >
        {!props.disableColumnLabels && (<>
            <div className="dngrid-top-left-corner" />
            {props.columns.map((column, columnIndex) => {
                return <div 
                    key={`dngrid-header-column${columnIndex}`}
                    className={classNames(
                        'dngrid-header',
                        (column.header === undefined || typeof column.header === 'string' ? null : (column.header.className ?? null))
                    )}
                    {...(column.header === undefined || typeof column.header === 'string' ? {} : extractEventHandlers(column.header))}
                >
                    {typeof column.header === 'string' ? <span className="dngrid-header-label">{column.header}</span> : (column.header && 'component' in column.header ? column.header.component : <span className="dngrid-header-label">{column.header?.text ?? defaultColumnHeaders[columnIndex]}</span>)}
                </div>
            })}
        </>)}
        {props.rows.map((row, rowIndex) => {
            return <>
                {!props.disableRowLabels && (<div
                    key={`dngrid-label-row${rowIndex}`}
                    className={classNames(
                        'dngrid-row-label',
                        (row.label === undefined || typeof row.label === 'string' ? null : (row.label.className ?? null))
                    )}
                    {...(row.label === undefined || typeof row.label === 'string' ? {} : extractEventHandlers(row.label))}
                >
                    {typeof row.label === 'string' ? row.label : ((row.label && 'component' in row.label ? row.label.component : row.label?.text) ?? rowIndex.toString())}
                </div>)}
                {props.columns.map((column, columnIndex) => {
                    const isSelected: boolean = testIfSelectedByIndex(rowIndex, columnIndex);
                    return <DungeonGridCellComponent
                        key={`dngrid-cell-row${rowIndex}-column${columnIndex}`}
                        rowIndex={rowIndex}
                        columnIndex={columnIndex}
                        rowKey={row.key}
                        columnKey={column.key}
                        getCellContent={props.getCellContent}
                        getCellUpdate={props.getCellUpdate}
                        pinLeft={props.pinColumnsLeft !== undefined && columnIndex < props.pinColumnsLeft}
                        pinTop={props.pinRowsTop !== undefined && rowIndex < props.pinRowsTop}
                        isCursor={cursor && cursor.rowIndex == rowIndex && cursor.columnIndex == columnIndex}
                        setCursor={setCursorByIndex}
                        isImmediatelyBelowCursor={cursor && cursor.rowIndex == rowIndex - 1 && cursor.columnIndex == columnIndex}
                        isSelected={isSelected}
                        isImmediatelyBelowSelected={!isSelected && rowIndex > 0 && testIfSelectedByIndex(rowIndex - 1, columnIndex)}
                    />;
                })}
            </>;
        })}
    </div>;
}