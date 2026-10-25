import { EventHandlers } from "./util/eventListeners";

export type DungeonGridCommonCellProperties = EventHandlers & {
    /**
     * The class names for the cell.
     */
    className?: string,

    /**
     * True if the cell can be selected with the cursor. False if the cell cannot be selected with the cursor.
     * 
     * Defaults to true.
     */
    selectable?: boolean,

    /**
     * Callback function for when the contents of the cell are deleted.
     */
    onClear?: () => any,

    /**
     * Callback function for when the cell is copied.
     * @returns A string that can then be used to paste.
     */
    onCopy?: () => string,

    /**
     * Callback function for when the cell is pasted onto.
     * @param content A string representing the new pasted content.
     */
    onPaste?: (content: string) => any,
};

export type DungeonGridCellRenderer = {
    renderer: React.ReactNode 
} | {
    label?: string
};

/**
 * A cell that uses the built-in text editor.
 */
export type DungeonGridTextCell = DungeonGridCommonCellProperties & DungeonGridCellRenderer & {
    /**
     * The editor to use. This may be a custom React component, or it may be a string identifying one of the default editors. 
     * The default editors are:
     * - **text**: A text entry.
     * - **date**: A date selector.
     * - **datetime**: A date and time selector.
     * - **number**: A number entry.
     * - **checkbox**: A boolean value represented by a checkbox. (Specifying **checkbox** as the editor overwrites the label and renderer fields.)
     * 
     * To block users from being able to enter a value into this cell, set this field to null. Note that if the **onPaste** property is specified, the cell can still have a value pasted into it from the clipboard even if the editor is set to null.
     */
    editor: 'text',
    
    /**
     * The value to initially pass in to the editor. If not specified, defaults to the value of the "label" property.
     */
    editorValue?: string,

    /**
     * Callback function for when a change to the value of the cell is committed.
     * @param value The edited value of the cell.
     */
    onCommit?: (value: string) => any
};

/**
 * A cell that uses the built-in date editor.
 */
export type DungeonGridDateCell = DungeonGridCommonCellProperties & DungeonGridCellRenderer & {
    /**
     * The editor to use. This may be a custom React component, or it may be a string identifying one of the default editors. 
     * The default editors are:
     * - **text**: A text entry.
     * - **date**: A date selector.
     * - **datetime**: A date and time selector.
     * - **number**: A number entry.
     * - **checkbox**: A boolean value represented by a checkbox. (Specifying **checkbox** as the editor overwrites the label and renderer fields.)
     * 
     * To block users from being able to enter a value into this cell, set this field to null. Note that if the **onPaste** property is specified, the cell can still have a value pasted into it from the clipboard even if the editor is set to null.
     */
    editor: 'date',
    
    /**
     * The value to initially pass in to the editor. If not specified, defaults to the value of the "label" property.
     */
    editorValue?: string,

    /**
     * Callback function for when a change to the value of the cell is committed.
     * @param value The edited value of the cell.
     */
    onCommit?: (value: string) => any
};

/**
 * A cell that uses the built-in datetime editor.
 */
export type DungeonGridDatetimeCell = DungeonGridCommonCellProperties & DungeonGridCellRenderer & {
    /**
     * The editor to use. This may be a custom React component, or it may be a string identifying one of the default editors. 
     * The default editors are:
     * - **text**: A text entry.
     * - **date**: A date selector.
     * - **datetime**: A date and time selector.
     * - **number**: A number entry.
     * - **checkbox**: A boolean value represented by a checkbox. (Specifying **checkbox** as the editor overwrites the label and renderer fields.)
     * 
     * To block users from being able to enter a value into this cell, set this field to null. Note that if the **onPaste** property is specified, the cell can still have a value pasted into it from the clipboard even if the editor is set to null.
     */
    editor: 'datetime',
    
    /**
     * The value to initially pass in to the editor. If not specified, defaults to the value of the "label" property.
     */
    editorValue?: string,

    /**
     * Callback function for when a change to the value of the cell is committed.
     * @param value The edited value of the cell.
     */
    onCommit?: (value: string) => any
};

/**
 * A cell that uses the built-in number editor.
 */
export type DungeonGridNumberCell = DungeonGridCommonCellProperties & DungeonGridCellRenderer & {
    /**
     * The editor to use. This may be a custom React component, or it may be a string identifying one of the default editors. 
     * The default editors are:
     * - **text**: A text entry.
     * - **date**: A date selector.
     * - **datetime**: A date and time selector.
     * - **number**: A number entry.
     * - **checkbox**: A boolean value represented by a checkbox. (Specifying **checkbox** as the editor overwrites the label and renderer fields.)
     * 
     * To block users from being able to enter a value into this cell, set this field to null. Note that if the **onPaste** property is specified, the cell can still have a value pasted into it from the clipboard even if the editor is set to null.
     */
    editor: 'number',
    
    /**
     * The value to initially pass in to the editor. If not specified, defaults to the value of the "label" property.
     */
    editorValue?: string,

    /**
     * Callback function for when a change to the value of the cell is committed.
     * @param value The edited value of the cell.
     */
    onCommit?: (value: number) => any
};

