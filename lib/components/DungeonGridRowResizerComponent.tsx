import React from "react";

export type DungeonGridRowResizerComponentProps = {
    // The row in the grid container.
    gridRow: number,

    // The number of columns spanned in the grid container.
    gridColumnSpan: number,

    // The index of the row.
    rowIndex: number,

    // The actual height of all rows.
    actualRowHeights: number[],
    
    // Sets the actual height of the row.
    setTemplateRowHeight: (rowIndex: number, height: number) => void,

    // Commits the changes to the row height.
    onResizeRow?: (height: number) => any,
};

export function DungeonGridRowResizerComponent(props: DungeonGridRowResizerComponentProps): React.JSX.Element {
    const [storedActualRowHeight, setStoredActualRowHeight] = React.useState<number>(0);
    const [dragStartClientY, setDragStartClientY] = React.useState<number | null>(null);

    /**
     * Changes the stored width of the column.
     */
    const onDrag = React.useCallback((e: MouseEvent) => {
        if (dragStartClientY !== null) {
            e.stopPropagation();
            props.setTemplateRowHeight(props.rowIndex, storedActualRowHeight + (e.clientY - dragStartClientY));
        }
    }, [props.rowIndex, props.setTemplateRowHeight, storedActualRowHeight, dragStartClientY]);

    /**
     * Commits the change to the column width.
     */
    const onDragEnd = React.useCallback((e: MouseEvent) => {
        if (dragStartClientY !== null && e.button == 0) {
            e.stopPropagation();
            props.onResizeRow?.(storedActualRowHeight + (e.clientY - dragStartClientY));
            setDragStartClientY(null);
        }
    }, [props.onResizeRow, storedActualRowHeight, dragStartClientY]);

    React.useEffect(() => {
        window.addEventListener('mousemove', onDrag, { capture: true });
        window.addEventListener('mouseup', onDragEnd, { capture: true });
        window.addEventListener('mouseleave', onDragEnd);
        
        return () => {
            window.removeEventListener('mousemove', onDrag, { capture: true });
            window.removeEventListener('mouseup', onDragEnd, { capture: true });
            window.removeEventListener('mouseleave', onDragEnd);
        }
    }, [onDrag, onDragEnd]);

    /**
     * Changes the stored width of the column.
     */
    const onDragStart = React.useCallback((e: React.MouseEvent) => {
        if (e.button == 0) {
            e.stopPropagation();
            setDragStartClientY(e.clientY);
            setStoredActualRowHeight(props.actualRowHeights[props.rowIndex]);
        }
    }, [props.rowIndex, props.actualRowHeights]);

    
    return <div 
        className="dngrid-row-resizer"
        style={{
            gridRow: props.gridRow,
            gridColumnStart: 1,
            gridColumnEnd: `span ${props.gridColumnSpan}`
        }}
        draggable={false}
        onMouseDown={onDragStart}
    />;
}