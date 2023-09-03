'use client'

import { useState, useEffect, ChangeEvent, DragEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { Tables } from '@/components/Tables';
import { removeNumberFromArray } from '@/lib/utils';
import { Sala } from '@/types/Sala';
import { Table } from '@/types/Table';

export default function Home() {

  const router = useRouter();

  const [sala, setSala] = useState<Sala>(
    {
      currentMaxTableNumber: 2,
      tableNumbersArray: [1, 2],
      tables: [
        {
          tableNumber: 1,
          numberOfMergedTables: 1,
        },
        {
          tableNumber: 2,
          numberOfMergedTables: 2,
        }
      ]
    }
  );

  var draggedTable: Table | null = null;

  function onDrag(table: Table) {
    draggedTable = table;
  }

  function onDrop(table: Table) {

    if (draggedTable == null || table.tableNumber == draggedTable.tableNumber)
      return;

    var dummySala = getSalaObjectCopy();

    dummySala.tableNumbersArray = removeNumberFromArray(dummySala.tableNumbersArray, table.tableNumber);
    dummySala.tableNumbersArray = removeNumberFromArray(dummySala.tableNumbersArray, draggedTable.tableNumber);

    var newTableArray: Table[] = [];

    for (var count = 0; count < dummySala.tables.length; count++) {
      var currentTable = dummySala.tables[count];
      if (currentTable.tableNumber != table.tableNumber && currentTable.tableNumber != draggedTable.tableNumber)
        newTableArray = [...newTableArray, currentTable];
    }

    dummySala.tables = newTableArray;

    //find new max
    dummySala.currentMaxTableNumber = Math.max(...dummySala.tableNumbersArray);

    addTable(dummySala, (table.numberOfMergedTables + draggedTable.numberOfMergedTables));

    //reset dragged table
    draggedTable = null;
  }

  function getSalaObjectCopy() {
    return JSON.parse(JSON.stringify(sala)) as Sala;
  }

  function addTable(dummySala: Sala, numberOfMergedTables: number) {

    if (sala.currentMaxTableNumber != 0) {
      for (var count = 1; count <= dummySala.currentMaxTableNumber; count++) {
        if (dummySala.tableNumbersArray.indexOf(count) == -1) {
          dummySala.tableNumbersArray = [...dummySala.tableNumbersArray, count]
          dummySala.tables.push({
            tableNumber: count,
            numberOfMergedTables: numberOfMergedTables,
          })
          setSala(dummySala);
          return;
        }
      }
    }

    var newTableNumber = dummySala.currentMaxTableNumber + 1;
    dummySala.currentMaxTableNumber = newTableNumber;
    dummySala.tableNumbersArray = [...dummySala.tableNumbersArray, newTableNumber]
    dummySala.tables.push({
      tableNumber: newTableNumber,
      numberOfMergedTables: numberOfMergedTables,
    })
    setSala(dummySala);

  }

  useEffect(() => {
    console.log(sala)
  }, [sala])

  return (
    <div>

      {
        sala.tables.map((table, i) => <Tables key={"table" + i} tableNumber={table.tableNumber} numberOfMergedTables={table.numberOfMergedTables} functionOnDrag={onDrag} functionOnDrop={onDrop} />)
      }

      <button onClick={() => addTable(getSalaObjectCopy(), 1)}>Add</button>

      <button onClick={() => router.push("/")}>Back</button>


    </div>
  )
}
