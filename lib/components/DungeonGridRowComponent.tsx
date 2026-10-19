import React from "react";
import { EventHandlers } from "../util/eventListeners";
import classNames from "classnames";
import { DungeonGridCustomEditorProps } from "./editors/customEditorProps";
import { DungeonGridTextEditorComponent } from "./editors/DungeonGridTextEditorComponent";
import { DungeonGridTextareaEditorComponent } from "./editors/DungeonGridTextareaEditorComponent";
import { DungeonGridCheckboxComponent } from "./editors/DungeonGridCheckboxEditorComponent";

type DungeonGridInternalRowLabelData = {
    /**
     * True if the row labels are disabled.
     */
    disabled: true 
} | ({
    /**
     * True if the row labels are disabled.
     */
    disabled: false,

    /**
     * The class names for the row label.
     */
    className: string | null,

    /**
     * The event handlers for the row label.
     */
    eventHandlers: EventHandlers
} & ({
    /**
     * The text of the row label.
     */
    text: string,
} | {
    /**
     * A custom React component for the row label.
     */
    component: React.ReactNode
}));

export type DungeonGridInternalCellData = {
    /**
     * The class names for the cell. 
     */
    className: string | null,

    /**
     * The event handlers for the cell.
     */
    eventHandlers: EventHandlers,
} & (((({
    /**
     * True if the user is currently editing the cell.
     */
    isEditing: boolean,

    /**
     * Sets whether the user is currently editing the cell.
     */
    setEditing: (isEditing: boolean) => void,
} & ({
    /**
     * The editor to use. Default editors are:
     * - text
     * - longtext
     * - checkbox
     */
    editor: 'text' | 'longtext',

    /**
     * The text value to pass to the editor.
     */
    editorValue?: string,

    /**
     * Function that is called when the new value of a cell is committed.
     * @param value The new value of the cell.
     */
    onCommit?: (value: string) => any 
} | {
    /**
     * 
     */
    editor: (props: DungeonGridCustomEditorProps) => React.JSX.Element
})) | ({
    /**
     * 
     */
    editor: null
})) & ({
    /**
     * The text of the cell.
     */
    label: string 
} | {
    /**
     * A custom React component for the cell.
     */
    renderer: React.ReactNode 
})) | {
    /**
     * 
     */
    editor: 'checkbox',

    /**
     * The value of the checkbox.
     */
    value: boolean,

    /**
     * Callback function for when the checkbox is edited.
     * @param value The new value of the checkbox.
     */
    onCommit?: (value: boolean) => any 
});

export type DungeonGridInternalRowData = { 
    /**
     * The label for the row.
     */
    label: DungeonGridInternalRowLabelData,

    /**
     * The number of cells that are pinned to the left.
     */
    cellLeftPinCount: number,

    /**
     * The cells of the row.
     */
    cells: DungeonGridInternalCellData[]
};

export function DungeonGridRowComponent(props: DungeonGridInternalRowData): React.JSX.Element {
    return (<tr>
        {!props.label.disabled && <td 
            className={classNames(props.label.className, 'dngrid-row-label')}
            {...props.label.eventHandlers}
        >
            {'component' in props.label ? props.label.component : props.label.text}
        </td>}
        {props.cells.map((cell, idx) => {
            return <td 
                key={`cell-${idx}`}
                className={classNames(
                    cell.className,
                    'dngrid-cell',
                    (idx < props.cellLeftPinCount ? 'dngrid-cell-pin-left' : null),
                    (cell.isEditing ? 'dngrid-cell-editing' : null)
                )}
                {...cell.eventHandlers}
            >
                {'renderer' in cell ? cell.renderer : cell.label}
                {cell.isEditing && (
                    cell.editor === 'text' || cell.editor === undefined 
                    ? <DungeonGridTextEditorComponent 
                        value={cell.editorValue || ('label' in cell ? cell.label : '')}
                        onCommit={(value) => {
                            cell.onCommit?.(value);
                            cell.setEditing(false);
                        }}
                    />
                    : (cell.editor === 'longtext' 
                    ? <DungeonGridTextareaEditorComponent
                        value={cell.editorValue || ('label' in cell ? cell.label : '')}
                        onCommit={(value) => {
                            cell.onCommit?.(value);
                            cell.setEditing(false);
                        }}
                    />
                    : (cell.editor === 'checkbox'
                    ? <DungeonGridCheckboxComponent
                        value={cell.value}
                        onCommit={(value) => {
                            cell.onCommit?.(value);
                            cell.setEditing(false);
                        }}
                    />
                    : <cell.editor
                        stopEditing={() => {
                            cell.setEditing(false);
                        }}
                    />)
                    )
                )}
            </td>
        })}
    </tr>);
}