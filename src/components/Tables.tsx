import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS } from '@/lib/utils';
import styles from './Tables.module.css'
import { DragEvent, MouseEvent, useEffect, useState } from 'react'
import { Table } from '@/types/Table';

interface TableProps {
    tableNumber: number,
    numberOfMergedTables: number,
    top: number,
    left: number,
    functionOnDrag: any,
    functionOnDragEnd: any,
    functionOnDrop: any,
    functionOnClick: any
}

export function Tables({ tableNumber, numberOfMergedTables, top, left, functionOnDrag, functionOnDragEnd, functionOnDrop, functionOnClick }: TableProps) {

    function getCurrentTable(event: DragEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) {
        return {
            tableNumber: tableNumber,
            numberOfMergedTables: numberOfMergedTables,
            top: event.clientY - (event.currentTarget.clientHeight / 2),
            left: event.clientX - (event.currentTarget.clientWidth / 2)
        } as Table;
    }

    function handleOnDrag(onDragEvent: DragEvent<HTMLDivElement>) {
        functionOnDrag(getCurrentTable(onDragEvent));
    }

    function handleOnDragEnd(onDragEvent: DragEvent<HTMLDivElement>) {

        var currentTable = getCurrentTable(onDragEvent);

        onDragEvent.currentTarget.style.top = currentTable.top + "px";
        onDragEvent.currentTarget.style.left = currentTable.left + "px";

        console.log("dragEnd", currentTable.tableNumber, currentTable.top, currentTable.left, onDragEvent.dataTransfer)

        functionOnDragEnd(currentTable);
    }

    function handleOnDragOver(onDragEvent: DragEvent<HTMLDivElement>) {
        // prevent default to allow drop
        onDragEvent.preventDefault();
        console.log(tableNumber)
    }

    function handleOnDrop(onDragEvent: DragEvent<HTMLDivElement>) {
        // prevent default action (open as link for some elements)
        onDragEvent.preventDefault();
        console.log("drop", tableNumber, onDragEvent.dataTransfer)
        functionOnDrop(getCurrentTable(onDragEvent));
    }

    function handleOnClick(onClickEvent: MouseEvent<HTMLDivElement>) {
        functionOnClick(getCurrentTable(onClickEvent));
    }

    return (
        <div
            className={numberOfMergedTables == 1 ? styles.singleTable : styles.mergedTable}
            style={
                {
                    width: SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS * numberOfMergedTables + 'px',
                    top: top + "px",
                    left: left + "px"
                }
            }
            draggable="true"
            onDrag={e => handleOnDrag(e)}
            onDragEnd={e => handleOnDragEnd(e)}
            onDragOver={(e) => handleOnDragOver(e)}
            onDrop={(e) => handleOnDrop(e)}
            onClick={(e) => handleOnClick(e)}
        >
            <span>Tavolo {tableNumber}</span>
        </div>
    )
}