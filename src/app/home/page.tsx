'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { Tables } from '@/components/Tables';
import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS, removeNumbersFromArray } from '@/lib/utils';
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
    });

  var draggedTable: Table | null = null;

  function getSalaObjectCopy(salaObject: Sala = sala) {
    return JSON.parse(JSON.stringify(salaObject)) as Sala;
  }

  function getTableObjectCopy(tableObject: Table) {
    return JSON.parse(JSON.stringify(tableObject)) as Table;
  }

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

    // get clicked table index
    var tableIndex = getTableIndex(table)

    if (tableIndex == -1) {
      return; //error, table not found
    }

    // get sala object copy
    var dummySala = getSalaObjectCopy();

    // split one table from the clicked table
    dummySala.tables[tableIndex].numberOfMergedTables = table.numberOfMergedTables - 1;

    // create a to-be-added table
    var newTable: Table = {
      tableNumber: -1,
      numberOfMergedTables: 1,
      top: table.top,
      left: table.left + ((table.numberOfMergedTables - 1) * SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS) + 50
    }

    // add table
    addTables([newTable], dummySala);

    if (!salaConformityCheck(dummySala)) {
      return;
    }

    setSala(dummySala);

  }

  function onDrag(table: Table) {
    draggedTable = table;
  }

  function onDragEnd(table: Table) {

    if (table == null)
      return;

    var tableIndex = getTableIndex(table)

    if (tableIndex == -1) {
      return; //error, table not found
    }

    // get salta object copy
    var dummySala = getSalaObjectCopy();

    // update table top and left values
    dummySala.tables[tableIndex].top = table.top;
    dummySala.tables[tableIndex].left = table.left;

    if (!salaConformityCheck(dummySala)) {
      return;
    }

    // update sala
    setSala(dummySala)

    //reset dragged table
    draggedTable = null;

  }

  function onDrop(table: Table) {

    if (draggedTable == null || table.tableNumber == draggedTable.tableNumber)
      return;

    var tableIndex = getTableIndex(table)

    if (tableIndex == -1) {
      return; //error, table not found
    }

    var dummySala = getSalaObjectCopy();

    // merge tables
    var newMergedTable = getTableObjectCopy(dummySala.tables[tableIndex]);
    newMergedTable.numberOfMergedTables = table.numberOfMergedTables + draggedTable.numberOfMergedTables;

    removeTables([draggedTable.tableNumber, table.tableNumber], dummySala);

    addTables([newMergedTable], dummySala)

    if (!salaConformityCheck(dummySala)) {
      return;
    }

    setSala(dummySala);

    //reset dragged table
    draggedTable = null;
  }

  function salaConformityCheck(salaObject: Sala) {

    // if lengths don't match there was an error
    if (salaObject.tableNumbersArray.length != salaObject.tables.length) {
      console.log("Errore! Nonconforming sala object")
      return false;
    }

    return true;

  }

  function addTables(tables: Table[], dummySala: Sala | null = null) {

    // make a copy of the sala object if needed
    if (dummySala != null && !salaConformityCheck(dummySala)) {
      return dummySala;
    } else if (dummySala == null) {
      dummySala = getSalaObjectCopy();
    }

    tables.forEach(table => {

      // table numeration starts at 1
      var newTableNumber = 1;
      // check if there are already tables
      if (dummySala!.tableNumbersArray.length != 0) {
        // there is at least one table
        var tableAdded = false;
        // check which table number is missing
        while (!tableAdded && newTableNumber <= dummySala!.tableNumbersArray.length + 1) {
          if (dummySala!.tableNumbersArray.indexOf(newTableNumber) == -1) {
            // a table with this number does not exist
            tableAdded = true;
          } else {
            // a table with this number already exists
            newTableNumber++;
          }
        }
        // if there were all the numbers there is an error
        if (!tableAdded) {
          console.log("Errore");
          return dummySala;
        }
      }

      // set the new table number
      table.tableNumber = newTableNumber;

      // add the new tableNumber to the arrayTableNumbers
      dummySala!.tableNumbersArray.push(newTableNumber);

      // add the new table to the array
      dummySala!.tables.push(table);

      // update the current max table number
      if (dummySala!.currentMaxTableNumber < newTableNumber)
        dummySala!.currentMaxTableNumber = newTableNumber;

    });

    return dummySala;

  }

  function removeTables(tableNumbers: number[], dummySala: Sala | null = null) {

    // make a copy of the sala object if needed
    if (dummySala != null && !salaConformityCheck(dummySala)) {
      return dummySala;
    } else if (dummySala == null) {
      dummySala = getSalaObjectCopy();
    }

    // remove table number
    dummySala.tableNumbersArray = removeNumbersFromArray(dummySala.tableNumbersArray, tableNumbers);

    // create a new tableArray
    var newTableArray: Table[] = [];

    // insert in the new tableArray only the tables with a different table number than the one that will be removed
    for (var count = 0; count < dummySala.tables.length; count++) {
      var currentTable = dummySala.tables[count];
      if (tableNumbers.indexOf(currentTable.tableNumber) == -1)
        newTableArray.push(currentTable);

    }

    //find new max
    if (dummySala.tableNumbersArray.length == 0) {
      dummySala.currentMaxTableNumber = 0;
    } else {
      dummySala.currentMaxTableNumber = Math.max(...dummySala.tableNumbersArray)
    }

    // update the new tableArray
    dummySala.tables = newTableArray;

    return dummySala;

  }

  function appearButtonFunctionOnClick(onClickEvent: MouseEvent<HTMLButtonElement>) {
    var top = onClickEvent.clientY - (SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS / 2);
    var left = onClickEvent.clientX - (SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS / 2);

    var newTable: Table = {
      tableNumber: -1,
      numberOfMergedTables: 1,
      top: 0,
      left: 0
    }

    setSala(addTables([newTable]));
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
