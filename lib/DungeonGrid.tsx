import React from 'react';
import { EventHandlers, extractEventHandlers } from './util/eventListeners';
import { DungeonGridCustomEditorProps } from './components/editors/customEditorProps';
import classNames from 'classnames';
import './DungeonGrid.css';
import { DungeonGridCell, GetDungeonGridCellContentFunction, GetDungeonGridCellUpdateFunction } from './DungeonGridCell';
import { DungeonGridCellComponent } from './components/DungeonGridCellComponent';
import { DungeonGridRowLabelComponent } from './components/DungeonGridRowLabelComponent';
import { DungeonGridRowResizerComponent } from './components/DungeonGridRowResizerComponent';
import { DungeonGridColumnLabelComponent } from './components/DungeonGridColumnLabelComponent';
import { DungeonGridColumnResizerComponent } from './components/DungeonGridColumnResizerComponent';
export { DungeonGridCell };


export type DungeonGridColumnLabel = {
    /**
     * The class names for the column label. 
     */
    className?: string,

    /**
     * The inline CSS style properties for the column label.
     */
    style?: React.CSSProperties
} & EventHandlers & ({
    /**
     * The text of the column label.
     */
    text?: string 
} | {
    /**
     * A custom component for the column label. 
     */
    component: React.ReactNode
});

/**
 * A column of the grid.
 */
export type DungeonGridColumn<ColumnKey> = {
    /**
     * A unique identifier for the column.
     */
    key: ColumnKey,

    /**
     * Either the text of the column label (if a string), or else a configuration object for the column label. 
     */
    label?: string | DungeonGridColumnLabel,

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

export type DungeonGridRowLabel = {
    /**
     * The class names for the row label.
     */
    className?: string,

    /**
     * The inline CSS style properties for the row label.
     */
    style?: React.CSSProperties
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
});

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
    label?: string | DungeonGridRowLabel,

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
};

