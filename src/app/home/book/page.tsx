'use client'

import styles from './page.module.css'
import { useState, useEffect, ChangeEvent, MouseEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getObjectDeepCopy, getTimeAsString, MAX_TAKE_AWAY_ORDER_TIME, convertHHMMStringTimeFormatToDateObject } from '@/lib/utils';
import { TableBooking } from '@/types/TableBooking';

export default function Order() {

  const router = useRouter();

  const searchParams = useSearchParams()

  console.log(searchParams.get('tableNumber'))

  const [prenotazione, setPrenotazione] = useState<TableBooking>({
    tableNumber: Number(searchParams.get('tableNumber')),
    time: null,
    name: "",
    numberOfPeoples: -1,
    note: ""
  })

  function handleNomeOrdinazioneChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {

    let prenotazioneCopy = getObjectDeepCopy(prenotazione) as TableBooking;
    prenotazioneCopy.name = onChangeEvent.target.value;

    setPrenotazione(prenotazioneCopy)

  }

  function handlePickUpTimeChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {

    if (!onChangeEvent.target.checkValidity()) {
      onChangeEvent.target.value = "";
      window.alert(`Please insert a time between ${getTimeAsString()} and ${MAX_TAKE_AWAY_ORDER_TIME}`)
      return;
    }

    let prenotazioneCopy = getObjectDeepCopy(prenotazione) as TableBooking;
    prenotazioneCopy.time = convertHHMMStringTimeFormatToDateObject(onChangeEvent.target.value);

    setPrenotazione(prenotazioneCopy)

  }

  function handleNumberOfPeopleChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {

    let prenotazioneCopy = getObjectDeepCopy(prenotazione) as TableBooking;
    prenotazioneCopy.numberOfPeoples = Number(onChangeEvent.target.value)
    setPrenotazione(prenotazioneCopy)

  }

  function handleNoteTextAreaChange(onChangeEvent: ChangeEvent<HTMLTextAreaElement>) {

    let prenotazioneCopy = getObjectDeepCopy(prenotazione) as TableBooking;
    prenotazioneCopy.note = onChangeEvent.target.value;
    setPrenotazione(prenotazioneCopy)

  }

  function checkPrenotazioneAndGetACopy() {

    let prenotazioneCopy = getObjectDeepCopy(prenotazione) as TableBooking;

    //name Check
    if (prenotazioneCopy.name == "") {
      console.log("name is null")
      return;
    }

    //time Check
    if (prenotazioneCopy.time == null) {
      console.log("time is null")
      return;
    }

    //numberOfPeoples Check
    if (prenotazioneCopy.numberOfPeoples <= 0) {
      console.log("numberOfPeoples is not valid")
      return;
    }

    return prenotazioneCopy;

  }

  function bookTable() {

    // check fields and get a Copy
    let prenotazioneCopy = checkPrenotazioneAndGetACopy();

    // if true  one or more mandatory fields are empty
    if (prenotazioneCopy == undefined)
      return;

    console.log("before booking the table", prenotazioneCopy)

    fetch("http://localhost:3000/home/book/api", {
      method: "POST",
      body: JSON.stringify(prenotazioneCopy),
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data) => {
        console.log("response", data)
        //router.push('/home');

      }); // Update the state with the fetched data

  }

  return (

    <div className={styles.outerDiv}>

      <div className={styles.orderTitleDiv}>
        <h1>TAVOLO {prenotazione.tableNumber}</h1>
      </div>

      <div className={styles.sectionDiv}>
        <h3 className={styles.thiPageH3}>Info</h3>
      </div>

      <hr className={styles.line} />

      <div className={styles.tableInfo}>

        <input
          type="text"
          placeholder='Nome Ordinazione'
          autoCorrect='off'
          value={prenotazione.name == null ? "" : prenotazione.name}
          onChange={(e) => handleNomeOrdinazioneChange(e)}
        />

        <div>
          <span>Prenotato per le ore: </span>
          <input
            type="time"
            value={prenotazione.time == null ? "" : getTimeAsString(prenotazione.time)}
            min={getTimeAsString()}
            max={MAX_TAKE_AWAY_ORDER_TIME}
            onChange={(e) => handlePickUpTimeChange(e)}
          />
        </div>

        <input
          type='number'
          placeholder='Numero di persone'
          min={1}
          onChange={e => handleNumberOfPeopleChange(e)}
        />

        <textarea
          value={prenotazione.note == null ? '' : prenotazione.note}
          onChange={e => handleNoteTextAreaChange(e)}
          placeholder='Note aggiuntive'
        />

      </div>

      <div className={styles.buttonsDiv}>

        <button onClick={bookTable}>Book</button>
        <button onClick={() => router.push("/home")}>Back</button>

      </div>

    </div>

  )
}
