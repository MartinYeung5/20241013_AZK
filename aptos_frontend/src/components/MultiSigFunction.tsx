/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

// reference (NODIT)
// https://developer.nodit.io/discuss/66b338be68b37600258cbe9e
export const moduleAddress = "0x546db4d367eaae5232e5326cf56e054c33faccd2413eaa9d00e2c06628815952";

const { account, signAndSubmitTransaction } = useWallet();
const owner1 = account;
console.log("publickey = "+ owner1?.publicKey);

function MultiSigFunction() {
    // using NODIT (20240809)

    // need to get current user address
    const { account, signAndSubmitTransaction } = useWallet();
    const sender = account;

    const options = {
        method: 'POST',
        headers: {
          accept: 'application/x-bcs',
          'content-type': 'application/json',
          'X-API-KEY': process.env.REACT_APP_API_KEY!, 
        },
        body: JSON.stringify(
            {
            "type": "user_transaction",
            "sender": sender,
            "sequence_number": "10",
            "payload": {
              "type": "script_function_payload",
              "function": "0x1::aptos_account::transfer",
              "type_arguments": [],
              "arguments": ["0x7001306d411a24cd2a43b9af7d77e88ae53c41b50126d1e86fe20a30892ba1f6", "1000"]
            },
            "signature": {
              "type": "multi_ed25519_signature",
              "signatures": [
                {
                  //how can i get the public key?
                  "public_key": owner1?.publicKey,
                  "signature": owner1?.publicKey
                },
                {
                  "public_key": owner1?.publicKey,
                  "signature": "0xjkl..."
                }
              ],
              "bitmap": "3",
              "threshold": 2
            }
          }
        )
      };
      
      fetch('https://aptos-mainnet.nodit.io/v1/transactions', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));

    return (
        <>

        </>
    )
}

export default MultiSigFunction;