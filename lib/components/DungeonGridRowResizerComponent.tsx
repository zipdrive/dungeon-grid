import React from "react";

export type DungeonGridRowResizerComponentProps = {
    // The row in the grid container.
    gridRow: number,

    // The number of columns spanned in the grid container.
    gridColumnSpan: number
};

export function DungeonGridRowResizerComponent(props: DungeonGridRowResizerComponentProps): React.JSX.Element {
    return <div 
        className="dngrid-row-resizer"
        style={{
            gridRow: props.gridRow,
            gridColumnStart: 1,
            gridColumnEnd: `span ${props.gridColumnSpan}`
        }}
    />;
}