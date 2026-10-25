import classNames from "classnames";
import React from "react";

export type DungeonGridCheckboxProps = {
    value: boolean,
    onCommit: (value: boolean) => any
}

export function DungeonGridCheckboxComponent(props: DungeonGridCheckboxProps): React.JSX.Element {
    const [value, setValue] = React.useState<boolean>(props.value);
    
    return <input
        className={classNames("dngrid-checkbox")}
        type="checkbox"
        checked={value}
        onChange={(e) => { setValue(e.target.checked); }}
    />;
}