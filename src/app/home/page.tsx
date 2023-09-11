'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { Tables } from '@/components/Tables';
import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS, removeNumberFromArray } from '@/lib/utils';
import { Sala } from '@/types/Sala';
import { Table } from '@/types/Table';
import { AppearingButton } from '@/components/AppearingButton';

export default function Home() {

  const router = useRouter();

  const [sala, setSala] = useState<Sala>(
    {
      currentMaxTableNumber: 0,
      tableNumbersArray: [],
      tables: []
    }
  );

  const [isWasTableDropped, setIsWasTableDropped] = useState(false);

  var draggedTable: Table | null = null;

  function getTableIndex(table: Table) {

    for (var count = 0; count < sala.tables.length; count++) {
      if (table.tableNumber == sala.tables[count].tableNumber)
        return count;
    }

    return -1;

  }

  function onClick(table: Table) {

    if (window == null || table == null || table.numberOfMergedTables <= 1)
      return;

    var dummySala = getSalaObjectCopy();

    var tableIndex = getTableIndex(table)

    if (tableIndex == -1) {
      return; //error, table not found
    }

    dummySala.tables[tableIndex].numberOfMergedTables = dummySala.tables[tableIndex].numberOfMergedTables - 1;

    addTable(dummySala, 1, table.top, table.left + ((table.numberOfMergedTables - 1) * SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS) + 50);

  }

  function onDrag(table: Table) {
    draggedTable = table;
  }

  function onDragEnd(table: Table) {

    //reset dragged table
    draggedTable = null;

    if (isWasTableDropped) {
      setIsWasTableDropped(false);
      return;
    }

    console.log("drag")

    if (table == null)
      return;

    var dummySala = getSalaObjectCopy();

    var tableIndex = getTableIndex(table)

    if (tableIndex == -1) {
      return; //error, table not found
    }

    dummySala.tables[tableIndex].top = table.top;
    dummySala.tables[tableIndex].left = table.left;

    setSala(dummySala);

  }

  function onDrop(table: Table) {

    setIsWasTableDropped(true);

    console.log("drop")

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
    if (dummySala.tableNumbersArray.length != 0)
      dummySala.currentMaxTableNumber = Math.max(...dummySala.tableNumbersArray);

    addTable(dummySala, (table.numberOfMergedTables + draggedTable.numberOfMergedTables), table.top, table.left);

    //reset dragged table
    draggedTable = null;
  }

  function getSalaObjectCopy() {
    return JSON.parse(JSON.stringify(sala)) as Sala;
  }

  function addTable(dummySala: Sala, numberOfMergedTables: number, top: number, left: number) {

    if (dummySala.currentMaxTableNumber != 0) {
      for (var count = 1; count <= dummySala.currentMaxTableNumber; count++) {
        if (dummySala.tableNumbersArray.indexOf(count) == -1) {
          dummySala.tableNumbersArray = [...dummySala.tableNumbersArray, count]
          dummySala.tables.push({
            tableNumber: count,
            numberOfMergedTables: numberOfMergedTables,
            top: top,
            left: left
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
      top: top,
      left: left
    })
    setSala(dummySala);

  }

  function appearButtonFunctionOnClick(onClickEvent: MouseEvent<HTMLButtonElement>) {
    var top = onClickEvent.clientY - (SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS / 2);
    var left = onClickEvent.clientX - (SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS / 2);
    addTable(getSalaObjectCopy(), 1, top, left);
  }

  useEffect(() => {
    console.log(sala)
  }, [sala])

  return (

    <AppearingButton
      buttonText='+'
      buttonPixelHeight={20}
      buttonPixelWidth={20}
      functionOnClick={appearButtonFunctionOnClick}
    >

      {
        sala.tables.map((table, i) => <Tables
          key={"table" + i}
          tableNumber={table.tableNumber}
          numberOfMergedTables={table.numberOfMergedTables}
          top={table.top}
          left={table.left}
          functionOnDrag={onDrag}
          functionOnDragEnd={onDragEnd}
          functionOnDrop={onDrop}
          functionOnClick={onClick}
        />)
      }

      <button onClick={() => router.push("/")}>Back</button>

    </AppearingButton>

  )
}
