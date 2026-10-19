import React from "react";

export type DungeonGridTextareaEditorProps = {
    value: string,
    onCommit: (value: string) => any
}

export function DungeonGridTextareaEditorComponent(props: DungeonGridTextareaEditorProps): React.JSX.Element {
    const [value, setValue] = React.useState<string>(props.value);
    
    return <textarea
        value={value}
        onChange={(e) => { setValue(e.target.value); }}
        onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.ctrlKey) {
                e.preventDefault();
                props.onCommit(value);
            }
        }}
        onBlur={() => { 
            props.onCommit(value); 
        }}
    />;
}