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
    cells: {
        [key in keyof Keys]: ({
            /**
             * The class names for the cell.
             */
            className?: string,

            /**
             * Callback function for when the contents of the cell are deleted.
             */
            onClear?: () => any,
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
        }))
    },

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
     * Callback function for when the user navigates past the right edge of the grid.
     */
    onAddColumn?: () => any,

    /**
     * Callback function for when the user navigates below the bottom edge of the grid.
     */
    onAddRow?: () => any,
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
        } else if (e.key === "ArrowLeft") {
            setCursor(({ rowIndex, columnIndex }) => {
                return { 
                    rowIndex,
                    columnIndex: Math.max(0, columnIndex - 1)
                };
            });
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
        }
    }, [props.rows.length, props.columns.length, props.onAddColumn, props.onAddRow]);

    return <table
        className={classNames('dngrid', (props.className ?? null))}
        onKeyDown={onKeyDown}
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
                        const cell = row.cells[columnId];
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

                        if (cell.editor === 'text' || cell.editor === 'longtext' || cell.editor === undefined || !('editor' in cell)) {
                            // Text editor
                            return Object.assign({
                                className: cell.className ?? null,
                                eventHandlers: extractEventHandlers(cell),
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
                                eventHandlers: extractEventHandlers(cell),
                                editor: cell.editor,
                                value: cell.value,
                                onCommit: cell.onCommit,
                            };
                        } else if (cell.editor === null) {
                            // Cannot perform cell entry
                            return Object.assign({
                                className: cell.className ?? null,
                                eventHandlers: extractEventHandlers(cell),
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
                                eventHandlers: extractEventHandlers(cell),
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