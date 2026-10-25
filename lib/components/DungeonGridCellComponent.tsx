import React from "react";
import { DungeonGridCheckboxComponent } from "./editors/DungeonGridCheckboxEditorComponent";
import classNames from "classnames";
import { extractEventHandlers } from "../util/eventListeners";
import { DungeonGridCell, GetDungeonGridCellContentFunction, GetDungeonGridCellUpdateFunction } from "../DungeonGridCell";
import { DungeonGridMemoizedCellEditorComponent } from "./DungeonGridCellEditorComponent";

export type DungeonGridCellComponentProps<RowKey, ColumnKey> = {
    // The index of the row.
    rowIndex: number,

    // The index of the column.
    columnIndex: number,

    // The unique key of the row.
    rowKey: RowKey,

    // The unique key of the column.
    columnKey: ColumnKey,

    // Function to retrieve the content of the cell.
    getCellContent: GetDungeonGridCellContentFunction<RowKey, ColumnKey>,

    // Function to check whether the content of the cell needs to be updated.
    getCellUpdate: GetDungeonGridCellUpdateFunction<RowKey, ColumnKey>,


    // True if the cell is the current cursor.
    isCursor: boolean,

    // True if the cell is immediately below the current cursor.
    isImmediatelyBelowCursor: boolean,

    /**
     * Function to set the cursor on top of this cell.
     * @param mode Whether the click event is modified by a Shift key, CTRL key, or neither.
     */
    setCursor: (rowIndex: number, columnIndex: number, mode: 'shift' | 'ctrl' | null) => void,

    // True if the cell is currently selected.
    isSelected: boolean,

    // True if the cell is immediately below a selected cell but is not selected itself.
    isImmediatelyBelowSelected: boolean,
};

export function DungeonGridCellComponent<RowKey, ColumnKey>(props: DungeonGridCellComponentProps<RowKey, ColumnKey>): React.JSX.Element {
    const divRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (props.isCursor) {
            divRef.current?.focus();
        }
    }, [props.isCursor, divRef.current]);

    const [cell, setCell] = React.useState<DungeonGridCell>(() => props.getCellContent(props.rowKey, props.columnKey));
    React.useEffect(() => {
        if (props.getCellUpdate(props.rowKey, props.columnKey)) {
            setCell(props.getCellContent(props.rowKey, props.columnKey));
        }
    }, [props.rowKey, props.columnKey, props.getCellContent, props.getCellUpdate]);
    
    const [editorInitialValue, setEditorInitialValue] = React.useState<string | null | undefined>(undefined);
    const closeEditor = React.useCallback(() => { 
        setEditorInitialValue(undefined);
        if (props.isCursor) {
            divRef.current?.focus();
        }
    }, [props.isCursor]);
    const eventHandlers = React.useMemo(() => {
        return extractEventHandlers({
            onMouseDown: (e: React.MouseEvent) => {
                if (e.button == 0) {
                    e.stopPropagation();
                    if (e.detail == 2) {
                        // Double-click
                        if (cell.editor !== null && cell.editor !== 'checkbox') {
                            e.preventDefault();
                            setEditorInitialValue(null);
                        }
                    } else if (e.detail == 1) {
                        if (cell.selectable !== false) {
                            props.setCursor(props.rowIndex, props.columnIndex, e.shiftKey ? 'shift' : (e.ctrlKey ? 'ctrl' : null));
                        }
                    }
                }
            },
            onMouseEnter: (e: React.MouseEvent) => {
                if (cell.selectable !== false && e.buttons % 2 == 1) {
                    props.setCursor(props.rowIndex, props.columnIndex, 'shift');
                }
            },
        }, cell);
    }, [cell, props.rowIndex, props.columnIndex, props.setCursor]);

    const onKeyDown = React.useCallback((e: React.KeyboardEvent) => {
        if (!e.ctrlKey && /^[A-Za-z0-9~`!@#\$%\^&*()\-_+=<>,.?/:;'"\\|{}\[\]]$/.test(e.key)) {
            if (cell.editor !== null && cell.editor !== 'checkbox' && !('typeToStartEditing' in cell && cell.typeToStartEditing === false)) {
                e.preventDefault();
                e.stopPropagation();
                setEditorInitialValue(e.shiftKey ? e.key.toUpperCase() : e.key.toLowerCase());
            }
        }
    }, [cell.editor, !('typeToStartEditing' in cell && cell.typeToStartEditing === false)]);

    return <div 
        ref={divRef}
        className={classNames(
            'dngrid-cell',
            (props.isCursor ? 'dngrid-cell-cursor' : null),
            (props.isImmediatelyBelowCursor ? 'dngrid-cell-immediately-below-cursor' : null), 
            (props.isSelected ? 'dngrid-cell-selected' : null),
            (props.isImmediatelyBelowSelected ? 'dngrid-cell-immediately-below-selected' : null),
            cell.className
        )}
        tabIndex={0}
        {...eventHandlers}
        onKeyDown={onKeyDown}
    >
        {cell.editor === 'checkbox' 
        ? 
        <DungeonGridCheckboxComponent
            value={cell.value}
            onCommit={(value) => {
                cell.onCommit?.(value);
            }}
        /> 
        : 
        (<>
            {cell.label}
            {editorInitialValue !== undefined 
            && cell.editor 
            && <DungeonGridMemoizedCellEditorComponent 
                cell={cell} 
                editorInitialValue={editorInitialValue} 
                closeEditor={closeEditor} 
            />}
        </>)}
    </div>;
}

export const DungeonGridMemoizedCellComponent = React.memo(DungeonGridCellComponent) as typeof DungeonGridCellComponent;