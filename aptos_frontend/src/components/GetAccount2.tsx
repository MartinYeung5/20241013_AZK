/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function GetAccount2() {
    // using NODIT- Aptos NODE API (20240810)
    // https://developer.nodit.io/reference/aptos_getaccount
    //console.log ("API = "+ process.env.REACT_APP_API_KEY)

    let result:any;
    const [data, setData] = useState<void | null>(null);
    const options = {
        method: 'GET',
        headers: {accept: 'application/json', 'X-API-KEY': process.env.REACT_APP_API_KEY! }
      };
      
      fetch('https://aptos-testnet.nodit.io/v1/accounts/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .then(response => setData(response))
        .then(response => result = response)
        .then(response => console.log("result = " + data))
        .catch(err => console.error(err));
        
        

        useEffect(() => {
            console.log("dat2 = " + data);
            console.log("result2 = " + result);
        }, [data!=undefined]);
        // can not setData, can not assign new data to "result"

    return (
        <div>

        </div>
    );
}

export default GetAccount2;