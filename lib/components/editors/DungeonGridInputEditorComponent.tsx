import classNames from "classnames";
import React from "react";

export type DungeonGridInputEditorProps = {
    value: string,
    selectAllText: boolean,
    inputType: 'date' | 'datetime-local',
    onCommit: (value: string) => any
}

export function DungeonGridInputEditorComponent(props: DungeonGridInputEditorProps): React.JSX.Element {
    const inputRef = React.useRef<HTMLInputElement>(null);
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
    
    const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => { 
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
    
    return <input
        ref={inputRef}
        tabIndex={0}
        className={classNames(`dngrid-editor-${props.inputType}`)}
        type={props.inputType}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
    />;
}