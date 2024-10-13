/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const moduleAddress = "0x546db4d367eaae5232e5326cf56e054c33faccd2413eaa9d00e2c06628815952";

function GetAccountBalances() {
    // using NODIT (20241013)
    const { account } = useWallet();
    const currentAccountAddress = account?.address;

    async function fetchGraphQL(operationsDoc: any, operationName: any, variables: any) {
        const result = await fetch(
            `https://aptos-testnet.nodit.io/${process.env.REACT_APP_API_KEY!}/v1/graphql`,
            {
                method: "POST",
                body: JSON.stringify({
                    query: operationsDoc,
                    variables: variables,
                    operationName: operationName
                })
            }
        );
        console.log(result);
        return await result.json();
    }

    const operationsDoc = `
    query MyQuery {
      current_fungible_asset_balances(
        limit: 10
        offset: 0
        where: {owner_address: {_eq: ${currentAccountAddress}}}
      ) {
        owner_address
        amount
        storage_id
        last_transaction_version
        last_transaction_timestamp
        is_frozen
        metadata {
          asset_type
          creator_address
          decimals
          icon_uri
          name
          project_uri
          symbol
          token_standard
          maximum_v2
          supply_v2
        }
      }
    }
  `;
  console.log(operationsDoc);

    function fetchMyQuery() {
        return fetchGraphQL(
            operationsDoc,
            "MyQuery",
            {}
        );
    }

    // State to store fetched data
    const [data, setData] = useState<any>(null);

    async function startFetchMyQuery() {
        const { errors, data } = await fetchMyQuery();
        //setData(data);
        if (errors) {
            // handle those errors like a pro
            console.error(errors);
        }

        // do something great with this precious data
        console.log(data);
    }

    //startFetchMyQuery();

    

    // Effect to fetch data when the component mounts
    useEffect(() => {
        startFetchMyQuery();
    }, []); // Empty dependency array ensures the effect runs once on mount


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

export default GetAccountBalances;