import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS } from '@/lib/utils';
import styles from './Tables.module.css'
import { DragEvent, MouseEvent } from 'react'

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

    function computeNewTopAndLeft(event: DragEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) {
        top = (event.clientY - (event.currentTarget.clientHeight / 2));
        left = (event.clientX - (event.currentTarget.clientWidth / 2));
    }

    function handleOnDrag(onDragEvent: DragEvent<HTMLDivElement>) {
        computeNewTopAndLeft(onDragEvent);
        functionOnDrag({
            tableNumber: tableNumber,
            numberOfMergedTables: numberOfMergedTables,
            top: top,
            left: left
        });
    }

    function handleOnDragEnd(onDragEvent: DragEvent<HTMLDivElement>) {
        computeNewTopAndLeft(onDragEvent);
        onDragEvent.currentTarget.style.top = top + "px";
        onDragEvent.currentTarget.style.left = left + "px";
        functionOnDragEnd({
            tableNumber: tableNumber,
            numberOfMergedTables: numberOfMergedTables,
            top: top,
            left: left
        });
    }

    function handleOnDragOver(onDragEvent: DragEvent<HTMLDivElement>) {
        // prevent default to allow drop
        onDragEvent.preventDefault();
    }

    function handleOnDrop(onDragEvent: DragEvent<HTMLDivElement>) {
        // prevent default action (open as link for some elements)
        onDragEvent.preventDefault();
        computeNewTopAndLeft(onDragEvent);
        functionOnDrop({
            tableNumber: tableNumber,
            numberOfMergedTables: numberOfMergedTables,
            top: top,
            left: left
        });
    }

    function handleOnClick(onClickEvent: MouseEvent<HTMLDivElement>) {
        computeNewTopAndLeft(onClickEvent);
        functionOnClick({
            tableNumber: tableNumber,
            numberOfMergedTables: numberOfMergedTables,
            top: top,
            left: left
        });
    }

    return (
        <div
            className={styles.outerDiv}
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