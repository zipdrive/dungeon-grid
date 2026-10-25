import React from "react";
import { DungeonGridEditableCell, DungeonGridTextCell } from "../DungeonGridCell"
import { DungeonGridTextareaEditorComponent } from "./editors/DungeonGridTextareaEditorComponent";
import { DungeonGridNumberEditorComponent } from "./editors/DungeonGridNumberEditorComponent";
import { DungeonGridDateEditorComponent } from "./editors/DungeonGridDateEditorComponent";
import { DungeonGridDatetimeEditorComponent } from "./editors/DungeonGridDatetimeEditorComponent";

export type DungeonGridCellEditorComponentProps = {
    // The cell details.
    cell: DungeonGridEditableCell,

    // Function to close the editor.
    closeEditor: () => void,
}

function DungeonGridCellEditorComponent({ cell, closeEditor }: DungeonGridCellEditorComponentProps): React.JSX.Element {
    if (cell.editor === 'text' || cell.editor === undefined) {
        return <DungeonGridTextareaEditorComponent
            value={cell.editorValue ?? ('label' in cell && cell.label ? cell.label : '')}
            onCommit={(value) => {
                cell.onCommit?.(value);
                closeEditor();
            }}
        />;
    } else if (cell.editor === 'number') {
        return <DungeonGridNumberEditorComponent
            value={cell.editorValue || ('label' in cell && cell.label !== undefined && !Number.isNaN(parseFloat(cell.label)) ? parseFloat(cell.label) : 0)}
            onCommit={(value) => {
                cell.onCommit?.(value);
                closeEditor();
            }}
        />;
    } else if (cell.editor === 'date') {
        return <DungeonGridDateEditorComponent 
            value={cell.editorValue || ('label' in cell && cell.label !== undefined && !Number.isNaN(Date.parse(cell.label)) ? new Date(Date.parse(cell.label)) : new Date())}
            onCommit={(value) => {
                cell.onCommit?.(value);
                closeEditor();
            }}
        />;
    } else if (cell.editor === 'datetime') {
        return <DungeonGridDatetimeEditorComponent
            value={cell.editorValue || ('label' in cell && cell.label !== undefined && !Number.isNaN(Date.parse(cell.label)) ? new Date(Date.parse(cell.label)) : new Date())}
            onCommit={(value) => {
                cell.onCommit?.(value);
                closeEditor();
            }}
        />;
    } else {
        return <cell.editor
            closeEditor={closeEditor}
        />;
    }
}

export const DungeonGridMemoizedCellEditorComponent = React.memo(DungeonGridCellEditorComponent);