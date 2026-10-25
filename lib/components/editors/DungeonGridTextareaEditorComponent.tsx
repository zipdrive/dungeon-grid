import classNames from "classnames";
import React from "react";

export type DungeonGridTextareaEditorProps = {
    // The initial value of the textarea.
    value: string,

    // If true, selects all text in the input when first focused.
    selectAllText: boolean,

    // Commits the inputted value.
    onCommit: (value: string) => any
}

function DungeonGridTextareaEditorComponent(props: DungeonGridTextareaEditorProps): React.JSX.Element {
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    // Set focus to the textarea
    React.useEffect(() => {
        if (inputRef.current) {
            if (document.activeElement !== inputRef.current) {
                inputRef.current.focus();
                if (props.selectAllText) {
                    inputRef.current.setSelectionRange(
                        0,
                        inputRef.current.value.length
                    );
                } else {
                    inputRef.current.setSelectionRange(
                        inputRef.current.value.length,
                        inputRef.current.value.length
                    );
                }
            }
        }
    }, [inputRef]);

    const [value, setValue] = React.useState<string>(props.value);
    
    const onChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>) => { 
        setValue(e.target.value); 
    }, []);
    const onKeyDown = React.useCallback((e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Escape' || ((e.key === 'Enter' || e.key === 'Tab') && !e.ctrlKey)) {
            e.preventDefault();
            props.onCommit(value);
        }
    }, [value, props.onCommit]);
    const onBlur = React.useCallback((e: React.FocusEvent) => {
        if (inputRef.current && e.relatedTarget !== inputRef.current) {
            props.onCommit(value);
        }
    }, [value, props.onCommit]);
    
    return <textarea
        ref={inputRef}
        tabIndex={0}
        className={classNames("dngrid-editor-text")}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
    />;
}

export const DungeonGridMemoizedTextareaEditorComponent = React.memo(DungeonGridTextareaEditorComponent);