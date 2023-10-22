'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { Tables } from '@/components/Tables';
import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS, getObjectDeepCopy, removeNumbersFromArray } from '@/lib/utils';
import { Sala } from '@/types/Sala';
import { Table } from '@/types/Table';
import { AppearingButton } from '@/components/AppearingButton';

export default function EditTables() {

  const router = useRouter();

  const [sala, setSala] = useState<Sala>(
    {
      currentMaxTableNumber: 0,
      tableNumbersArray: [],
      tables: []
    });

  var draggedTable: Table | null = null;

  const [isDeleteTableModeOn, setIsDeleteTableModeOn] = useState(false);
  const [isRotateTableModeOn, setIsRotateTableModeOn] = useState(false);
  const [isResetTableRotationModeOn, setIsResetTableRotationModeOn] = useState(false);

  const [salaAfterTableDrop, setSalaAfterTableDrop] = useState<Sala | null>(null)

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
    var dummySala = getObjectDeepCopy(sala) as Sala;

    // split one table from the clicked table
    dummySala.tables[tableIndex].numberOfMergedTables = table.numberOfMergedTables - 1;

    // create a to-be-added table
    var newTable: Table = {
      tableNumber: -1,
      numberOfMergedTables: 1,
      top: table.top,
      left: table.left + ((table.numberOfMergedTables - 1) * SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS) + 50,
      rotate: 0,
      ora: null,
      nome_prenotazione: null,
      numero_persone: null,
      note: null
    }

    // add table
    addTables([newTable], dummySala);

    if (!salaConformityCheck(dummySala)) {
      return;
    }

    setSala(dummySala);

  }

  function onClickWhileInDeleteTableMode(table: Table) {

    var dummySala = removeTables([table.tableNumber]);

    if (dummySala == null)
      return

    if (!salaConformityCheck(dummySala)) {
      return;
    }

    setSala(dummySala)
  }

  function onDrag(table: Table) {
    draggedTable = table;
  }

  function onDragEnd(table: Table) {

    // when a table is dropped onto another, the dropped table fires the onDragEnd event.
    // Because we have previously stored the updated sala object thanks to the
    // onDrop function (Check the setSalaAfterTableDrop inside the onDrop function),
    // we now update the true sala object.
    // Otherwise a table, that is neither the dropped table or the target 
    // table upon which the table was dropped, will move.
    if (salaAfterTableDrop != null) {
      setSala(salaAfterTableDrop)
      setSalaAfterTableDrop(null)
      return;
    }

    if (table == null)
      return;

    var tableIndex = getTableIndex(table)

    if (tableIndex == -1) {
      return; //error, table not found
    }

    // get salta object copy
    var dummySala = getObjectDeepCopy(sala);

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

    if (draggedTable == null || table.tableNumber == draggedTable.tableNumber) {
      draggedTable = null;
      return;
    }

    var dummySala = getObjectDeepCopy(sala);

    // merge tables
    var newMergedTable = getObjectDeepCopy(table);
    newMergedTable.numberOfMergedTables = table.numberOfMergedTables + draggedTable.numberOfMergedTables;

    removeTables([draggedTable.tableNumber, table.tableNumber], dummySala);

    addTables([newMergedTable], dummySala)

    if (!salaConformityCheck(dummySala)) {
      return;
    }

    // when a table is dropped onto another, the dropped table fires the onDragEnd event, 
    // so we temporarily need to save the updated sala inside another object. 
    // Otherwise a table, that is neither the dropped table or the target 
    // table upon which the table was dropped, will move.
    // (Check the if inside the onDragEnd function for the 2nd part)
    setSalaAfterTableDrop(dummySala);

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
      dummySala = getObjectDeepCopy(sala);
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
      dummySala = getObjectDeepCopy(sala);
    }

    if (dummySala != null) {
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
    }

    return dummySala;

  }

  function appearButtonFunctionOnClick(onClickEvent: MouseEvent<HTMLButtonElement>) {

    var newTable: Table = {
      tableNumber: -1,
      numberOfMergedTables: 1,
      top: onClickEvent.clientY - (SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS / 2),
      left: onClickEvent.clientX - (SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS / 2),
      rotate: 0,
      ora: null,
      nome_prenotazione: null,
      numero_persone: null,
      note: null
    }

    let newSala = addTables([newTable]);

    if (newSala == null)
      return

    setSala(newSala);
  }

  function onSaveRotation(table: Table) {

    var tableIndex = getTableIndex(table);

    var dummySala = getObjectDeepCopy(sala);

    dummySala.tables[tableIndex].rotate = table.rotate;

    if (!salaConformityCheck(dummySala)) {
      return;
    }

    setSala(dummySala);
  }

  function resetTableRotation(table: Table) {
    table.rotate = 0;
    onSaveRotation(table);
  }

  function saveSala() {

    if (!salaConformityCheck(sala))
      return;


    fetch("http://localhost:3000/home/editTables/api", {
      method: "POST",
      body: JSON.stringify(sala.tables),
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data) => {
        console.log("response", data)
        //router.push('/home');
        window.location.reload();

      }); // Update the state with the fetched data

  }

  useEffect(() => {
    console.log("sala", sala)
  }, [sala])

  useEffect(() => {
    console.log("AfterTableDropSala", salaAfterTableDrop)
  }, [salaAfterTableDrop])

  useEffect(() => {
    console.log("runs one time only");

    fetch("http://localhost:3000/home/editTables/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data: Sala) => {
        setSala(data);
      }); // Update the state with the fetched data

  }, [])

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
          table={table}
          isCanBeClicked={true}
          isCanBeDragged={true}
          isCanBeRotated={isRotateTableModeOn}
          isResetTableRotation={isResetTableRotationModeOn}
          functionOnDrag={onDrag}
          functionOnDragEnd={onDragEnd}
          functionOnDrop={onDrop}
          functionOnClick={isResetTableRotationModeOn ? resetTableRotation : (isDeleteTableModeOn ? onClickWhileInDeleteTableMode : isRotateTableModeOn ? null : onClick)}
          functionOnSaveRotation={onSaveRotation}
        />)
      }

      <button
        className={isDeleteTableModeOn ? styles.deleteTableModeOn : styles.deleteTableModeOff}
        onClick={() => setIsDeleteTableModeOn(!isDeleteTableModeOn)}
      >Delete table {isDeleteTableModeOn ? "on" : "off"}</button>

      <button
        className={isRotateTableModeOn ? styles.deleteTableModeOn : styles.deleteTableModeOff}
        onClick={() => setIsRotateTableModeOn(!isRotateTableModeOn)}
      >Rotate table {isRotateTableModeOn ? "on" : "off"}</button>

      <button
        className={isResetTableRotationModeOn ? styles.deleteTableModeOn : styles.deleteTableModeOff}
        onClick={() => setIsResetTableRotationModeOn(!isResetTableRotationModeOn)}
      >Reset table rotation {isResetTableRotationModeOn ? "on" : "off"}</button>

      <button onClick={() => router.push("/")}>Back</button>

      <button onClick={saveSala}>Save</button>

    </AppearingButton>

  )
}
