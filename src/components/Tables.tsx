import styles from './Tables.module.css'
import { DragEvent } from 'react'

interface TableProps {
    tableNumber: number,
    numberOfMergedTables: number,
    functionOnDrag: any,
    functionOnDrop: any
}

export function Tables({ tableNumber, numberOfMergedTables, functionOnDrag, functionOnDrop }: TableProps) {

    function handleOnDrag(onDragEvent: DragEvent<HTMLDivElement>) {
        functionOnDrag({
            tableNumber: tableNumber,
            numberOfMergedTables: numberOfMergedTables,
        });
    }

    function handleOnDragEnd(onDragEvent: DragEvent<HTMLDivElement>) {
        onDragEvent.currentTarget.style.top = (onDragEvent.clientY - (onDragEvent.currentTarget.clientHeight / 2)) + "px";
        onDragEvent.currentTarget.style.left = (onDragEvent.clientX - (onDragEvent.currentTarget.clientWidth / 2)) + "px";
    }

    function handleOnDragOver(onDragEvent: DragEvent<HTMLDivElement>) {
        // prevent default to allow drop
        onDragEvent.preventDefault();
    }

    function handleOnDrop(onDragEvent: DragEvent<HTMLDivElement>) {
        // prevent default action (open as link for some elements)
        onDragEvent.preventDefault();
        functionOnDrop({
            tableNumber: tableNumber,
            numberOfMergedTables: numberOfMergedTables,
        });
    }

    return (
        <div
            className={styles.outerDiv}
            style={{ width: 10 * numberOfMergedTables + 'rem' }}
            draggable="true"
            onDrag={e => handleOnDrag(e)}
            onDragEnd={e => handleOnDragEnd(e)}
            onDragOver={(e) => handleOnDragOver(e)}
            onDrop={(e) => handleOnDrop(e)}
        >
            <span>Tavolo {tableNumber}</span>
        </div>
    )
}