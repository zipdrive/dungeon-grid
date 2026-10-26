import React from 'react';

export type DungeonGridColumnResizerComponentProps = {
    // The placement of the column resizer in the grid.
    gridColumn: number,

    // The total row span of the resizer.
    gridRowSpan: number
};

export function DungeonGridColumnResizerComponent(props: DungeonGridColumnResizerComponentProps): React.JSX.Element {
    return <div 
        className="dngrid-column-resizer"
        style={{
            gridColumn: props.gridColumn,
            gridRowStart: 1,
            gridRowEnd: `span ${props.gridRowSpan}`
        }}
    />;
}