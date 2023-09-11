import { AppearButton } from '@/types/AppearButton';
import styles from './AppearingButton.module.css'
import { DragEvent, MouseEvent, useEffect, useState, ReactNode } from 'react'

interface AppearingButtonProps {
    children: ReactNode,
    buttonText: string,
    buttonPixelHeight: number,
    buttonPixelWidth: number,
    functionOnClick: any
}

export function AppearingButton({ children, buttonText, buttonPixelHeight, buttonPixelWidth, functionOnClick }: AppearingButtonProps) {

    const [addTableButton, setAddTableButton] = useState<AppearButton>(
        {
            appear: false,
            top: '0px',
            left: '0px'
        }
    );

    function getAppearButtonObjectCopy() {
        return JSON.parse(JSON.stringify(addTableButton)) as AppearButton;
    }

    function handleOnDivClick(onClickEvent: MouseEvent<HTMLDivElement>) {
        var target = onClickEvent.target as HTMLDivElement;
        if (target.className.includes("AppearingButton") == false) //check if click was on table
            return;
        var dummyAddTableButton = getAppearButtonObjectCopy();
        dummyAddTableButton.appear = !dummyAddTableButton.appear;
        if (dummyAddTableButton.appear) {
            dummyAddTableButton.top = (onClickEvent.clientY - (buttonPixelHeight / 2)) + "px";
            dummyAddTableButton.left = (onClickEvent.clientX - (buttonPixelWidth / 2)) + "px";
        }
        setAddTableButton(dummyAddTableButton);
    }

    return (
        <div
            className={styles.outerDiv}
            onClick={(e) => handleOnDivClick(e)}
        >

            {children}

            {
                addTableButton.appear &&
                <button
                    className={styles.appearingButton}
                    style={
                        {
                            top: addTableButton.top,
                            left: addTableButton.left,
                            position: 'absolute',
                            height: buttonPixelHeight + "px",
                            width: buttonPixelWidth + "px"
                        }
                    }
                    onClick={e => functionOnClick(e)}
                >
                    {buttonText}
                </button>
            }

        </div>
    )
}