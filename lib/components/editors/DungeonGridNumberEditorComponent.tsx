import classNames from "classnames";
import React from "react";

export type DungeonGridNumberEditorProps = {
    value: number,
    onCommit: (value: number) => any
}

export function DungeonGridNumberEditorComponent(props: DungeonGridNumberEditorProps): React.JSX.Element {
    const [value, setValue] = React.useState<number>(props.value);

    const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => { 
        const newValue: number = parseFloat(e.target.value);
        setValue(Number.isNaN(newValue) ? 0 : newValue); 
    }, []);
    const onKeyDown = React.useCallback((e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === 'Tab') && !e.ctrlKey) {
            e.preventDefault();
            props.onCommit(value);
        }
    }, [value, props.onCommit]);
    const onBlur = React.useCallback((e: React.FocusEvent) => {
        props.onCommit(value); 
    }, [value, props.onCommit]);
    
    return <input
        className={classNames("dngrid-editor-number")}
        type="number"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
    />;
}