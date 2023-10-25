'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { Tables } from '@/components/Tables';
import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS, findMissingNumber, getObjectDeepCopy, removeNumbersFromArray } from '@/lib/utils';
import { Sala } from '@/types/Sala';
import { Table } from '@/types/Table';
import { AppearingButton } from '@/components/AppearingButton';

export default function EditTables() {

  const router = useRouter();

  const [sala, setSala] = useState<Sala>(
    {
      currentMaxTableNumber: 0,
      tableNumbersArray: [],
      saleWithTables: {}
    });

  var draggedTable: Table | null = null;

  const [isDeleteTableModeOn, setIsDeleteTableModeOn] = useState(false);
  const [isRotateTableModeOn, setIsRotateTableModeOn] = useState(false);
  const [isResetTableRotationModeOn, setIsResetTableRotationModeOn] = useState(false);

  const [salaAfterTableDrop, setSalaAfterTableDrop] = useState<Sala | null>(null)

  const [selectedSalaNumber, setSelectedSalaNumber] = useState(0);

  function getTableIndex(table: Table) {

    for (var count = 0; count < sala.saleWithTables[table.numero_sala].length; count++) {
      if (table.tableNumber == sala.saleWithTables[table.numero_sala][count].tableNumber)
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
    dummySala.saleWithTables[table.numero_sala][tableIndex].numberOfMergedTables = table.numberOfMergedTables - 1;

    // create a to-be-added table
    var newTable: Table = {
      tableNumber: -1,
      numero_sala: -1,
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

    var dummySala = removeTables([table.tableNumber], table.numero_sala);

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
    var dummySala = getObjectDeepCopy(sala) as Sala;

    // update table top and left values
    dummySala.saleWithTables[table.numero_sala][tableIndex].top = table.top;
    dummySala.saleWithTables[table.numero_sala][tableIndex].left = table.left;

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

    var dummySala = getObjectDeepCopy(sala) as Sala;

    // merge tables
    var newMergedTable = getObjectDeepCopy(table);
    newMergedTable.numberOfMergedTables = table.numberOfMergedTables + draggedTable.numberOfMergedTables;

    removeTables([draggedTable.tableNumber, table.tableNumber], table.numero_sala, dummySala);

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

    let salaObjectKeys = Object.keys(salaObject.saleWithTables);
    let numberOfTables = 0;

    for (let count = 0; count < salaObjectKeys.length; count++) {
      console.log("uff", salaObject.saleWithTables[0])
      numberOfTables = numberOfTables + salaObject.saleWithTables[count].length;
    }

    console.log("salaObjectKeys2", salaObjectKeys, salaObject.tableNumbersArray, salaObject.tableNumbersArray.length, numberOfTables)

    // if lengths don't match there was an error
    if (salaObject.tableNumbersArray.length != numberOfTables) {
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
      dummySala = getObjectDeepCopy(sala) as Sala;
    }

    tables.forEach(table => {

      // find missing number
      let newTableNumber = findMissingNumber(dummySala!.tableNumbersArray);

      // set the new table number
      table.tableNumber = newTableNumber;

      // add the new tableNumber to the arrayTableNumbers
      dummySala!.tableNumbersArray.push(newTableNumber);

      // add the new table to the array
      if (table.numero_sala in dummySala!.saleWithTables) {
        console.log("buai")
        dummySala!.saleWithTables[table.numero_sala].push(table);
      } else {
        console.log("ai")
        dummySala!.saleWithTables[table.numero_sala] = [table];
      }

      // update the current max table number
      if (dummySala!.currentMaxTableNumber < newTableNumber)
        dummySala!.currentMaxTableNumber = newTableNumber;

    });

    return dummySala;

  }

  function removeTables(tableNumbers: number[], salaNumber: number, dummySala: Sala | null = null) {

    // make a copy of the sala object if needed
    if (dummySala != null && !salaConformityCheck(dummySala)) {
      return dummySala;
    } else if (dummySala == null) {
      dummySala = getObjectDeepCopy(sala) as Sala;
    }

    if (dummySala != null) {
      // remove table number
      dummySala.tableNumbersArray = removeNumbersFromArray(dummySala.tableNumbersArray, tableNumbers);

      // create a new tableArray
      var newTableArray: Table[] = [];

      // insert in the new tableArray only the tables with a different table number than the one that will be removed
      for (var count = 0; count < dummySala.saleWithTables[salaNumber].length; count++) {
        var currentTable = dummySala.saleWithTables[salaNumber][count];
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
      dummySala.saleWithTables[salaNumber] = newTableArray;
    }

    return dummySala;

  }

  function appearButtonFunctionOnClick(onClickEvent: MouseEvent<HTMLButtonElement>) {

    var newTable: Table = {
      tableNumber: -1,
      numero_sala: selectedSalaNumber,
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

    var dummySala = getObjectDeepCopy(sala) as Sala;

    dummySala.saleWithTables[table.numero_sala][tableIndex].rotate = table.rotate;

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
      body: JSON.stringify(sala.saleWithTables),
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

  function handleChangeSalaNumber(onChangeEvent: ChangeEvent<HTMLSelectElement>) {
    setSelectedSalaNumber(Number(onChangeEvent.target.value));
  }

  function addSala() {
    let salaObjectKeys = Object.keys(sala.saleWithTables);
    let salaNumbersArray = salaObjectKeys.map(Number);
    if (salaNumbersArray.length == 0)
      return
    let newSalaNumber = findMissingNumber(salaNumbersArray);
    let salaObjectDeepCopy = getObjectDeepCopy(sala) as Sala;
    if (newSalaNumber in salaObjectDeepCopy.saleWithTables) {
      return
    } else {
      salaObjectDeepCopy.saleWithTables[newSalaNumber] = [];
      setSelectedSalaNumber(newSalaNumber);
      setSala(salaObjectDeepCopy);
    }
  }

  function removeCurrentSala() {

    let toBeRemovedTableNumbers: number[] = [];

    sala.saleWithTables[selectedSalaNumber].forEach(table => {
      toBeRemovedTableNumbers.push(table.tableNumber);
    });

    // removes table
    let newSala = removeTables(toBeRemovedTableNumbers, selectedSalaNumber);
    // removes attribute
    delete newSala.saleWithTables[selectedSalaNumber]

    // set SelectedSalaNumber to new sala
    let newsSalaObjectKeys = Object.keys(newSala.saleWithTables);
    let newSalaNumbersArray = newsSalaObjectKeys.map(Number);
    if(newsSalaObjectKeys.length == 0){
      setSelectedSalaNumber(0)
    }else{
      setSelectedSalaNumber(newSalaNumbersArray[0])
    }

    // set newSala
    setSala(newSala)
  }

  return (

    <AppearingButton
      buttonText='+'
      buttonPixelHeight={20}
      buttonPixelWidth={20}
      functionOnClick={appearButtonFunctionOnClick}
    >

      {
        sala.saleWithTables[selectedSalaNumber] != undefined &&
        sala.saleWithTables[selectedSalaNumber].map((table, i) => <Tables
          key={"table" + i}
          table={table}
          tableOrderMenuItemInfo={undefined}
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

      <select
        value={selectedSalaNumber}
        onChange={e => handleChangeSalaNumber(e)}
      >
        <option value='' disabled></option>,
        {
          Object.keys(sala.saleWithTables).map((salaNumber, i) => <option key={"salaNumber_" + i} value={salaNumber}>Sala {salaNumber}</option>)
        }
      </select>

      <button onClick={addSala}>Add Sala</button>

      <button onClick={removeCurrentSala}>Remove current sala</button>

      <button onClick={() => router.push("/")}>Back</button>

      <button onClick={saveSala}>Save</button>

    </AppearingButton>

  )
}
