import React from "react";
import { DungeonGridEditableCell, DungeonGridTextCell } from "../DungeonGridCell"
import { DungeonGridMemoizedTextareaEditorComponent } from "./editors/DungeonGridTextareaEditorComponent";
import { DungeonGridInputEditorComponent } from "./editors/DungeonGridInputEditorComponent";

export type DungeonGridCellEditorComponentProps = {
    // The cell details.
    cell: DungeonGridEditableCell,

    // The value that the editor is initialized with, if the user started typing into the cell.
    editorInitialValue: string | null,

    // Function to close the editor.
    closeEditor: () => void,
}

function DungeonGridCellEditorComponent({ cell, editorInitialValue, closeEditor }: DungeonGridCellEditorComponentProps): React.JSX.Element {
    const editorValue: string = React.useMemo(() => {
        return editorInitialValue ?? ('editorValue' in cell ? cell.editorValue : undefined) ?? ('label' in cell ? cell.label : undefined) ?? '';
    }, [editorInitialValue, 'editorValue' in cell ? cell.editorValue : undefined, 'label' in cell ? cell.label : undefined]);
    const selectAllText: boolean = React.useMemo(() => {
        return editorInitialValue === null;
    }, [editorInitialValue]);

    if (cell.editor === 'text' || cell.editor === undefined) {
        return <DungeonGridMemoizedTextareaEditorComponent
            value={editorValue}
            selectAllText={selectAllText}
            onCommit={(value) => {
                cell.onCommit?.(value);
                closeEditor();
            }}
        />;
    } else if (cell.editor === 'date') {
        return <DungeonGridInputEditorComponent 
            value={editorValue}
            selectAllText={selectAllText}
            inputType="date"
            onCommit={(value) => {
                cell.onCommit?.(value);
                closeEditor();
            }}
        />;
    } else if (cell.editor === 'datetime') {
        return <DungeonGridInputEditorComponent
            value={editorValue}
            selectAllText={selectAllText}
            inputType="datetime-local"
            onCommit={(value) => {
                cell.onCommit?.(value);
                closeEditor();
            }}
        />;
    } else {
        if (cell.typeToStartEditing === false) {
            return <cell.editor
                closeEditor={closeEditor}
            />;
        } else {
            return <cell.editor 
                editorValue={editorValue}
                closeEditor={closeEditor}
            />;
        }
    }
}

export const DungeonGridMemoizedCellEditorComponent = React.memo(DungeonGridCellEditorComponent);