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

  const [tablesArray, setTablesArray] = useState<Table[]>([]);
  const [currentMaxTableNumber, setCurrentMaxTableNumber] = useState<number>(0);
  const [tableNumbersArray, setTableNumbersArray] = useState<number[]>([]);

  var draggedTable: Table | null = null;

  function getTableIndex(table: Table) {

    for (var count = 0; count < tablesArray.length; count++) {
      if (table.tableNumber == tablesArray[count].tableNumber)
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

    // get tableArray copy
    var dummyTablesArray = getTablesArrayObjectCopy();

    // get table copy
    var dummyTable = getTableObjectCopy(dummyTablesArray[tableIndex]);
    // split one table from the clicked table
    dummyTable.numberOfMergedTables = table.numberOfMergedTables - 1;
    // update object
    dummyTablesArray[tableIndex] = dummyTable;

    // create a to-be-added table
    var newTable: Table = {
      tableNumber: -1,
      numberOfMergedTables: 1,
      top: table.top,
      left: table.left + ((table.numberOfMergedTables - 1) * SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS) + 50
    }

    // add table
    addTable(newTable, dummyTablesArray);

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

    // get tablesArray copy
    var dummyTablesArray = getTablesArrayObjectCopy();

    // get table copy
    var dummyTable = getTableObjectCopy(dummyTablesArray[tableIndex]);
    // update table top and left values
    dummyTable.top = table.top;
    dummyTable.left = table.left;
    // update object
    dummyTablesArray[tableIndex] = dummyTable;

    console.log("table", dummyTable)

    // update tablesArray
    setTablesArray(dummyTablesArray);

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

    var dummyTablesArray = getTablesArrayObjectCopy();

    // get table copy
    var dummyTable = getTableObjectCopy(dummyTablesArray[tableIndex]);
    // merge tables
    dummyTable.numberOfMergedTables = table.numberOfMergedTables + draggedTable.numberOfMergedTables;
    // update object
    dummyTablesArray[tableIndex] = dummyTable;

    removeTablesAndAdd([draggedTable.tableNumber, table.tableNumber], dummyTable, dummyTablesArray);

    //reset dragged table
    draggedTable = null;
  }

  function getTablesArrayObjectCopy() {
    return JSON.parse(JSON.stringify(tablesArray)) as Table[];
  }

  function getTableObjectCopy(table: Table) {
    return JSON.parse(JSON.stringify(table)) as Table;
  }

  function addTable(table: Table, dummyTablesArray: Table[] = getTablesArrayObjectCopy()) {

    // if lengths don't match there was an error
    if (tableNumbersArray.length != tablesArray.length) {
      console.log("Errore")
      return
    }

    // table numeration starts at 1
    var newTableNumber = 1;
    // check if there are already tables
    if (dummyTablesArray.length != 0) {
      // there is at least one table
      var tableAdded = false;
      // check which table number is missing
      while (!tableAdded && newTableNumber <= tableNumbersArray.length + 1) {
        if (tableNumbersArray.indexOf(newTableNumber) == -1) {
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
        return;
      }
    }

    // set the new table number
    table.tableNumber = newTableNumber;

    // add the new table to the array
    dummyTablesArray.push(table);

    // update the current max table number
    if (currentMaxTableNumber < newTableNumber)
      setCurrentMaxTableNumber(newTableNumber)

    // update the tableNumber array
    setTableNumbersArray([...tableNumbersArray, newTableNumber])

    // update the table array
    setTablesArray(dummyTablesArray);

  }

  function removeTables(tableNumbers: number[], dummyTablesArray: Table[] = getTablesArrayObjectCopy()) {

    // if lengths don't match there was an error
    if (tableNumbersArray.length != tablesArray.length) {
      console.log("Errore")
      return
    }

    // remove table number
    var newTableNumbersArray = removeNumbersFromArray(tableNumbersArray, tableNumbers);

    // create a new tableArray
    var newTableArray: Table[] = [];

    // insert in the new tableArray only the tables with a different table number than the one that will be removed
    for (var count = 0; count < dummyTablesArray.length; count++) {
      var currentTable = dummyTablesArray[count];
      if (tableNumbers.indexOf(currentTable.tableNumber) == -1)
        newTableArray.push(currentTable);

    }

    //find new max
    if (newTableNumbersArray.length == 0) {
      setCurrentMaxTableNumber(0);
    } else {
      setCurrentMaxTableNumber(Math.max(...newTableNumbersArray))
    }

    // update the new tableNumbersArray
    setTableNumbersArray(newTableNumbersArray)

    // update the new tableArray
    setTablesArray(newTableArray);

  }

  function removeTablesAndAdd(tableNumbers: number[], table: Table, dummyTablesArray: Table[] = getTablesArrayObjectCopy()) {

    // if lengths don't match there was an error
    if (tableNumbersArray.length != tablesArray.length) {
      console.log("Errore")
      return
    }

    // remove table number
    var newTableNumbersArray = removeNumbersFromArray(tableNumbersArray, tableNumbers);

    // create a new tableArray
    var newTableArray: Table[] = [];

    // insert in the new tableArray only the tables with a different table number than the one that will be removed
    for (var count = 0; count < dummyTablesArray.length; count++) {
      var currentTable = dummyTablesArray[count];
      if (tableNumbers.indexOf(currentTable.tableNumber) == -1)
        newTableArray.push(currentTable);

    }

    // table numeration starts at 1
    var newTableNumber = 1;
    // check if there are already tables
    if (newTableArray.length != 0) {
      // there is at least one table
      var tableAdded = false;
      // check which table number is missing
      while (!tableAdded && newTableNumber <= newTableNumbersArray.length + 1) {
        if (newTableNumbersArray.indexOf(newTableNumber) == -1) {
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
        return;
      }
    }

    // set the new table number
    table.tableNumber = newTableNumber;

    // add the new table to the array
    newTableArray.push(table);

    // update the current max table number
    //find new max
    if (newTableNumbersArray.length == 0) {
      setCurrentMaxTableNumber(0);
    } else {
      setCurrentMaxTableNumber(Math.max(...newTableNumbersArray, newTableNumber))
    }

    // update the tableNumber array
    setTableNumbersArray([...newTableNumbersArray, newTableNumber])

    // update the table array
    setTablesArray(newTableArray);

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

    addTable(newTable);
  }

  useEffect(() => {
    console.log(currentMaxTableNumber, tableNumbersArray, tablesArray)
  }, [currentMaxTableNumber, tableNumbersArray, tablesArray])

  return (

    <AppearingButton
      buttonText='+'
      buttonPixelHeight={20}
      buttonPixelWidth={20}
      functionOnClick={appearButtonFunctionOnClick}
    >

      {
        tablesArray.map((table, i) => <Tables
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
