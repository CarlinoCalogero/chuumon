import { AppearButton } from '@/types/AppearButton';
import styles from './Popup.module.css'
import { DragEvent, MouseEvent, useEffect, useState, ReactNode } from 'react'
import { ButtonTextWithFunction } from '@/types/ButtonTextWithFunction';

interface PopupProps {

    buttons: ButtonTextWithFunction[]
    closePopupFunction: any

}

export function Popup({ buttons, closePopupFunction }: PopupProps) {

    return (
        <div className={styles.outerDiv} onClick={closePopupFunction}>

            <div className={styles.innerDiv} onClick={(e) => e.stopPropagation() /** prevents popup from closin if inner div is clicked */}>

                <div className={styles.buttonsDiv}>

                    {
                        buttons.map((button, i) => <button key={"popupbutton_" + i} onClick={button.onClickFunction}>{button.buttonText}</button>)
                    }

                    <button className={styles.closebutton} onClick={closePopupFunction}>Close</button>

                </div>

            </div>


        </div>
    )
}