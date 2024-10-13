// 20241007 testing
import { aptosClient, isSendableNetwork } from "../utils";
import { Layout, Row, Col, Button, Card, Space, Spin, List, Checkbox, Input, Form, type FormProps } from "antd";
import {
  Account,
  AccountAddress,
  AccountAuthenticator,
  AnyRawTransaction,
  Ed25519Account,
  parseTypeTag,
  U64,
} from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { LabelValueGrid } from "./LabelValueGrid";

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
const TRANSFER_SCRIPT =
  "0xa11ceb0b0600000006010002030206040802050a10071a1d0837200000000103010100000204060c060c05030001090003060c05030d6170746f735f6163636f756e740e7472616e736665725f636f696e73000000000000000000000000000000000000000000000000000000000000000101000001050b010b020b03380002";

export function MultiAgent() {
  //const { toast } = useToast();
  const { connected, account, network, signTransaction, submitTransaction } =
    useWallet();
  const [secondarySignerAccount, setSecondarySignerAccount] =
    useState<Ed25519Account>();
  const [transactionToSubmit, setTransactionToSubmit] =
    useState<AnyRawTransaction | null>(null);
  const [senderAuthenticator, setSenderAuthenticator] =
    useState<AccountAuthenticator>();
  const [secondarySignerAuthenticator, setSecondarySignerAuthenticator] =
    useState<AccountAuthenticator>();
  let sendable = isSendableNetwork(connected, network?.name);

  // function
  const generateTransaction = async (): Promise<AnyRawTransaction> => {
    if (!account) {
      throw new Error("no account");
    }
    if (!network) {
      throw new Error("no network");
    }

    // create new account by Account.generate()
    const secondarySigner = Account.generate();
    // TODO: support custom network
    await aptosClient(network).fundAccount({
      accountAddress: secondarySigner.accountAddress.toString(),
      amount: 100_000_000,
      options: { waitForIndexer: false }
    });

    setSecondarySignerAccount(secondarySigner);
    
    // SecondarySignerAccoun will pay the coin to first signer
    const transactionToSign = await aptosClient(
      network,
    ).transaction.build.multiAgent({
      sender: account.address,
      secondarySignerAddresses: [secondarySigner.accountAddress],
      data: {
        bytecode: TRANSFER_SCRIPT,
        typeArguments: [parseTypeTag(APTOS_COIN)],
        functionArguments: [AccountAddress.fromString(account.address), new U64(1234)],
      },
    });
    return transactionToSign;
  };

  // user 1
  const onSenderSignTransaction = async () => {
    console.log("in first transaction");

    // will go to function "generateTransaction"
    const transaction = await generateTransaction();
    console.log(transaction);

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

  const onSecondarySignerSignTransaction = async () => {
    console.log("in secondary transaction");
    if (!transactionToSubmit) {
      throw new Error("No Transaction to sign");
    }
    if (!secondarySignerAccount) {
      throw new Error("No secondarySignerAccount");
    }
    try {
      const authenticator = aptosClient(
        network,
      ).sign({
        signer: secondarySignerAccount ,
        transaction: transactionToSubmit
      }) ;
      setSecondarySignerAuthenticator(authenticator);
      console.log(authenticator);
    } catch (error) {
      console.error(error);
    }
  };
  const onSubmitTransaction = async () => {
    console.log("in submit transaction");
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
      const response = await submitTransaction({
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
      <div>
        <div>Multi Agent Transaction Flow 2</div>
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-4">
          <Button onClick={onSenderSignTransaction} disabled={!sendable}>
            Sign as sender
          </Button>
          <Button
            onClick={onSecondarySignerSignTransaction}
            disabled={!sendable || !senderAuthenticator}
          >
            Sign as secondary signer
          </Button>
          <Button
            onClick={onSubmitTransaction}
            disabled={!sendable || !secondarySignerAuthenticator}
          >
            Submit transaction
          </Button>
        </div>
        {secondarySignerAccount && senderAuthenticator && (
          <div className="flex flex-col gap-6">
            <h4 className="text-lg font-medium">Secondary Signer details</h4>
            <LabelValueGrid
              items={[
                {
                  label: "Private Key",
                  value: secondarySignerAccount.privateKey.toString(),
                },
                {
                  label: "Public Key",
                  value: secondarySignerAccount.publicKey.toString(),
                },
                {
                  label: "Address",
                  value: secondarySignerAccount.accountAddress.toString(),
                },
              ]}
            />
          </div>
        )}
      </div>
    </Card>
  );
}