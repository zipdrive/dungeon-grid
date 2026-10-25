import classNames from "classnames";
import React from "react";

export type DungeonGridTextareaEditorProps = {
    value: string,
    onCommit: (value: string) => any
}

export function DungeonGridTextareaEditorComponent(props: DungeonGridTextareaEditorProps): React.JSX.Element {
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    React.useEffect(() => {
        if (inputRef.current) {
            console.debug('Setting focus and selection range...');
            inputRef.current.focus();
            inputRef.current.setSelectionRange(
                0,
                inputRef.current.value.length
            );
        }
    }, [inputRef]);

    const [value, setValue] = React.useState<string>(props.value);
    
    const onChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>) => { 
        setValue(e.target.value); 
    }, []);
    const onKeyDown = React.useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape' || ((e.key === 'Enter' || e.key === 'Tab') && !e.ctrlKey)) {
            e.preventDefault();
            props.onCommit(value);
        }
    }, [value, props.onCommit]);
    const onBlur = React.useCallback((e: React.FocusEvent) => {
        if (inputRef !== null) {
            console.debug('Blur event received.');
            props.onCommit(value); 
        }
    }, [value, props.onCommit]);
    
    return <textarea
        ref={inputRef}
        className={classNames("dngrid-editor-longtext")}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
    />;
}