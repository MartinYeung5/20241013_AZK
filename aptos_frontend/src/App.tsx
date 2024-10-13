/* eslint-disable no-console */

import { Layout, Row, Col, Button, Card, Space, Spin, List, Checkbox, Input, Form, type FormProps } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import React, { useEffect, useState } from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";

import { sha3_256 as sha3Hash } from "@noble/hashes/sha3";
import {
  Account,
  Aptos,
  AptosConfig,
  Network,
  NetworkToNetworkName,
  MoveString,
  generateTransactionPayload,
  generateRawTransaction,
  TransactionPayloadMultiSig,
  MultiSig,
  AccountAddress,
  InputViewFunctionData,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";

import TypewriterComponent from "typewriter-effect";

import { UserOutlined } from '@ant-design/icons';

import 'reactjs-popup/dist/index.css';

// 20240904
import { isSendableNetwork, aptosClient } from "./utils";

type Task = {
  creator: string;
  sign: boolean;
  content: string;
  contract_signer: string;
  contract_id: string;
};
//export const moduleAddress = "0x86adc9e2857e9ece1a99f4de87fb41e33591562ee1f80e4351404e47bd8bc778";
export const moduleAddress = "0x546db4d367eaae5232e5326cf56e054c33faccd2413eaa9d00e2c06628815952";


function App() {
  // 20240904
  const {
    connected,
    account,
    network,
    signAndSubmitTransaction,
    signMessageAndVerify,
    signMessage,
    signTransaction,
  } = useWallet();
  // Default to devnet, but allow for overriding
  const APTOS_NETWORK: Network = Network.TESTNET;

  // Setup the client
  const config = new AptosConfig({ network: APTOS_NETWORK });
  const aptos = new Aptos(config);

  const owner1 = account;
  //console.log("owner1 = " + owner1?.address);
  //console.log(JSON.stringify(owner1));
  // get publicKey
  const owner1PublicKey: any = owner1?.publicKey;
  //console.log("publickey = " + owner1?.publicKey);
  const owner1Address: any = owner1?.address;
  const owner2Address: any = "0x99891379eaa29093a9c517790c75c6859f9dd7780b01e608bc9585bfd374ecec";
  // testing (20240815)
  // create new account (owner2)

  //const owner2 = Account.generate();
  //console.log("owner2 = " + owner2.accountAddress);
  //const owner2Address: any = owner2?.accountAddress;

  // add fund to owner2
  //await aptos.fundAccount({
  //  accountAddress: owner2.accountAddress,
  //  amount: 100_000_000,
  //});
  // create new account (owner3)

  let finaltransaction: any;
  let finalsenderAuthenticator: any;
  let finaladditionalSignersAuthenticators: any;

  const test2 = async () => {
    console.log(
      "This example will create two accounts (Alice and Bob) and send a transaction transfering APT to Bob's account.",
    );

    if (owner1Address) {
      // 0. Setup the client and test accounts
      const config = new AptosConfig({ network: Network.TESTNET });
      const aptos = new Aptos(config);

      //let alice = Account.generate();
      //let bob = Account.generate();

      console.log("=== Addresses ===\n");
      //console.log(`Alice's address is: ${alice.accountAddress}`);
      //console.log(`Bob's address is: ${bob.accountAddress}`);

      console.log("\n=== Funding accounts ===\n");
      //await aptos.fundAccount({
      //  accountAddress: alice.accountAddress,
      //  amount: 100_000_000,
      //});
      
      //console.log("Done funding Bob accounts.");

      // 1. Build
      console.log("\n=== 1. Building the transaction ===\n");
      console.log("owner1 = " + owner1Address);

      //await aptos.fundAccount({accountAddress: owner1Address, amount: 100_000_000,});
      //let bob = Account.generate();
      let bobAccountAddress: any = "0x7001306d411a24cd2a43b9af7d77e88ae53c41b50126d1e86fe20a30892ba1f6";
      //await aptos.fundAccount({accountAddress: bob.accountAddress, amount: 100_000_000,});

      //await aptos.fundAccount({accountAddress: bob, amount: 100_000_000,});

      const privateKey = new Ed25519PrivateKey(process.env.REACT_APP_PRIVATE_KEY!);
      //const ownerAccount = Account.fromPrivateKey({privateKey});
      // need to add "any" to prevent error 

      //0x99891379eaa29093a9c517790c75c6859f9dd7780b01e608bc9585bfd374ecec
      const ownerAccount: any = Account.fromPrivateKey({ privateKey });
      console.log(ownerAccount.accountAddress);
      //const bobAccountAddress = bob.accountAddress;
      const ownerAccountAddress = "0x99891379eaa29093a9c517790c75c6859f9dd7780b01e608bc9585bfd374ecec";
      //const bobAccountAddress = bob;
      console.log("bob2 = " + bobAccountAddress);
      console.log(bobAccountAddress);

      const transfer_amount = 50;
      const transaction = await aptos.transaction.build.multiAgent({
        sender: ownerAccountAddress,
        //secondarySignerAddresses: [bob.accountAddress],
        secondarySignerAddresses: [bobAccountAddress],
        data: {
          // REPLACE WITH YOUR MULTI-AGENT FUNCTION HERE
          function: `${moduleAddress}::ContractDatabase::multi_signer`,
          functionArguments: [],
          //functionArguments: ["0x7001306d411a24cd2a43b9af7d77e88ae53c41b50126d1e86fe20a30892ba1f6", transfer_amount],
          //typeArguments: ["0x1::aptos_coin::AptosCoin"],
        },
      });
      console.log("Transaction:", transaction);

      // 3. Sign
      console.log("\n=== 3. Signing transaction ===\n");
      // signer is not use address , should use "Account"

      console.log("process.env.REACT_APP_API_KEY" + process.env.REACT_APP_API_KEY);
      console.log("process.env.REACT_APP_PRIVATE_KEY" + process.env.REACT_APP_PRIVATE_KEY);

      const aliceSenderAuthenticator = aptos.transaction.sign({
        signer: ownerAccount,
        transaction,
      });
      //let user to sign
      /*
      const bobSenderAuthenticator = aptos.transaction.sign({
        signer: bob,
        transaction,
      });
      */
      console.log(aliceSenderAuthenticator);
      //console.log(bobSenderAuthenticator);

      // collect const value
      finaltransaction = transaction;
      finalsenderAuthenticator = aliceSenderAuthenticator;
      //finaladditionalSignersAuthenticators = ;

    }
  }
  
  let bobSenderAuthenticator:any;
  // only let user to sign in wallet
  const onSignMessage = async () => {
    const payload = {
      message: "Hello from Aptos Wallet Adapter",
      nonce: Math.random().toString(16),
    };
    //SignMessageResponse
    const response = await signMessage(payload);
    bobSenderAuthenticator = response;
    console.log(response);
  };

  // only let user to sign and submit new transaction in wallet
  const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
  const onSignAndSubmitTransaction = async () => {
    if (!account) return;
    const transaction: InputTransactionData = {
      data: {
        function: "0x1::coin::transfer",
        typeArguments: [APTOS_COIN],
        functionArguments: [account.address, 1], // 1 is in Octas
      },
    };
    try {
      // any type ?
      const response = await signAndSubmitTransaction(transaction);
      await aptosClient(network).waitForTransaction({
        transactionHash: response.hash,
      });
      console.log(response);

    } catch (error) {
      console.error(error);
    }
  };

  //
  const onSignMessageAndVerify = async () => {
    const payload = {
      message: "Hello from Aptos Wallet Adapter",
      nonce: Math.random().toString(16),
    };
    // boolean
    const response = await signMessageAndVerify(payload);
    console.log(response);
  };


  // Legacy typescript sdk support
  const onSignTransaction = async () => {
    try {
      const payload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [account?.address, 1], // 1 is in Octas
      };
      // AccountAuthenticator
      const response = await signTransaction(payload);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  const onSignTransactionV2 = async () => {
    if (!account) return;

    try {
      const transactionToSign = await aptosClient(
        network,
      ).transaction.build.simple({
        sender: account.address,
        data: {
          function: "0x1::coin::transfer",
          typeArguments: [APTOS_COIN],
          functionArguments: [account.address, 1], // 1 is in Octas
        },
      });
      // AccountAuthenticator
      const response = await signTransaction(transactionToSign);
      bobSenderAuthenticator = response;
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }

  const signAndSubmit = async () => {

    const transaction = finaltransaction;
    
    // need specific user to sign (get "AccountAuthenticator")
    /*if (owner1 != null) {
      bobSenderAuthenticator = aptos.transaction.sign({
        signer: owner1,
        transaction,
      });
    }
    */
    finaladditionalSignersAuthenticators = bobSenderAuthenticator;
    // 4. Submit
    console.log("\n=== 4. Submitting transaction ===\n");

    const committedTransaction = await aptos.transaction.submit.multiAgent({
      transaction,
      senderAuthenticator: finalsenderAuthenticator,
      additionalSignersAuthenticators: [finaladditionalSignersAuthenticators],
    });
    console.log("Submitted transaction hash:", committedTransaction.hash);

    // 5. Wait for results
    console.log("\n=== 5. Waiting for result of transaction ===\n");
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash,
    });
    console.log(executedTransaction);

  }

  


  // HELPER FUNCTIONS //

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [accountHasList, setAccountHasList] = useState<boolean>(false);
  const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
  const [contractDatabase, setContractDatabase] = useState<boolean>(false);

  var hash = require('object-hash');
  const [file, setFile] = useState<File | null>(null);
  const hashData = hash.MD5(file);

  const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewTask(value);
  };

  useEffect(() => {
    //fetchList();
    test2();
  }, [owner1Address != undefined]);

  return (
    <>
      <main className="h-full bg-[#000000] overflow-auto">
        <div className="mx-auto max-w-screen-xl h-full w-full">
          <nav className="p-4 bg-transparent flex items-center justify-between">

            <div className="relative h-8 w-8 mr-4">
              <Button className="rounded-full" >
                Get Start
              </Button>
            </div>

            <div className="flex items-center gap-x-2">
              <WalletSelector />
            </div>

          </nav>

          <div>
            user sign (0x7001306d411a24cd2a43b9af7d77e88ae53c41b50126d1e86fe20a30892ba1f6)
            <Button
              onClick={signAndSubmit}
              type="primary"
              style={{ height: "40px", backgroundColor: "#3f67ff" }}
            >
              submit
            </Button>

            <Button
              onClick={onSignMessage}
              type="primary"
              style={{ height: "40px", backgroundColor: "#3f67ff" }}
            >
              submit2
            </Button>
           
            <Button
              onClick={onSignAndSubmitTransaction}
              type="primary"
              style={{ height: "40px", backgroundColor: "#3f67ff" }}
            >
              submit3
            </Button>

            <Button
              onClick={onSignMessageAndVerify}
              type="primary"
              style={{ height: "40px", backgroundColor: "#3f67ff" }}
            >
              submit4
            </Button>

            <Button
              onClick={onSignTransaction}
              type="primary"
              style={{ height: "40px", backgroundColor: "#3f67ff" }}
            >
              submit5
            </Button>

            <Button
              onClick={onSignTransactionV2}
              type="primary"
              style={{ height: "40px", backgroundColor: "#3f67ff" }}
            >
              submit6
            </Button>

          </div>
        </div>
      </main>
    </>
  )
}

export default App;