export function DungeonGrid<RowKey, ColumnKey>(props: DungeonGridProps<RowKey, ColumnKey>): React.JSX.Element {
    /**
     * Gets a cell by the row index and column index.
     */
    const getCellByIndex = React.useCallback((rowIndex: number, columnIndex: number) => {
        return props.getCellContent(props.rows[rowIndex].key, props.columns[columnIndex].key);
    }, [props.rows, props.columns, props.getCellContent]);

    const [templateRowHeights, setTemplateRowHeights] = React.useState<(number | string)[]>(props.rows.map(({ height }) => height !== undefined ? height : 'min-content'));
    const setTemplateRowHeight = React.useCallback((rowIndex: number, rowHeight: number) => {
        setTemplateRowHeights((oldTemplateRowHeights) => {
            const newTemplateRowHeights = [...oldTemplateRowHeights];
            newTemplateRowHeights[rowIndex] = rowHeight;
            return newTemplateRowHeights;
        });
    }, []);
    const [actualRowHeights, setActualRowHeights] = React.useState<number[]>(props.rows.map(() => 0));
    const setActualRowHeight = React.useCallback((rowIndex: number, rowHeight: number) => {
        setActualRowHeights((oldActualRowHeights) => {
            const newActualRowHeights = [...oldActualRowHeights];
            newActualRowHeights[rowIndex] = rowHeight;
            return newActualRowHeights;
        });
    }, []);
    React.useEffect(() => {
        setTemplateRowHeights(props.rows.map(({ height }) => height !== undefined ? height : 'min-content'));
        setActualRowHeights((oldActualRowHeights) => {
            return props.rows.map(({ height }, rowIndex) => typeof height === 'number' ? height : oldActualRowHeights[rowIndex]);
        });
    }, [props.rows]);    

    const [templateColumnWidths, setTemplateColumnWidths] = React.useState<(number | string)[]>(props.columns.map(({ width }) => width !== undefined ? width : 'min-content'));
    const setTemplateColumnWidth = React.useCallback((columnIndex: number, columnWidth: number) => {
        setTemplateColumnWidths((oldTemplateColumnWidths) => {
            const newTemplateColumnWidths = [...oldTemplateColumnWidths];
            newTemplateColumnWidths[columnIndex] = columnWidth;
            return newTemplateColumnWidths;
        });
    }, []);
    const [actualColumnWidths, setActualColumnWidths] = React.useState<number[]>(props.columns.map(() => 0));
    const setActualColumnWidth = React.useCallback((columnIndex: number, columnWidth: number) => {
        setActualColumnWidths((oldActualColumnWidths) => {
            const newActualColumnWidths = [...oldActualColumnWidths];
            newActualColumnWidths[columnIndex] = columnWidth;
            return newActualColumnWidths;
        });
    }, []);
    React.useEffect(() => {
        setTemplateColumnWidths(props.columns.map(({ width }) => width !== undefined ? width : 'min-content'));
        setActualColumnWidths((oldActualColumnWidths) => {
            return props.columns.map(({ width }, columnIndex) => typeof width === 'number' ? width : oldActualColumnWidths[columnIndex]);
        });
    }, [props.columns]);

    React.useEffect(() => {
        console.log(JSON.stringify(actualColumnWidths));
    }, [actualColumnWidths]);
    
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
        console.log('onCopy triggered.');
        e.preventDefault();
        e.stopPropagation();

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
        e.preventDefault();
        e.stopPropagation();

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


    /**
     * The grid style
     */
    const dngridStyle: React.CSSProperties = React.useMemo(() => {
        return Object.assign({
            gridTemplateColumns: (props.disableRowLabels ? [] : [rowLabelWidth !== null ? `${rowLabelWidth}px 0` : 'min-content 0'])
                .concat(templateColumnWidths.flatMap((width) => {
                    const trackSize1 = typeof width === 'number' ? `${width}px` : width;
                    return [trackSize1, '0'];
                }))
                .join(' '),
            gridTemplateRows: (props.disableColumnLabels ? [] : [columnHeaderHeight !== null ? `${columnHeaderHeight}px 0` : 'min-content 0'])
                .concat(templateRowHeights.flatMap((height) => {
                    const trackSize1: string = typeof height === 'number' ? `${height}px` : height;
                    return [trackSize1, '0'];
                }))
                .join(' ')
        }, props.style);
    }, [props.disableRowLabels, props.disableColumnLabels, templateColumnWidths, templateRowHeights, columnHeaderHeight, rowLabelWidth]);
    
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
        <div
            className={classNames(
                "dngrid-top-left-corner",
                (props.disableRowLabels || props.disableColumnLabels ? "dngrid-hidden" : null)
            )}
        />
        {props.columns.map((column, columnIndex) => (<DungeonGridColumnLabelComponent
            key={`dngrid-label-column${columnIndex}`}
            visible={!props.disableColumnLabels}
            column={column}
            columnIndex={columnIndex}
            gridColumn={1 + (2 * (columnIndex + (props.disableRowLabels ? 0 : 1)))}
            isImmediatelyAboveCursor={cursor !== null && cursor.rowIndex == 0 && cursor.columnIndex == columnIndex}
            isImmediatelyAboveSelected={testIfSelectedByIndex(0, columnIndex)}
            setActualWidth={setActualColumnWidth}
        />))}
        {props.rows.map((row, rowIndex) => {
            const gridRow: number = 1 + (2 * (rowIndex + (props.disableColumnLabels ? 0 : 1)));
            return <>
                {!props.disableRowLabels && <DungeonGridRowLabelComponent 
                    key={`dngrid-label-row${rowIndex}`}
                    visible={!props.disableRowLabels}
                    row={row}
                    rowIndex={rowIndex}
                    gridRow={gridRow}
                    setActualHeight={setActualRowHeight}
                />}
                {props.columns.map((column, columnIndex) => {
                    const isSelected: boolean = testIfSelectedByIndex(rowIndex, columnIndex);
                    return <DungeonGridCellComponent
                        key={`dngrid-cell-row${rowIndex}-column${columnIndex}`}
                        rowIndex={rowIndex}
                        columnIndex={columnIndex}
                        gridRow={gridRow}
                        gridColumn={1 + (2 * (columnIndex + (props.disableRowLabels ? 0 : 1)))}
                        rowKey={row.key}
                        columnKey={column.key}
                        getCellContent={props.getCellContent}
                        getCellUpdate={props.getCellUpdate}
                        isCursor={cursor && cursor.rowIndex == rowIndex && cursor.columnIndex == columnIndex}
                        setCursor={setCursorByIndex}
                        isImmediatelyBelowCursor={cursor && cursor.rowIndex == rowIndex - 1 && cursor.columnIndex == columnIndex}
                        isSelected={isSelected}
                        isImmediatelyBelowSelected={!isSelected && rowIndex > 0 && testIfSelectedByIndex(rowIndex - 1, columnIndex)}
                    />;
                })}
            </>;
        })}
        {props.columns.filter(({ resizable }) => resizable).map((column, columnIndex) => <DungeonGridColumnResizerComponent
            key={`dngrid-resizer-column${columnIndex}`}
            gridColumn={2 * (columnIndex + (props.disableRowLabels ? 1 : 2))}
            gridRowSpan={1}
            columnIndex={columnIndex}
            actualColumnWidths={actualColumnWidths}
            setTemplateColumnWidth={setTemplateColumnWidth}
            onResizeColumn={column.onResizeColumn}
        />)}
        {props.rows.filter(({ resizable }) => resizable).map((row, rowIndex) => <DungeonGridRowResizerComponent
            gridRow={2 * (rowIndex + (props.disableColumnLabels ? 1 : 2))}
            gridColumnSpan={1}
            rowIndex={rowIndex}
            actualRowHeights={actualRowHeights}
            setTemplateRowHeight={setTemplateRowHeight}
            onResizeRow={row.onRowResize}
        />)}
    </div>;
}