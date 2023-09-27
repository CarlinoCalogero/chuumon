import { COPERTO_COSTA_EURO } from '@/lib/utils';
import styles from './OrderSnippet.module.css'
import { Order } from '@/types/Order';
import { ChangeEvent, useEffect, useState } from 'react';
import { OrderedItemsByCategoriesArray } from '@/types/OrderedItemsByCategoriesArray';
import { OrderedItem } from '@/types/OrderedItem';

interface OrderSnippetProps {
    order: Order
}

export function OrderSnippet({ order }: OrderSnippetProps) {

    const [orderCopy, setOrderCopy] = useState<Order>({
        numeroOrdineProgressivoGiornaliero: order.numeroOrdineProgressivoGiornaliero,
        dateAndTime: order.dateAndTime,
        orderInfo: {
            tableNumber: order.orderInfo.tableNumber,
            isFrittiPrimaDellaPizza: order.orderInfo.isFrittiPrimaDellaPizza,
            isSiDividonoLaPizza: order.orderInfo.isSiDividonoLaPizza,
            slicedIn: order.orderInfo.slicedIn,
            note: order.orderInfo.note,
            numeroBambini: order.orderInfo.numeroBambini,
            numeroAdulti: order.orderInfo.numeroAdulti
        },
        orderedItems: new Map(JSON.parse(JSON.stringify(Array.from(order.orderedItems)))),
    });

    useEffect(() => {

        console.log("miao",orderCopy.orderedItems)

    }, [orderCopy])

    const coperto = computeCoperto();
    const bill = computeBill();

    function computeBill() {

        var bill = 0;

        getArrayFromMap().forEach(categoryWithOrderedItems => {

            categoryWithOrderedItems.orderedItem.forEach(orderedItem => {

                var price = orderedItem.price;

                if (price != null)
                    bill = bill + price;

            });

        });

        return bill + coperto;

    }

    function computeCoperto() {

        var coperto = 0;

        if (order.orderInfo.numeroAdulti != null)
            coperto = coperto + (order.orderInfo.numeroAdulti * COPERTO_COSTA_EURO.adulti);

        if (order.orderInfo.numeroBambini != null)
            coperto = coperto + (order.orderInfo.numeroBambini * COPERTO_COSTA_EURO.bambini);

        return coperto;
    }

    function getArrayFromMap() {

        var array: OrderedItemsByCategoriesArray = [];

        for (let [key, value] of Object.entries(order.orderedItems)) {
            array.push({
                categoria: key,
                orderedItem: value
            })
        }

        return array;

    }

    function handleConsegnaOrdine(onChangeEvent: ChangeEvent<HTMLInputElement>, category: string, orderedItem: OrderedItem) {

        console.log(orderCopy.orderedItems.has(category))

    }

    return (
        <div className={styles.outerDiv}>

            <div className={styles.numeroComandaETavolo}>
                <span>Comanda n° {order.numeroOrdineProgressivoGiornaliero}</span>
                <span>Tavolo {order.orderInfo.tableNumber}</span>
            </div>

            <span>Il {new Date(order.dateAndTime).toLocaleDateString()} {new Date(order.dateAndTime).toLocaleTimeString()}</span>

            <hr className={styles.line} />

            <div className={styles.infoComanda}>
                <span>Fritti prima della pizza: {order.orderInfo.isFrittiPrimaDellaPizza ? "Si" : "No"}</span>
                <span>Si dividono la pizza: {order.orderInfo.isSiDividonoLaPizza ? "Si" : "No"}</span>
                {
                    order.orderInfo.isSiDividonoLaPizza == true &&
                    <span>Pizze tagliate in: {order.orderInfo.slicedIn}</span>
                }
                <span>Adulti: {order.orderInfo.numeroAdulti}</span>
                {
                    order.orderInfo.numeroBambini != null &&
                    <span>Bambini: {order.orderInfo.numeroBambini}</span>
                }
                {
                    order.orderInfo.note != null &&
                    <span>Note: {order.orderInfo.note}</span>
                }
            </div>

            <hr className={styles.line} />

            {

                getArrayFromMap().map((categoryWithOrderedItems, i) => <div key={"categoryWithOrderedItems_" + i}>

                    <h3>{categoryWithOrderedItems.categoria.toUpperCase()}</h3>

                    {
                        categoryWithOrderedItems.orderedItem.map((orderedItem, j) => <div key={"categoryWithOrderedItems_" + i + "_orderedItem_" + j}>

                            <div>

                                {
                                    orderedItem.slicedIn != null &&
                                    <span className={styles.noNewLineText}>Tagliata in {orderedItem.slicedIn}</span>
                                }

                                <input
                                    type="checkbox"
                                    id="consegnatoOrderedItem"
                                    checked={orderedItem.consegnato}
                                    onChange={e => handleConsegnaOrdine(e, categoryWithOrderedItems.categoria, orderedItem)}
                                />
                                <label htmlFor="consegnatoOrderedItem">Consegnato</label>
                            </div>

                            <div className={styles.orderedItemInnerDiv}>

                                <div className={styles.orderedItemInfo}>
                                    <b>{`${orderedItem.numberOf} ${orderedItem.unitOfMeasure?.toUpperCase()} - ${orderedItem.menuItem?.split("_")[0].toUpperCase()}`}</b>
                                    {
                                        orderedItem.ingredients.length != 0 &&
                                        <span>{orderedItem.ingredients.toString()}</span>
                                    }
                                    {
                                        orderedItem.intolleranzaA.length != 0 &&
                                        <span><b>Intolleranza:</b> {orderedItem.intolleranzaA.toString()}</span>
                                    }
                                </div>

                                <span className={styles.noNewLineText}>€ {orderedItem.price}</span>


                            </div>


                        </div>)
                    }

                </div>)

            }

            <hr className={styles.line} />

            <div className={styles.coperto}>
                <div className={styles.copertoHeader}>
                    <span>Coperto:</span>
                    <span>€{coperto}</span>
                </div>
                {
                    order.orderInfo.numeroAdulti != null &&
                    <div className={styles.copertoDetails}>
                        <span>Adulti</span>
                        <span>{COPERTO_COSTA_EURO.adulti}x€{order.orderInfo.numeroAdulti}</span>
                    </div>
                }
                {
                    order.orderInfo.numeroBambini != null &&
                    <div>
                        <span>Bambini</span>
                        <span>{COPERTO_COSTA_EURO.bambini}x€{order.orderInfo.numeroBambini}</span>
                    </div>
                }
            </div>

            <hr className={styles.line} />

            <div className={styles.bill}>
                <h2>Totale:</h2>
                <span>€ {bill}</span>
            </div>



        </div>
    )
}