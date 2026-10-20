import React from 'react';
import { EventHandlers, extractEventHandlers } from './util/eventListeners';
import { DungeonGridInternalCellData, DungeonGridRowComponent } from './components/DungeonGridRowComponent';
import { DungeonGridCustomEditorProps } from './components/editors/customEditorProps';
import classNames from 'classnames';
import './DungeonGrid.css';

export type DungeonGridColumn<Keys> = {
    /**
     * The key for the column.
     */
    key: keyof Keys,

    /**
     * The config for the column header. 
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
     */
    width?: number,

    /**
     * True if the column can be resized.
     */
    resizable?: boolean,

    /**
     * Callback function for after the column is resized.
     * @param width The new width of the column.
     */
    onResizeColumn: (width: number) => any,
};

export type DungeonGridCell = {
    /**
     * The class names for the cell.
     */
    className?: string,

    /**
     * Callback function for when the contents of the cell are deleted.
     */
    onClear?: () => any,

    /**
     * Callback function for when the cell is copied.
     * @returns A string that can then be used to paste.
     */
    onCopy?: () => string,

    /**
     * Callback function for when the cell is pasted onto.
     * @param content A string representing the new pasted content.
     */
    onPaste?: (content: string) => any,
} & EventHandlers & ((({
    /**
     * The editor to use. Default editors are:
     * - text
     * - longtext
     * - checkbox
     * 
     * A custom component may also be specified.
     */
    editor?: 'text' | 'longtext',
    
    /**
     * The value to initially pass in to the editor. If not specified, defaults to the value of the "text" property.
     */
    editorValue?: string,

    /**
     * Callback function for when a change to the value of the cell is committed.
     * @param value The edited value of the cell.
     */
    onCommit?: (value: string) => any,
} | {
    editor: (props: DungeonGridCustomEditorProps) => React.JSX.Element
} | {
    editor: null
}) & ({
    /**
     * The text to display for the cell's value.
     */
    label?: string 
} | {
    /**
     * A custom renderer for the cell.
     */
    renderer: React.ReactNode
})) | {
    /**
     * 
     */
    editor: 'checkbox',

    /**
     * The value of the cell.
     */
    value: boolean,

    /**
     * Callback function for when a change to the value of the cell is committed.
     * @param value The edited value of the cell.
     */
    onCommit?: (value: boolean) => any 
});

export type DungeonGridRow<Keys> = {
    /**
     * The config for the row label.
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
     * The cells of the row.
     */
    cells: { [key in keyof Keys]: DungeonGridCell },

    /**
     * The height of the row.
     */
    height?: number,

    /**
     * True if the row can be resized.
     */
    resizable?: boolean,

    /**
     * Callback function for when the row is resized.
     * @param height The new height of the row.
     */
    onRowResize: (height: number) => any 
};

export type DungeonGridProps<Keys> = {
    /**
     * The class names for the grid.
     */
    className?: string,

    /**
     * The columns of the grid.
     */
    columns: DungeonGridColumn<Keys>[],

    /**
     * The rows of the grid.
     */
    rows: DungeonGridRow<Keys>[],

    /**
     * True if column labels should be disabled.
     */
    disableColumnLabels?: boolean,

    /**
     * True if row labels should be disabled.
     */
    disableRowLabels?: boolean,

    /**
     * Callback function to automatically add a new column when the user navigates past the right edge of the grid.
     * @returns The column that was added, and the cells of that column.
     */
    onAddColumn?: () => { column: DungeonGridColumn<Keys>, cells: DungeonGridCell[] } | Promise<{ column: DungeonGridColumn<Keys>, cells: DungeonGridCell[] }>,

    /**
     * Callback function to automatically add a new row when the user navigates below the bottom edge of the grid.
     * @returns The row that was added.
     */
    onAddRow?: () => DungeonGridRow<Keys> | Promise<DungeonGridRow<Keys>>,
};

