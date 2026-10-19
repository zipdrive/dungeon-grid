import React from "react";

export type DungeonGridTextEditorProps = {
    value: string,
    onCommit: (value: string) => any
}

export function DungeonGridTextEditorComponent(props: DungeonGridTextEditorProps): React.JSX.Element {
    const [value, setValue] = React.useState<string>(props.value);
    
    return <input
        value={value}
        onChange={(e) => { setValue(e.target.value); }}
        onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === 'Tab') && !e.ctrlKey) {
                e.preventDefault();
                props.onCommit(value);
            }
        }}
        onBlur={() => { 
            props.onCommit(value); 
        }}
    />;
}