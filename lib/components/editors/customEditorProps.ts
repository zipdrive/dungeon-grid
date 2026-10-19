export type DungeonGridCustomEditorProps = {
    /**
     * Clears the contents of the cell.
     */
    clear: () => any,

    /**
     * Stops editing the cell.
     */
    stopEditing: () => void,
};