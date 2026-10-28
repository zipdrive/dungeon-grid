# DungeonGrid

**DungeonGrid** is a spreadsheet-like React component designed to put most of the logic into the developer's hands. The source code is under the MIT license and can be found [here](https://github.com/zipdrive/dungeon-grid).

Install into your project with:

```
npm install dungeon-grid-react
```

Basic usage is as follows:

```JSX
import React from 'react';
import { DungeonGrid, DungeonGridRow, DungeonGridColumn, DungeonGridCell } from 'dungeon-grid-react';

type RowKey = number;
type Row = {
  name: string,
  phoneNumber: string,
  email: string,
  birthday: Date
};
type ColumnKey = keyof Row;

function DungeonGridDemo(props: {
  data: Row[]
}): React.JSX.Element {
  // Cache for the data
  const [dataCache, setDataCache] = React.useState<Row[]>([]);

  // The rows of the grid
  const rows: DungeonGridRow<RowKey>[] = React.useMemo(() => {
    return [...Array(dataCache.length).keys()
      .map((rowIndex) => {
        return {
          key: rowIndex
        };
      })
    ];
  }, [dataCache.length]);

  // The columns of the grid
  const columns: DungeonGridColumn<ColumnKey>[] = React.useMemo(() => {
    return [
      {
        key: 'name',
        label: "Name"
      },
      {
        key: 'phoneNumber',
        label: {
          component: <span>&#9743; Phone Number</span>,
          onClick: () => {
            console.log('You clicked the Phone Number column label!');
          }
        }
      },
      {
        key: 'email',
        label: {
          className: "emailHeader",
          text: "Email"
        },
        resizable: true,
        onColumnResize: (width) => {
          console.log(`You resized the email column to ${width}px!`);
        }
      },
      {
        key: 'birthday'
        // Since the label for this column is not specified, it will use the default label for column #4, which is "D"
      }
    ];
  }, []);

  // Function to get a cell's contents, given the row key and column key
  const getCellContent = React.useCallback((rowKey: RowKey, columnKey: ColumnKey) => {
    switch (columnKey) {
      case 'name':
        return {
          label: dataCache[rowKey].name,
          selectable: false, // This causes the cells in the "Name" column to be unselectable
          editor: null // This causes the cells in the "Name" column to be uneditable
        };
      case 'phoneNumber': 
        return {
          label: dataCache[rowKey].phoneNumber,
          onClick: () => {
            console.log('You clicked a Phone Number cell!');
          }
        };
      case 'email': {
        const email: string = dataCache[rowKey].email;
        return {
          label: <a href={`mailto:${email}`}>{email}</a>, // Uses a custom component for rendering the cell value
          editorValue: email
        };
      }
      case 'birthday': {
        const date: Date = dataCache[rowKey].birthday;
        const text: string = `${date.getFullYear().toString().padStart(4, '0')}-${date.getMonth().toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        return {
          label: text,
          editor: 'date'
        };
      }
    }
  }, [dataCache]);

  // Manager for data update flags
  type DataUpdateFlagAction = {
    type: 'set',
    rowKey: RowKey,
    columnKey: ColumnKey
  } | {
    type: 'unset',
    rowKey: RowKey,
    columnKey: ColumnKey
  };
  const [dataUpdateFlags, updateDataFlag] = React.useReducer<Set<`Row: ${RowKey}, Column: ${ColumnKey}`>, DataUpdateFlagAction>((oldDataUpdateFlags, action) => {
    switch (action.type) {
      case 'set': {
        const newDataUpdateFlags = new Set(oldDataUpdateFlags);
        newDataUpdateFlags.add(`Row: ${action.rowKey}, Column: ${action.columnKey}`);
        return newDataUpdateFlags;
      }
      case 'unset': {
        const newDataUpdateFlags = new Set(oldDataUpdateFlags);
        newDataUpdateFlags.delete(`Row: ${action.rowKey}, Column: ${action.columnKey}`);
        return newDataUpdateFlags;
      }
    }
  }, new Set());

  // Update the data cache and set flags for any value that was updated
  React.useEffect(() => {
    setDataCache((oldDataCache) => {
      for (let rowIndex = 0; rowIndex < props.data.length; ++rowIndex) {
        if (rowIndex < oldDataCache.length) {
          const oldRow = oldDataCache[rowIndex];
          for (const key in props.data[rowIndex]) {
            if (oldRow[key] !== newRow[key]) {
              updateDataFlag({
                type: 'set',
                rowKey: rowIndex,
                columnKey: key as ColumnKey
              });
            }
          }
        } else {
          for (const key in props.data[rowIndex]) {
            updateDataFlag({
              type: 'set',
              rowKey: rowIndex,
              columnKey: key as ColumnKey
            });
          }
        }
      }
      return props.data;
    });
  }, [props.data]);

  // Function to get whether a cell is flagged for an update
  const getCellUpdate = React.useCallback((rowKey: RowKey, columnKey: ColumnKey) => {
    if (dataUpdateFlags.has(`Row: ${rowKey}, Column: ${columnKey}`)) {
      updateDataFlag({
        type: 'unset',
        rowKey,
        columnKey
      });
      return true;
    }
    return false;
  }, [dataUpdateFlags]);

  return <DungeonGrid
    rows={rows}
    columns={columns}
    getCellContent={getCellContent}
    getCellUpdate={getCellUpdate}
  />;
}
```

## DungeonGrid\<RowKey, ColumnKey> Properties

### rows

**Type:** `DungeonGridRow<RowKey>`

The rows of the grid.

### columns

**Type:** `DungeonGridColumn<ColumnKey>`

The columns of the grid.

### getCellContent

**Type:** `(rowKey: RowKey, columnKey: ColumnKey) => DungeonGridCell`

A function to retrieve a cell of the grid.

### getCellUpdate

**Type:** `(rowKey: RowKey, columnKey: ColumnKey) => boolean`

A function to retrieve whether a cell needs to be updated. Until this function returns true, the grid will continue using a cached value of the cell.

### className (optional)

**Type:** `string`

The CSS class(es) of the grid container.

### style (optional)

**Type:** `React.CSSProperties`

The CSS style properties of the grid container.

### disableRowLabels (optional)

**Type:** `boolean`

True if row labels should be disabled. False by default.

### disableColumnLabels (optional)

**Type:** `boolean`

True if column labels should be disabled. False by default.

## DungeonGridRow\<RowKey> Properties

### key

**Type:** `RowKey`

A unique key identifying the row.

### label (optional)

**Type:** `string | DungeonGridRowLabel`

If a string, the text of the row label.

Otherwise, a configuration object for the row label.

### height (optional)

**Type:** `string | number`

If a number, defines the default height of the row in pixels.

If a string, defines the default height of the row as a CSS `<track-size>` for `grid-template-rows`.

Defaults to "min-content".

### resizable (optional)

**Type:** `boolean`

True if the row can be resized. False if the row cannot be resized.

Defaults to false.

### onRowResize (optional)

**Type:** `(height: number) => any`

Callback function for when the user finishes resizing the row.

## DungeonGridColumn\<ColumnKey> Properties

### key

**Type:** `ColumnKey`

A unique key identifying the column.

### header (optional)

**Type:** `string | DungeonGridColumnLabel`

If a string, the text of the column label.

Otherwise, a configuration object for the column label.

### width (optional)

**Type:** `string | number`

If a number, defines the default width of the column in pixels.

If a string, defines the default width of the column as a CSS `<track-size>` for `grid-template-columns`.

Defaults to "min-content".

### resizable (optional)

**Type:** `boolean`

True if the column can be resized. False if the column cannot be resized.

Defaults to false.

### onColumnResize (optional)

**Type:** `(height: number) => any`

Callback function for when the user finishes resizing the column.

## DungeonGridCell Properties

### editor (optional)

**Type:** `'text' | 'date' | 'datetime' | 'checkbox' | React.JSXElementConstructor | null`

The editor to use. This may be a custom React component, or it may be a string identifying one of the default editors. 

The default editors are:
- **text**: A text entry.
- **date**: A date selector.
- **datetime**: A date and time selector.
- **checkbox**: A boolean value represented by a checkbox. (Specifying **checkbox** as the editor overwrites the label and renderer fields.)

A custom React component takes the following properties:
- `closeEditor: () => void`\
A function that closes the editor.
- `editorValue: string`\
The value that is initially passed into the editor, if the user starts editing the cell by typing. Only available if the `typeToStartEditing` property of the cell is set to true.

To block users from being able to enter a value into this cell, set this property to null. Note that if the `onPaste` property is specified, the cell can still have a value pasted into it from the clipboard even if the editor is set to null.

Defaults to "text".

### editorValue (optional)

**Type:** `string`

Available if the `editor` property is "text", "date", "datetime", or a custom component. (Only available for custom components if the `typeToStartEditing` property of the cell is set to true.)

The initial value of the cell editor.

If not specified, the default value of the editor will be the string value of the `label` property.

### onCommit (optional)

**Type:** `(value: string) => any`

Available if the `editor` property is "text", "date", or "datetime".

Callback function for when the user commits their changes in the editor.

### value (optional)

**Type:** boolean

Available if the `editor` property is "checkbox".

The boolean value of the checkbox.

### onCommit (optional)

**Type:** `(value: boolean) => any`

Callback function for when the user ticks or unticks the checkbox.

### typeToStartEditing (optional)

**Type:** `boolean`

Available if the `editor` property is a custom component.

If true, the user can start editing the cell by selecting it and beginning to type. If false, the user can only start editing the cell by double-clicking it.

Defaults to true.

### label (optional)

**Type:** `string | React.ReactNode`

If a string, the text content of the cell.

Otherwise, a custom React node for rendering the content of the cell.

Cannot be used if the `editor` property is "checkbox".

### onCopy (optional)

**Type:** `() => string`

A function that is called whenever the cell is copied. Returns a value that can then be pasted into another cell.

### onPaste (optional)

**Type:** `(value: string) => any`

A function that is called whenever the cell is pasted into. The `value` parameter is the pasted value.

### onClear (optional)

**Type:** `() => any`

A function that is called whenever the cell's contents are deleted.

### selectable (optional)

**Type:** `boolean`

True if the cell cannot be selected with the cursor. False if the cell can be selected.

Defaults to false.

### className (optional)

**Type:** `string`

The CSS class(es) of the cell.

