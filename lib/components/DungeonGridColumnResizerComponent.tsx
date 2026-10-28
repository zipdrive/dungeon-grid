import React from 'react';

export type DungeonGridColumnResizerComponentProps = {
    // The placement of the column resizer in the grid.
    gridColumn: number,

    // The total row span of the resizer.
    gridRowSpan: number,

    // The index of the column.
    columnIndex: number,

    // The actual width of all columns.
    actualColumnWidths: number[],
    
    // Sets the actual width of the column.
    setTemplateColumnWidth: (columnIndex: number, width: number) => void,

    // Commits the changes to the column width.
    onResizeColumn?: (width: number) => any,
};

export function DungeonGridColumnResizerComponent(props: DungeonGridColumnResizerComponentProps): React.JSX.Element {
    const [storedActualColumnWidth, setStoredActualColumnWidth] = React.useState<number>(0);
    const [dragStartClientX, setDragStartClientX] = React.useState<number | null>(null);

    /**
     * Changes the stored width of the column.
     */
    const onDrag = React.useCallback((e: MouseEvent) => {
        if (dragStartClientX !== null) {
            e.stopPropagation();
            props.setTemplateColumnWidth(props.columnIndex, storedActualColumnWidth + (e.clientX - dragStartClientX));
        }
    }, [props.columnIndex, props.setTemplateColumnWidth, storedActualColumnWidth, dragStartClientX]);

    /**
     * Commits the change to the column width.
     */
    const onDragEnd = React.useCallback((e: MouseEvent) => {
        if (dragStartClientX !== null && e.button == 0) {
            e.stopPropagation();
            props.onResizeColumn?.(storedActualColumnWidth + (e.clientX - dragStartClientX));
            setDragStartClientX(null);
        }
    }, [props.onResizeColumn, storedActualColumnWidth, dragStartClientX]);

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
            setDragStartClientX(e.clientX);
            setStoredActualColumnWidth(props.actualColumnWidths[props.columnIndex]);

        }
    }, [props.columnIndex, props.actualColumnWidths]);


    return <div 
        className="dngrid-column-resizer"
        style={{
            gridColumn: props.gridColumn,
            gridRowStart: 1,
            gridRowEnd: `span ${props.gridRowSpan}`
        }}
        draggable={false}
        onMouseDown={onDragStart}
    />;
}