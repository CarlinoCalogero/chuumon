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
    isCanBeClicked: boolean,
    isCanBeDragged: boolean,
    isCanBeRotated: boolean,
    isResetTableRotation: boolean,
    functionOnDrag: null | any,
    functionOnDragEnd: null | any,
    functionOnDrop: null | any,
    functionOnClick: null | any,
    functionOnSaveRotation: null | any
}

export function Tables({ tableNumber, numberOfMergedTables, top, left, rotate, isCanBeClicked, isCanBeDragged, isCanBeRotated, isResetTableRotation, functionOnDrag, functionOnDragEnd, functionOnDrop, functionOnClick, functionOnSaveRotation }: TableProps) {

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

        if (functionOnDrag == null)
            return;

        functionOnDrag(getCurrentTable(onDragEvent));
    }

    function handleOnDragEnd(onDragEvent: DragEvent<HTMLDivElement>) {

        if (functionOnDragEnd == null)
            return;

        var currentTable = getCurrentTable(onDragEvent);

        onDragEvent.currentTarget.style.top = currentTable.top + "px";
        onDragEvent.currentTarget.style.left = currentTable.left + "px";

        functionOnDragEnd(currentTable);
    }

    function handleOnDragOver(onDragEvent: DragEvent<HTMLDivElement>) {

        if (!isCanBeDragged)
            return;

        // prevent default to allow drop
        onDragEvent.preventDefault();
    }

    function handleOnDrop(onDragEvent: DragEvent<HTMLDivElement>) {

        if (functionOnDrop == null)
            return;

        // prevent default action (open as link for some elements)
        onDragEvent.preventDefault();
        functionOnDrop(getCurrentTable(onDragEvent));
    }

    function handleOnClick(onClickEvent: MouseEvent<HTMLDivElement>) {

        if (functionOnClick == null)
            return;

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

        if (rotateInfo.active == true) {
            onMouseMoveEvent.preventDefault();

            //rotate function part

            var x = onMouseMoveEvent.clientX - rotateInfo.center.x,
                y = onMouseMoveEvent.clientY - rotateInfo.center.y,
                d = rotateInfo.R2D * Math.atan2(y, x);

            rotateInfo.rotation = d - rotateInfo.startAngle;

            onMouseMoveEvent.currentTarget.style.rotate = (rotateInfo.angle + rotateInfo.rotation) + "deg";

            // rotate text so it is always perpendicular to rotation sense
            var textSpan = onMouseMoveEvent.currentTarget.children[0] as HTMLElement;
            textSpan.style.rotate = -(rotateInfo.angle + rotateInfo.rotation) + "deg";

        }
    }

    function handleOnMouseUp(onMouseUpEvent: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {

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
            draggable={isCanBeDragged ? "true" : "false"}
            onDrag={e => isCanBeDragged && handleOnDrag(e)}
            onDragEnd={e => isCanBeDragged && handleOnDragEnd(e)}
            onDragOver={e => isCanBeDragged && handleOnDragOver(e)}
            onDrop={e => isCanBeDragged && handleOnDrop(e)}
            onClick={e => isCanBeClicked && handleOnClick(e)}

            //needed for rotation
            onMouseDown={e => isCanBeRotated && handleOnMouseDown(e)}
            onMouseMove={e => isCanBeRotated && handleOnMouseMove(e)}
            onMouseUp={e => isCanBeRotated && handleOnMouseUp(e)}
        >
            <span
                style={
                    {
                        rotate: -rotate + "deg"
                    }
                }
            >Tavolo {tableNumber}</span>
        </div>
    )
}