/**
 * A cell that uses the built-in checkbox renderer.
 */
export type DungeonGridCheckboxCell = DungeonGridCommonCellProperties & {
    /**
     * The editor to use. This may be a custom React component, or it may be a string identifying one of the default editors. 
     * The default editors are:
     * - **text**: A text entry.
     * - **date**: A date selector.
     * - **datetime**: A date and time selector.
     * - **number**: A number entry.
     * - **checkbox**: A boolean value represented by a checkbox. (Specifying **checkbox** as the editor overwrites the label and renderer fields.)
     * 
     * To block users from being able to enter a value into this cell, set this field to null. Note that if the **onPaste** property is specified, the cell can still have a value pasted into it from the clipboard even if the editor is set to null.
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
};

/**
 * A cell with a custom editor component.
 */
export type DungeonGridCustomCell = DungeonGridCommonCellProperties & DungeonGridCellRenderer & ({
    /**
     * The editor to use. This may be a custom React component, or it may be a string identifying one of the default editors. 
     * The default editors are:
     * - **text**: A text entry.
     * - **date**: A date selector.
     * - **datetime**: A date and time selector.
     * - **number**: A number entry.
     * - **checkbox**: A boolean value represented by a checkbox. (Specifying **checkbox** as the editor overwrites the label and renderer fields.)
     * 
     * To block users from being able to enter a value into this cell, set this field to null. Note that if the **onPaste** property is specified, the cell can still have a value pasted into it from the clipboard even if the editor is set to null.
     */
    editor: React.JSXElementConstructor<{
        /**
         * A text value that the editor is initialized with.
         */
        editorValue: string,

        /**
         * Function to close the editor component.
         */
        closeEditor: () => void
    }>,

    /**
     * The value to initially pass to the editor. If not specified, defaults to the value of the "label" property.
     */
    editorValue?: string,

    /**
     * True if the user can type to start editing the cell. False if the user is forced to double-click or use the Escape key to start editing.
     */
    typeToStartEditing?: true 
} | {
    /**
     * The editor to use. This may be a custom React component, or it may be a string identifying one of the default editors. 
     * The default editors are:
     * - **text**: A text entry.
     * - **date**: A date selector.
     * - **datetime**: A date and time selector.
     * - **number**: A number entry.
     * - **checkbox**: A boolean value represented by a checkbox. (Specifying **checkbox** as the editor overwrites the label and renderer fields.)
     * 
     * To block users from being able to enter a value into this cell, set this field to null. Note that if the **onPaste** property is specified, the cell can still have a value pasted into it from the clipboard even if the editor is set to null.
     */
    editor: React.JSXElementConstructor<{
        /**
         * Function to close the editor component.
         */
        closeEditor: () => void
    }>,

    /**
     * True if the user can type to start editing the cell. False if the user is forced to double-click or use the Escape key to start editing.
     */
    typeToStartEditing: false
});

/**
 * A cell that cannot be manually edited.
 * 
 * If the **onPaste** property is specified, the cell can still have a value pasted into it from the clipboard.
 */
export type DungeonGridReadonlyCell = DungeonGridCommonCellProperties & DungeonGridCellRenderer & {
    /**
     * The editor to use. This may be a custom React component, or it may be a string identifying one of the default editors. 
     * The default editors are:
     * - **text**: A text entry.
     * - **date**: A date selector.
     * - **datetime**: A date and time selector.
     * - **number**: A number entry.
     * - **checkbox**: A boolean value represented by a checkbox. (Specifying **checkbox** as the editor overwrites the label and renderer fields.)
     * 
     * To block users from being able to enter a value into this cell, set this field to null. Note that if the **onPaste** property is specified, the cell can still have a value pasted into it from the clipboard even if the editor is set to null.
     */
    editor: null 
};

/**
 * The properties for an editable cell in the grid.
 */
export type DungeonGridEditableCell = 
    DungeonGridTextCell
    | DungeonGridDateCell
    | DungeonGridDatetimeCell
    | DungeonGridCustomCell
;

/**
 * The properties for a cell in the grid.
 */
export type DungeonGridCell = 
    DungeonGridTextCell
    | DungeonGridDateCell
    | DungeonGridDatetimeCell
    | DungeonGridCheckboxCell
    | DungeonGridCustomCell
    | DungeonGridReadonlyCell
;

/**
 * Retrieves a cell by a unique combination of a row key and a column key.
 */
export type GetDungeonGridCellContentFunction<RowKey, ColumnKey> = (rowKey: RowKey, columnKey: ColumnKey) => DungeonGridCell;

/**
 * Checks whether a cell needs to be updated or not.
 */
export type GetDungeonGridCellUpdateFunction<RowKey, ColumnKey> = (rowKey: RowKey, columnKey: ColumnKey) => boolean;