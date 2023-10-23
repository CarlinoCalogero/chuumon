'use client'

import { User } from '@/types/User';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

export default function Login() {

  const router = useRouter();

  const [user, setUser] = useState<User>({
    username: '',
    password: '',
  });

  const [label, setLabel] = useState('');

  function login() {
    fetch("http://localhost:3000/api", {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data) => {
        if (data) {
          router.push('/home');
        } else {
          setLabel("Login failed");
        }
      }); // Update the state with the fetched data
  }

  function getUserObjectCopy() {
    return JSON.parse(JSON.stringify(user)) as User;
  }

  function handleUsernameChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    var userCopy = getUserObjectCopy();
    userCopy.username = onChangeEvent.target.value;
    setUser(userCopy);
  }

  function handlePasswordChange(onChangeEvent: ChangeEvent<HTMLInputElement>) {
    var userCopy = getUserObjectCopy();
    userCopy.password = onChangeEvent.target.value;
    setUser(userCopy);
  }

  useEffect(() => {
    console.log("runs one time only");

    fetch("http://localhost:3000/api", {
      method: "GET",
      headers: {
        "Content-Type": "application/json", // Set the request headers to indicate JSON format
      },
    })
      .then((res) => res.json()) // Parse the response data as JSON
      .then((data) => {
        if (data != '')
          router.push('/home');
      }); // Update the state with the fetched data

  }, [])

  return (
    <div>

      <input
        type='text'
        placeholder='Username'
        onChange={e => handleUsernameChange(e)}
      />

      <input
        type='password'
        placeholder='Password'
        onChange={e => handlePasswordChange(e)}
      />

      {label}

      <button onClick={login}>Login </button>
    </div>
  )
}