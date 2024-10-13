/* eslint-disable no-console */

import { Layout, Row, Col, Button, Card, Space, Spin, List, Checkbox, Input, Form, type FormProps } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import React, { useEffect, useState } from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";
// need to put LabelValueGrid on the top order
import { LabelValueGrid } from "./components/LabelValueGrid";

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
  AccountAuthenticator,
  AnyRawTransaction,
  Ed25519Account,
} from "@aptos-labs/ts-sdk";

import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";

import TypewriterComponent from "typewriter-effect";

import { UserOutlined } from '@ant-design/icons';

import 'reactjs-popup/dist/index.css';

// 20240904
import { isSendableNetwork, aptosClient } from "./utils";
import { MultiAgent } from "./components/MultiAgent";

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
    submitTransaction,
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

  const APTOS_COIN = "0x1::aptos_coin::AptosCoin";

  const [secondarySignerAccount, setSecondarySignerAccount] =
    useState<Ed25519Account>();
  const [transactionToSubmit, setTransactionToSubmit] =
    useState<AnyRawTransaction | null>(null);

  const [senderAuthenticator, setSenderAuthenticator] =
    useState<AccountAuthenticator>();
  const [secondarySignerAuthenticator, setSecondarySignerAuthenticator] =
    useState<AccountAuthenticator>();

  let sendable = isSendableNetwork(connected, network?.name);

  // not used here
  const generateTransaction = async (): Promise<AnyRawTransaction> => {
    if (!account) {
      throw new Error("no account");
    }
    if (!network) {
      throw new Error("no network");
    }

    // secondarySigner will be auto generated
    //const secondarySigner = Account.generate();

    const privateKey = new Ed25519PrivateKey(process.env.REACT_APP_PRIVATE_KEY!);
    const secondarySigner: any = Account.fromPrivateKey({ privateKey });


    // TODO: support custom network
    /*
    await aptosClient(network).fundAccount({
      accountAddress: secondarySigner.accountAddress.toString(),
      amount: 100_000_000,
      options: { waitForIndexer: false }
    });
    */
    setSecondarySignerAccount(secondarySigner);

    const transactionToSign = await aptosClient(
      network,
    ).transaction.build.multiAgent({
      sender: account.address,
      secondarySignerAddresses: [secondarySigner.accountAddress],
      data: {
        function: "0x1::coin::transfer",
        typeArguments: [APTOS_COIN],
        functionArguments: [account.address, 1], // 1 is in Octas
      },
    });
    return transactionToSign;
  };

  // not used here
  const onSenderSignTransaction = async () => {
    const transaction = await generateTransaction();
    setTransactionToSubmit(transaction);
    try {
      const authenticator = await signTransaction(transaction);
      console.log("authenticator");
      console.log(authenticator);
      setSenderAuthenticator(authenticator);
    } catch (error) {
      console.error(error);
    }
  };

  // not used here
  const onSecondarySignerSignTransaction = async () => {
    if (!transactionToSubmit) {
      throw new Error("No Transaction to sign");
    }
    try {
      const authenticator = await signTransaction(transactionToSubmit);
      console.log("secondarySignerAuthenticator00");
      setSecondarySignerAuthenticator(authenticator);
      console.log(secondarySignerAuthenticator);
    } catch (error) {
      console.error(error);
    }
  };

  // not used here
  const onSubmitTransaction = async () => {
    try {
      if (!transactionToSubmit) {
        throw new Error("No Transaction to sign");
      }
      if (!senderAuthenticator) {
        throw new Error("No senderAuthenticator");
      }
      if (!secondarySignerAuthenticator) {
        throw new Error("No secondarySignerAuthenticator");
      }

      console.log("transactionToSubmit");
      console.log(transactionToSubmit);
      console.log("senderAuthenticator");
      console.log(senderAuthenticator);
      console.log("secondarySignerAuthenticator");
      console.log(secondarySignerAuthenticator);

      const response = await aptos.transaction.submit.multiAgent({
        transaction: transactionToSubmit,
        senderAuthenticator: senderAuthenticator,
        additionalSignersAuthenticators: [secondarySignerAuthenticator],
      });

      console.log(response);

    } catch (error) {

      console.error(error);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-x-2">
        <WalletSelector />
      </div>
      <MultiAgent />
    </Card>
  );
}

export default App;