export default function DungeonGrid<Keys>(props: DungeonGridProps<Keys>): React.JSX.Element {
    const [columnWidths, setColumnWidths] = React.useState<{[columnId in keyof Keys]: number}>(Object.fromEntries(props.columns.map<[keyof Keys, number]>((col) => [col.key, col.width ?? 150])) as {[columnId in keyof Keys]: number});

    const [cursor, setCursor] = React.useState<{ rowIndex: number, columnIndex: number }>({ rowIndex: 0, columnIndex: 0 });
    const [selections, setSelections] = React.useState<{ rowIndex: number, columnIndex: number, rowSpan: number, columnSpan: number }[]>([]);
    const [editCell, setEditCell] = React.useState<{ rowIndex: number, columnId: keyof Keys } | null>(null);

    // Clamp cursor to bounds of grid
    React.useEffect(() => {
        setCursor(({ rowIndex, columnIndex }) => {
            return {
                rowIndex: Math.max(0, Math.min(rowIndex, props.rows.length)),
                columnIndex
            };
        })
    }, [props.rows.length]);
    React.useEffect(() => {
        setCursor(({ rowIndex, columnIndex }) => {
            return {
                rowIndex,
                columnIndex: Math.max(0, Math.min(columnIndex, props.columns.length))
            };
        })
    }, [props.columns.length]);

    /**
     * The currently selected cells.
     */
    const selectedCells: (DungeonGridCell | null)[][] = React.useMemo(() => {
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

                    const cell = props.rows[rowIndex].cells[props.columns[columnIndex].key];
                    cellMap.set(`row${rowIndex}column${columnIndex}`, cell);
                }
            }
        }

        // Iterate over bounded region
        const items: (DungeonGridCell | null)[][] = [];
        for (let rowIndex = minRowIndex; rowIndex <= maxRowIndex; ++rowIndex) {
            const rowItems: (DungeonGridCell | null)[] = [];
            for (let columnIndex = minColumnIndex; columnIndex <= maxColumnIndex; ++columnIndex) {
                rowItems.push(cellMap.get(`row${rowIndex}column${columnIndex}`) ?? null);
            }
            items.push(rowItems);
        } 
        return items;
    }, [selections, props.rows]);

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
            setCursor(({ rowIndex, columnIndex }) => {
                return { 
                    rowIndex: Math.max(0, rowIndex - 1),
                    columnIndex
                };
            });

            if (!e.shiftKey) {
                setSelections([]);
            }
        } else if (e.key === "ArrowDown" || e.key === "Enter") {
            setCursor(({ rowIndex, columnIndex }) => {
                if (props.onAddRow) {
                    // Create new rows as needed
                    if (rowIndex + 1 >= props.rows.length) {
                        props.onAddRow();
                    }
                    return { 
                        rowIndex: rowIndex + 1,
                        columnIndex
                    };
                } else {
                    // Block movement past the edge of the grid
                    return { 
                        rowIndex: Math.min(Math.max(0, props.rows.length - 1), rowIndex + 1),
                        columnIndex
                    };
                }
            });

            if (!e.shiftKey) {
                setSelections([]);
            }
        } else if (e.key === "ArrowLeft") {
            setCursor(({ rowIndex, columnIndex }) => {
                return { 
                    rowIndex,
                    columnIndex: Math.max(0, columnIndex - 1)
                };
            });

            if (!e.shiftKey) {
                setSelections([]);
            }
        } else if (e.key === "ArrowRight" || e.key === "Tab") {
            setCursor(({ rowIndex, columnIndex }) => {
                if (props.onAddColumn) {
                    if (columnIndex + 1 >= props.columns.length) {
                        props.onAddColumn();
                    }
                    return { 
                        rowIndex,
                        columnIndex: columnIndex + 1
                    };
                } else {
                    // Block movement past edge of grid
                    return { 
                        rowIndex,
                        columnIndex: Math.min(Math.max(0, props.columns.length - 1), columnIndex + 1)
                    };
                }
            });

            if (!e.shiftKey) {
                setSelections([]);
            }
        } else if (e.key === "Delete") {
            // Clear each selected cell exactly once
            for (const cell of selectedCells.flatMap(r => r)) {
                cell?.onClear?.();
            }
        }
    }, [props.rows.length, props.columns.length, selectedCells, props.onAddColumn, props.onAddRow]);

    /**
     * Copy the data from the selected cells onto the clipboard.
     */
    const onCopy = React.useCallback((e: React.ClipboardEvent) => {
        // Copy data from selected cells onto clipboard
        const data: string = selectedCells.map((row) => row.map<string>((cell) => {
            if (cell) {
                try {
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
        for (const cell of selectedCells.flatMap(r => r)) {
            cell?.onClear?.();
        }
    }, [selectedCells, onCopy]);

    /**
     * Paste the data from the clipboard at the cursor location.
     */
    const onPaste = React.useCallback(async (e: React.ClipboardEvent) => {
        if (e.clipboardData.types.indexOf('text/plain') >= 0) {
            const rows = [...props.rows];
            const columns = [...props.columns];

            const rawData: string = e.clipboardData.getData('text/plain');
            const data: string[][] = rawData.split('\n').map((row) => row.split('\t'));
            for (let i = 0; i < data.length; ++i) {
                for (let j = 0; j < data[i].length; ++j) {
                    const rowIndex: number = cursor.rowIndex + i;
                    const columnIndex: number = cursor.columnIndex + j;
                    if (rowIndex >= rows.length) {
                        if (props.onAddRow) {
                            try {
                                while (rowIndex >= rows.length) {
                                    const result = props.onAddRow();
                                    if (result instanceof Promise) {
                                        rows.push(await result);
                                    } else {
                                        rows.push(result);
                                    }
                                }
                            } catch (e) {
                                // TODO
                            }
                        } else {
                            continue;
                        }
                    }
                    if (columnIndex >= columns.length) {
                        if (props.onAddColumn) {
                            try {
                                while (columnIndex >= columns.length) {
                                    const result = props.onAddColumn();
                                    const { column, cells } = result instanceof Promise ? (await result) : result;
                                    if (cells.length != rows.length) {
                                        throw new Error('Number of cells provided when adding new column does not match number of rows!');
                                    }
                                    columns.push(column);
                                    for (let k = 0; k < cells.length; ++k) {
                                        rows[k].cells[column.key] = cells[k];
                                    }
                                }
                            } catch (e) {
                                // TODO
                            }
                        } else {
                            continue;
                        }
                    }

                    try {
                        const cell = rows[rowIndex].cells[columns[columnIndex].key];
                        cell.onPaste?.(data[i][j]);
                    } catch (e) {
                        // TODO
                    }
                }
            }
        }
    }, [cursor, props.columns, props.rows, props.onAddColumn, props.onAddRow]);

    return <table
        className={classNames('dngrid', (props.className ?? null))}
        onKeyDown={onKeyDown}
        onCopy={onCopy}
        onCut={onCut}
        onPaste={onPaste}
    >
        {!props.disableColumnLabels && <thead>
            <tr>
                {!props.disableRowLabels && <td></td>}
                {props.columns.map((col, colIndex) => {
                    let defaultColLabel: string = '';
                    let n = colIndex + 1;
                    while (n > 0.5) {
                        const x: number = (n - 1) % 26;
                        defaultColLabel = String.fromCharCode(x + 60) + defaultColLabel;
                        n = Math.floor((n - 1) / 26);
                    }
                    if ('header' in col && col.header !== undefined) {
                        if (typeof col.header === 'string') {
                            return <td 
                                key={`column-${colIndex}`}
                                className={classNames(
                                    'dngrid-header'
                                )}
                                style={{
                                    width: `${columnWidths[col.key]}px`
                                }}
                            >
                                {col.header}
                            </td>;
                        } else {
                            return <td
                                key={`column-${colIndex}`}
                                className={classNames(
                                    col.header.className ?? null,
                                    'dngrid-header'
                                )}
                                {...extractEventHandlers(col.header)}
                                style={{
                                    width: `${columnWidths[col.key]}px`
                                }}
                            >
                                {'component' in col.header ? col.header.component : (col.header.text ?? defaultColLabel)}
                            </td>;
                        }
                    } else {
                        return <td
                            key={`column-${colIndex}`}
                            style={{
                                width: `${columnWidths[col.key]}px`
                            }}
                        >
                            {defaultColLabel}
                        </td>;
                    }
                })}    
            </tr>    
        </thead>}
        <tbody>
            {props.rows.map((row, rowIndex) => {
                return <DungeonGridRowComponent
                    key={`row-${rowIndex}`}
                    label={props.disableRowLabels ? {
                        disabled: true
                    } : ('label' in row && row.label !== undefined ? (typeof row.label === 'string' ? {
                        disabled: false as false,
                        text: row.label,
                        className: null,
                        eventHandlers: {}
                    } : Object.assign({
                        disabled: false as false,
                        className: row.label.className ?? null,
                        eventHandlers: extractEventHandlers(row.label)
                    }, ('component' in row.label ? {
                        component: row.label.component
                    } : {
                        text: row.label.text ?? `${rowIndex}`
                    }) as { component: React.ReactNode } | { text: string })) : {
                        disabled: false as false,
                        text: `${rowIndex}`,
                        className: null,
                        eventHandlers: {}
                    })}
                    cellLeftPinCount={0}
                    cells={(Object.keys(row.cells) as (keyof Keys)[]).map<DungeonGridInternalCellData>((columnId) => {
                        const columnIndex: number = props.columns.findIndex(({ key }) => key === columnId);
                        const cell = row.cells[columnId];
                        const isCursor: boolean = cursor.rowIndex == rowIndex && cursor.columnIndex == columnIndex;
                        const isSelected: boolean = selections.some((range) => {
                            return (range.rowSpan > 0 
                                ? (range.rowIndex <= rowIndex && range.rowIndex + range.rowSpan > rowIndex) 
                                : (range.rowIndex >= rowIndex && range.rowIndex + range.rowSpan < rowIndex)
                            ) && (range.columnSpan > 0 
                                ? (range.columnIndex <= columnIndex && range.columnIndex + range.columnSpan > columnIndex) 
                                : (range.columnIndex >= columnIndex && range.columnIndex + range.columnSpan < columnIndex)
                            );
                        });
                        const isEditing: boolean = editCell !== null && editCell.rowIndex == rowIndex && editCell.columnId === columnId;
                        const setEditing = (e: boolean) => {
                            if (e) {
                                setEditCell({
                                    rowIndex,
                                    columnId
                                });
                            } else {
                                setEditCell((oldEditCell) => {
                                    if (oldEditCell !== null && oldEditCell.rowIndex == rowIndex && oldEditCell.columnId === columnId) {
                                        return null;
                                    } else {
                                        return oldEditCell;
                                    }
                                });
                            }
                        }

                        /**
                         * Callback function for when the cell is selected.
                         */
                        const onMouseDown = (e: React.MouseEvent) => {
                            setCursor({ rowIndex, columnIndex });
                            if (!e.shiftKey) {
                                setSelections([]);
                            } else {
                                setSelections((oldSelections) => {
                                    return [
                                        {
                                            rowIndex,
                                            columnIndex,
                                            rowSpan: 0,
                                            columnSpan: 0
                                        },
                                        ...oldSelections
                                    ];
                                })
                            }
                        };

                        /**
                         * Callback function, primarily for when a selection is dragged over a cell.
                         */
                        const onMouseEnter = (e: React.MouseEvent) => {
                            if (e.buttons % 2 == 1) {
                                // Drag is happening
                                setCursor({ rowIndex, columnIndex });
                            }
                        };

                        if (cell.editor === 'text' || cell.editor === 'longtext' || cell.editor === undefined || !('editor' in cell)) {
                            // Text editor
                            return Object.assign({
                                className: cell.className ?? null,
                                eventHandlers: extractEventHandlers(cell, { onMouseDown, onMouseEnter }),
                                isCursor,
                                isSelected,
                                isEditing,
                                setEditing,
                                editor: cell.editor ?? 'text',
                                editorValue: cell.editorValue,
                                onCommit: cell.onCommit,
                            }, 'renderer' in cell ? {
                                renderer: cell.renderer
                            } : {
                                label: cell.label ?? ''
                            });
                        } else if (cell.editor === 'checkbox') {
                            // Checkbox
                            return {
                                className: cell.className ?? null,
                                eventHandlers: extractEventHandlers(cell, { onMouseDown, onMouseEnter }),
                                isCursor,
                                isSelected,
                                editor: cell.editor,
                                value: cell.value,
                                onCommit: cell.onCommit,
                            };
                        } else if (cell.editor === null) {
                            // Cannot perform cell entry
                            return Object.assign({
                                className: cell.className ?? null,
                                eventHandlers: extractEventHandlers(cell, { onMouseDown, onMouseEnter }),
                                isCursor,
                                isSelected,
                                editor: null
                            }, 'renderer' in cell ? {
                                renderer: cell.renderer
                            } : {
                                label: cell.label ?? ''
                            });
                        } else {
                            // Custom editor
                            return Object.assign({
                                className: cell.className ?? null,
                                eventHandlers: extractEventHandlers(cell, { onMouseDown, onMouseEnter }),
                                isCursor,
                                isSelected,
                                isEditing,
                                setEditing,
                                editor: cell.editor,
                            }, 'renderer' in cell ? {
                                renderer: cell.renderer
                            } : {
                                label: cell.label ?? ''
                            });
                        }
                    })}
                />;
            })}
        </tbody>
    </table>;
}