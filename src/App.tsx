import { useMemo } from 'react'
import { DungeonGrid, type DungeonGridColumn, type DungeonGridRow } from '../';

function App() {
  type Keys = {
    columnA: string,
    columnB: number,
    columnC: string
  };
  const columns: DungeonGridColumn<Keys>[] = useMemo(() => {
    return [
      {
        key: 'columnA'
      },
      {
        key: 'columnB',
        width: 400
      },
      {
        key: 'columnC',
        header: "Custom Label"
      }
    ];
  }, []);
  const rows: DungeonGridRow<Keys>[] = useMemo(() => {
    return [

    ];
  }, []);


  return (
    <>
      <DungeonGrid 
        columns={columns}
        rows={rows}
      />
    </>
  )
}

export default App
