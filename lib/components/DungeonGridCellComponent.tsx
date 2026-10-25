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

    // True if the cell is pinned to the left side of the grid.
    pinLeft: boolean,

    // True if the cell is pinned to the top side of the grid.
    pinTop: boolean,


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
};

function DungeonGridCellComponent<RowKey, ColumnKey>(props: DungeonGridCellComponentProps<RowKey, ColumnKey>): React.JSX.Element {
    const [cell, setCell] = React.useState<DungeonGridCell>(() => props.getCellContent(props.rowKey, props.columnKey));
    React.useEffect(() => {
        if (props.getCellUpdate(props.rowKey, props.columnKey)) {
            setCell(props.getCellContent(props.rowKey, props.columnKey));
        }
    }, [props.rowKey, props.columnKey, props.getCellContent, props.getCellUpdate]);
    
    const [isEditing, setEditing] = React.useState<boolean>(false);
    const closeEditor = React.useCallback(() => { setEditing(false); }, []);
    const eventHandlers = React.useMemo(() => {
        return extractEventHandlers({
            onMouseDown: (e: React.MouseEvent) => {
                console.log('onMouseDown', cell);
                e.stopPropagation();
                if (e.detail > 1) {
                    // Double-click
                    if (cell.editor !== null && cell.editor !== 'checkbox') {
                        setEditing(true);
                    }
                } else {
                    if (cell.selectable !== false) {
                        props.setCursor(props.rowIndex, props.columnIndex, e.shiftKey ? 'shift' : (e.ctrlKey ? 'ctrl' : null));
                    }
                }
            },
            onMouseEnter: (e: React.MouseEvent) => {
                console.log('onMouseEnter', cell);
                if (cell.selectable !== false && e.buttons % 2 == 1) {
                    props.setCursor(props.rowIndex, props.columnIndex, 'shift');
                }
            }
        }, cell);
    }, [cell, props.rowIndex, props.columnIndex, props.setCursor]);

    return <div 
        className={classNames(
            cell.className,
            'dngrid-cell',
            (props.pinLeft ? 'dngrid-cell-pin-left' : null),
            (props.isCursor ? 'dngrid-cell-cursor' : null),
            (props.isImmediatelyBelowCursor ? 'dngrid-cell-immediately-below-cursor' : null), 
            (props.isSelected ? 'dngrid-cell-selected' : null)
        )}
        {...eventHandlers}
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
            {'renderer' in cell ? cell.renderer : cell.label}
            {isEditing && cell.editor && <DungeonGridMemoizedCellEditorComponent cell={cell} closeEditor={closeEditor} />}
        </>)}
    </div>;
}

export const DungeonGridMemoizedCellComponent = React.memo(DungeonGridCellComponent) as typeof DungeonGridCellComponent;