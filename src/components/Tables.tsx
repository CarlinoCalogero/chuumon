import { SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS } from '@/lib/utils';
import styles from './Tables.module.css'
import { DragEvent, MouseEvent, useEffect, useState } from 'react'
import { Table } from '@/types/Table';
import { RotateInfo } from '@/types/RotateInfo';

interface TableProps {
    tableNumber: number,
    numberOfMergedTables: number,
    top: number,
    left: number,
    rotate: number,
    isCanBeRotated: boolean,
    isResetTableRotation: boolean,
    functionOnDrag: any,
    functionOnDragEnd: any,
    functionOnDrop: any,
    functionOnClick: any,
    functionOnSaveRotation: any
}

export function Tables({ tableNumber, numberOfMergedTables, top, left, rotate, isCanBeRotated, isResetTableRotation, functionOnDrag, functionOnDragEnd, functionOnDrop, functionOnClick, functionOnSaveRotation }: TableProps) {

    function getCurrentTable(event: DragEvent<HTMLDivElement> | MouseEvent<HTMLDivElement> | MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {

        var currentTable: Table = {
            tableNumber: tableNumber,
            numberOfMergedTables: numberOfMergedTables,
            top: event.clientY - (event.currentTarget.clientHeight / 2),
            left: event.clientX - (event.currentTarget.clientWidth / 2),
            rotate: Number(event.currentTarget.style.rotate.replace("deg", ""))
        }

        return currentTable;
    }

    function handleOnDrag(onDragEvent: DragEvent<HTMLDivElement>) {
        functionOnDrag(getCurrentTable(onDragEvent));
    }

    function handleOnDragEnd(onDragEvent: DragEvent<HTMLDivElement>) {

        var currentTable = getCurrentTable(onDragEvent);

        onDragEvent.currentTarget.style.top = currentTable.top + "px";
        onDragEvent.currentTarget.style.left = currentTable.left + "px";

        functionOnDragEnd(currentTable);
    }

    function handleOnDragOver(onDragEvent: DragEvent<HTMLDivElement>) {
        // prevent default to allow drop
        onDragEvent.preventDefault();
    }

    function handleOnDrop(onDragEvent: DragEvent<HTMLDivElement>) {
        // prevent default action (open as link for some elements)
        onDragEvent.preventDefault();
        functionOnDrop(getCurrentTable(onDragEvent));
    }

    function handleOnClick(onClickEvent: MouseEvent<HTMLDivElement>) {
        functionOnClick(getCurrentTable(onClickEvent));
    }

    // rotation functions

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

            onMouseMoveEvent.currentTarget.style.rotate = (rotateInfo.angle + rotateInfo.rotation) + "deg";

        }
    }

    function handleOnMouseUp(onMouseUpEvent: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {
        console.log("mouseUp")

        onMouseUpEvent.preventDefault();

        //stop rotation
        var rotateInfoCopy = getRotateInfoCopy();
        rotateInfoCopy.angle += rotateInfoCopy.rotation;
        rotateInfoCopy.active = false;
        setRotateInfo(rotateInfoCopy);

        functionOnSaveRotation(getCurrentTable(onMouseUpEvent))
    }

    return (
        <div
            className={isResetTableRotation ? styles.resetRotate : (isCanBeRotated ? styles.rotate : (numberOfMergedTables == 1 ? styles.singleTable : styles.mergedTable))}
            style={
                {
                    width: SQUARE_TABLE_EDGE_DIMENSION_IN_PIXELS * numberOfMergedTables + 'px',
                    top: top + "px",
                    left: left + "px",
                    rotate: rotate + "deg"
                }
            }
            draggable="true"
            onDrag={e => handleOnDrag(e)}
            onDragEnd={e => handleOnDragEnd(e)}
            onDragOver={(e) => handleOnDragOver(e)}
            onDrop={(e) => handleOnDrop(e)}
            onClick={(e) => handleOnClick(e)}

            //needed for rotation
            onMouseDown={e => isCanBeRotated ? handleOnMouseDown(e) : console.log("no rotation 1")}
            onMouseMove={e => isCanBeRotated ? handleOnMouseMove(e) : console.log("no rotation 2")}
            onMouseUp={e => isCanBeRotated ? handleOnMouseUp(e) : console.log("no rotation 3")}
        >
            <span>Tavolo {tableNumber}</span>
        </div>
    )
}