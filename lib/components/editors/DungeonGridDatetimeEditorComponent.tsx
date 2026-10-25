import classNames from "classnames";
import React from "react";

export type DungeonGridDatetimeEditorProps = {
    value: Date,
    onCommit: (value: Date) => any
}

export function DungeonGridDatetimeEditorComponent(props: DungeonGridDatetimeEditorProps): React.JSX.Element {
    const [value, setValue] = React.useState<number>(props.value.valueOf());

    const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => { 
        const newValue: number = Date.parse(e.target.value);
        setValue(Number.isNaN(newValue) ? 0 : newValue); 
    }, []);
    const onKeyDown = React.useCallback((e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === 'Tab') && !e.ctrlKey) {
            e.preventDefault();
            props.onCommit(new Date(value));
        }
    }, [value, props.onCommit]);
    const onBlur = React.useCallback((e: React.FocusEvent) => {
        props.onCommit(new Date(value)); 
    }, [value, props.onCommit]);
    
    return <input
        className={classNames("dngrid-editor-datetime")}
        type="datetime-local"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
    />;
}