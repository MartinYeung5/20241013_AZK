/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';

export const moduleAddress = "0x546db4d367eaae5232e5326cf56e054c33faccd2413eaa9d00e2c06628815952";

function GetAccount() {
    // using NODIT (20240810)
    // https://developer.nodit.io/reference/aptos_getaccount

    // State to store fetched data
    const [data, setData] = useState<any>(null);

    // Effect to fetch data when the component mounts
    useEffect(() => {
        fetchData();
    }, []); // Empty dependency array ensures the effect runs once on mount

    const options = {
        method: 'GET',
        headers: { accept: 'application/json', 'X-API-KEY': process.env.REACT_APP_API_KEY! }
    };

    // Function to fetch data
    let response0:any;
    const fetchData = async () => {
        try {
            // Make a GET request using the Fetch API
            response0 = await fetch('https://aptos-testnet.nodit.io/v1/accounts/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa', options)
                .then(response => response.json())
                .catch(err => console.error(err));

            //.then(response => console.log(response.authentication_key))
            // need to delete teh console.log, since it will affect the response0 result (will show undefinded)

            //console.log("response0 = " + JSON.stringify(response0));

            // will return
            // GetAccount.tsx:38 response99 = {"sequence_number":"0","authentication_key":"0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa"}
            setData(response0);

        } catch (error: any) {
            console.error('Error fetching data:', error.message);
        }
        finally {

        }
    };

    // Render the component
    return (
        <div>
            {data ? (
                // Display the fetched data
                <p>{JSON.stringify(data)}</p>
                // results:
                // {"sequence_number":"0","authentication_key":"0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa"}
            ) : (
                // Display a loading message or other UI while data is being fetched
                <p>Loading...</p>
            )}
        </div>
    );
}

export default GetAccount;