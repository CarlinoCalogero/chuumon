'use client'

import { useState, useEffect, ChangeEvent, DragEvent, MouseEvent } from 'react'
import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import { Tables } from '@/components/Tables';
import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS, removeNumbersFromArray } from '@/lib/utils';
import { Sala } from '@/types/Sala';
import { Table } from '@/types/Table';
import { AppearingButton } from '@/components/AppearingButton';
import { RotateInfo } from '@/types/RotateInfo';

export default function Home() {

  const router = useRouter();

  const [sala, setSala] = useState<Sala>(
    {
      currentMaxTableNumber: 0,
      tableNumbersArray: [],
      tables: []
    });

  var draggedTable: Table | null = null;

  const [isDeleteTableModeOn, setIsDeleteTableModeOn] = useState(false);
  const [salaAfterTableDrop, setSalaAfterTableDrop] = useState<Sala | null>(null)

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

  function onClickWhileInDeleteTableMode(table: Table) {

    var dummySala = removeTables([table.tableNumber]);

    if (!salaConformityCheck(dummySala)) {
      return;
    }

    setSala(dummySala)
  }

  function onDrag(table: Table) {
    draggedTable = table;
  }

  function onDragEnd(table: Table) {

    console.log("drag", table.tableNumber)

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

    console.log("drop", table.tableNumber)

    if (draggedTable == null || table.tableNumber == draggedTable.tableNumber) {
      draggedTable = null;
      return;
    }

    var dummySala = getSalaObjectCopy();

    // merge tables
    var newMergedTable = getTableObjectCopy(table);
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

    var newTable: Table = {
      tableNumber: -1,
      numberOfMergedTables: 1,
      top: onClickEvent.clientY - (SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS / 2),
      left: onClickEvent.clientX - (SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS / 2)

    }

    setSala(addTables([newTable]));
  }

  useEffect(() => {
    console.log(sala)
  }, [sala])

  useEffect(() => {
    console.log("AfterTableDropSala", salaAfterTableDrop)
  }, [salaAfterTableDrop])

  const [rotateInfo, setRotateInfo] = useState<RotateInfo>(
    {
      active: false,
      angle: 0,
      rotation: 0,
      startAngle: 0,
      center: {
        x: 0,
        y: 0
      },
      R2D: 180 / Math.PI
    });

  function getRotateInfoCopy() {
    return JSON.parse(JSON.stringify(rotateInfo)) as RotateInfo;
  }

  function handleOnMouseDown(onMouseDownEvent: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {
    console.log("mouseDown")
    onMouseDownEvent.preventDefault();
    var bb = onMouseDownEvent.currentTarget.getBoundingClientRect(),
      t = bb.top,
      l = bb.left,
      h = bb.height,
      w = bb.width,
      x,
      y;

    var rotateInfoCopy = getRotateInfoCopy();

    rotateInfoCopy.center = {
      x: l + w / 2,
      y: t + h / 2
    };

    x = onMouseDownEvent.clientX - rotateInfoCopy.center.x;
    y = onMouseDownEvent.clientY - rotateInfoCopy.center.y;
    rotateInfoCopy.startAngle = rotateInfoCopy.R2D * Math.atan2(y, x);
    rotateInfoCopy.active = true;
    setRotateInfo(rotateInfoCopy);
  }

  function handleOnMouseMove(onMouseMoveEvent: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {
    console.log("mouseMove")
    if (rotateInfo.active == true) {
      onMouseMoveEvent.preventDefault();

      //rotate function part

      var x = onMouseMoveEvent.clientX - rotateInfo.center.x,
        y = onMouseMoveEvent.clientY - rotateInfo.center.y,
        d = rotateInfo.R2D * Math.atan2(y, x);

      rotateInfo.rotation = d - rotateInfo.startAngle;

      onMouseMoveEvent.currentTarget.style.transform = "rotate(" + (rotateInfo.angle + rotateInfo.rotation) + "deg)";

    }
  }

  function handleOnMouseUp(onMouseUpEvent: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {
    console.log("mouseUp")

    onMouseUpEvent.preventDefault();

    //stop rotation
    var rotateInfoCopy = getRotateInfoCopy();
    rotateInfoCopy.angle += rotateInfoCopy.rotation;
    rotateInfoCopy.active = false;
    setRotateInfo(rotateInfoCopy)
  }

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
          functionOnClick={isDeleteTableModeOn ? onClickWhileInDeleteTableMode : onClick}
        />)
      }

      <div
        onMouseDown={e => handleOnMouseDown(e)}
        onMouseMove={e => handleOnMouseMove(e)}
        onMouseUp={e => handleOnMouseUp(e)}
        className={styles.rotate}
      >Rotate</div>

      <button
        className={isDeleteTableModeOn ? styles.deleteTableModeOn : styles.deleteTableModeOff}
        onClick={() => setIsDeleteTableModeOn(!isDeleteTableModeOn)}
      >Delete table {isDeleteTableModeOn ? "on" : "off"}</button>
      <button onClick={() => router.push("/")}>Back</button>

    </AppearingButton>

  )
}
