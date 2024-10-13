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
} from "@aptos-labs/ts-sdk";
import { InputTransactionData, useWallet } from "@aptos-labs/wallet-adapter-react";

import TypewriterComponent from "typewriter-effect";

import { UserOutlined } from '@ant-design/icons';

import 'reactjs-popup/dist/index.css';

import ContractListByOther from './components/ContractListByOther';

// will use index
import GetAccount from './components/GetAccount';
import MultiSigFunction from './components/MultiSigFunction';
import MultiSigFunction1 from './components/MultiSigFunction1';

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
  // Default to devnet, but allow for overriding
  const APTOS_NETWORK: Network = Network.TESTNET;

  // Setup the client
  const config = new AptosConfig({ network: APTOS_NETWORK });
  const aptos = new Aptos(config);

  const { account, signAndSubmitTransaction } = useWallet();
  //const { account: owner1, signAndSubmitTransaction } = useWallet();
  // Generate 3 accounts that will be the owners of the multisig account.

  const owner1 = account;
  console.log("owner1 = " + owner1?.address);
  //console.log(JSON.stringify(owner1));
  // get publicKey
  const owner1PublicKey: any = owner1?.publicKey;
  console.log("publickey = " + owner1?.publicKey);
  const owner1Address: any = owner1?.address;
  // testing (20240815)
  // create new account (owner2)
  const owner2 = Account.generate();
  console.log("owner2 = " + owner2.accountAddress);
  const owner2Address: any = owner2?.accountAddress;
  // add fund to owner2
  //await aptos.fundAccount({
  //  accountAddress: owner2.accountAddress,
  //  amount: 100_000_000,
  //});
  // create new account (owner3)
  const owner3 = Account.generate();

  // Global var to hold the created multi sig account address
  let multisigAddress: string;

  // Generate an account that will recieve coin from a transfer transaction
  //const recipient = Account.generate();

  // Global var to hold the generated coin transfer transaction payload
  let transactionPayload: TransactionPayloadMultiSig;

  // Generate an account to add and then remove from the multi sig account
  //const owner4 = Account.generate();


  const test1 = async () => {

    // multisig function
    // 1. build
    if (owner1Address && owner2.accountAddress && owner1) {
      const transfer_amount = 1
      const transaction = await aptos.transaction.build.multiAgent(
        {
          //sender: ownerPublicKey,
          sender: owner1Address,
          secondarySignerAddresses: [owner2.accountAddress],
          //transaction,
          data: {
            // REPLACE WITH YOUR MULTI-AGENT FUNCTION HERE
            function: "0x1::aptos_account::transfer_coins",
            functionArguments: ["0x99891379eaa29093a9c517790c75c6859f9dd7780b01e608bc9585bfd374ecec", transfer_amount],
            typeArguments: ["0x1::aptos_coin::AptosCoin"],
          },
        },
      );

      console.log("transaction");
      console.log(transaction);

      // 3. Sign
    console.log("\n=== 3. Signing transaction ===\n");
    const aliceSenderAuthenticator = aptos.transaction.sign({
      signer: owner1Address,
      transaction,
    });
    //const bobSenderAuthenticator = aptos.transaction.sign({
    //  signer: owner2Address,
    //  transaction,
    //});
    console.log("aliceSenderAuthenticator");
    console.log(aliceSenderAuthenticator);
    //console.log(bobSenderAuthenticator);
    }

  }

  //test1();

  const test2 = async () => {
    console.log(
      "This example will create two accounts (Alice and Bob) and send a transaction transfering APT to Bob's account.",
    );
   
    // 0. Setup the client and test accounts
    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
   
    let alice = Account.generate();
    let bob = Account.generate();
    let carol = Account.generate();
   
    console.log("=== Addresses ===\n");
    console.log(`Alice's address is: ${alice.accountAddress}`);
    console.log(`Bob's address is: ${bob.accountAddress}`);
    console.log(`Carol's address is: ${carol.accountAddress}`);
   
    console.log("\n=== Funding accounts ===\n");
    await aptos.fundAccount({
      accountAddress: alice.accountAddress,
      amount: 100_000_000,
    });
    await aptos.fundAccount({
      accountAddress: bob.accountAddress,
      amount: 100_000_000,
    });
    await aptos.fundAccount({
      accountAddress: carol.accountAddress,
      amount: 100_000_000,
    });
    console.log("Done funding Alice, Bob, and Carol's accounts.");
   
    // 1. Build
    console.log("\n=== 1. Building the transaction ===\n");
    const transaction = await aptos.transaction.build.multiAgent({
      sender: alice.accountAddress,
      secondarySignerAddresses: [bob.accountAddress],
      data: {
        // REPLACE WITH YOUR MULTI-AGENT FUNCTION HERE
        function:
          "<REPLACE WITH YOUR MULTI AGENT MOVE ENTRY FUNCTION> (Syntax {address}::{module}::{function})",
        functionArguments: [],
      },
    });
    console.log("Transaction:", transaction);
   
    // 2. Simulate (Optional)
    console.log("\n === 2. Simulating Response (Optional) === \n");
    const [userTransactionResponse] = await aptos.transaction.simulate.multiAgent(
      {
        signerPublicKey: alice.publicKey,
        secondarySignersPublicKeys: [bob.publicKey],
        transaction,
      },
    );
    console.log(userTransactionResponse);
   
    // 3. Sign
    console.log("\n=== 3. Signing transaction ===\n");
    const aliceSenderAuthenticator = aptos.transaction.sign({
      signer: alice,
      transaction,
    });
    const bobSenderAuthenticator = aptos.transaction.sign({
      signer: bob,
      transaction,
    });
    console.log(aliceSenderAuthenticator);
    console.log(bobSenderAuthenticator);
   
    // 4. Submit
    console.log("\n=== 4. Submitting transaction ===\n");
    const committedTransaction = await aptos.transaction.submit.multiAgent({
      transaction,
      senderAuthenticator: aliceSenderAuthenticator,
      additionalSignersAuthenticators: [bobSenderAuthenticator],
    });
    console.log("Submitted transaction hash:", committedTransaction.hash);
   
    // 5. Wait for results
    console.log("\n=== 5. Waiting for result of transaction ===\n");
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash,
    });
    console.log(executedTransaction);
  }

  test2();



  // HELPER FUNCTIONS //

  const getNumberOfOwners = async (): Promise<void> => {
    const multisigAccountResource = await aptos.getAccountResource<{ owners: Array<string> }>({
      accountAddress: multisigAddress,
      resourceType: "0x1::multisig_account::MultisigAccount",
    });
    console.log("Number of Owners:", multisigAccountResource.owners.length);
  };

  const getSignatureThreshold = async (): Promise<void> => {
    const multisigAccountResource = await aptos.getAccountResource<{ num_signatures_required: number }>({
      accountAddress: multisigAddress,
      resourceType: "0x1::multisig_account::MultisigAccount",
    });
    console.log("Signature Threshold:", multisigAccountResource.num_signatures_required);
  };

  const fundOwnerAccounts = async () => {
    if (owner1?.address === undefined) return;
    await aptos.fundAccount({ accountAddress: owner1!.address, amount: 100_000_000 });
    await aptos.fundAccount({ accountAddress: owner2.accountAddress, amount: 100_000_000 });
    await aptos.fundAccount({ accountAddress: owner3.accountAddress, amount: 100_000_000 });
    console.log(`owner1: ${owner1!.address.toString()}`);
    console.log(`owner2: ${owner2.accountAddress.toString()}`);
    console.log(`owner3: ${owner3.accountAddress.toString()}`);
  };

  const settingUpMultiSigAccount = async () => {
    if (owner1?.address === undefined) return;

    const payload: InputViewFunctionData = {
      function: "0x1::multisig_account::get_next_multisig_account_address",
      functionArguments: [owner1!.address],
    };
    [multisigAddress] = await aptos.view<[string]>({ payload });

    let res = await signAndSubmitTransaction({
      data: {
        function: "0x1::multisig_account::create_with_owners",
        functionArguments: [
          [owner2.accountAddress.toString(), owner3.accountAddress.toString()],
          2,
          ["Testing"],
          ["SDK"],
        ],
      },
    })

    await aptos.waitForTransaction({ transactionHash: res.hash });

    console.log("Multisig Account Address:", multisigAddress);

  };

  const fundMultiSigAccount = async () => {
    console.log("Funding the multisig account...");
    // Testing: Fund the multisig account for transfers.
    await aptos.fundAccount({ accountAddress: multisigAddress, amount: 100_000_000 });
  };

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

  // The contract list is created by own
  const fetchList = async () => {
    if (!account) return [];
    try {
      const todoListResource = await aptos.getAccountResource(
        {
          accountAddress: account?.address,
          resourceType: `${moduleAddress}::ContractDatabase::Contracts`
        }
      );

      setAccountHasList(true);
      setContractDatabase(true);
      console.log("todoListResource =" + JSON.stringify(todoListResource));
      // contracts table handle
      //const tableHandle = (todoListResource as any).data.contract_saved.handle;
      const tableHandle = (todoListResource as any).contract_saved.handle;
      console.log("tableHandle [=] " + tableHandle);
      // contracts table counter
      const contractCounter = (todoListResource as any).contract_counter;
      //console.log(contractCounter);

      let contracts = [];
      let counter = 1;
      while (counter <= contractCounter) {
        const tableItem = {
          key_type: "u64",
          value_type: `${moduleAddress}::ContractDatabase::Contract`,
          key: `${counter}`,
        };
        const contract = await aptos.getTableItem<Task>({ handle: tableHandle, data: tableItem });
        contracts.push(contract);
        counter++;
      }
      // set tasks in local state
      console.log("contracts " + JSON.stringify(contracts));

      // put contracts to Tasks
      setTasks(contracts);
    } catch (e: any) {
      setAccountHasList(false);
    }
  };

  //create new contract list
  const addNewContract = async () => {
    if (!account) return [];
    setTransactionInProgress(true);

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::ContractDatabase::create_contract`,
        functionArguments: []
      }
    }
    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setAccountHasList(true);
    } catch (error: any) {
      setAccountHasList(false);
    } finally {
      setTransactionInProgress(false);
      window.location.reload();
      fetchList();
    }
  };

  //create new contract 
  const onTaskAdded = async () => {
    // check for connected account
    if (!account) return;
    setTransactionInProgress(true);
    // testing: newTask (other signer id)
    console.log("newTask " + JSON.stringify(newTask));

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::ContractDatabase::add_contract`,
        functionArguments: [newTask, hashData as string]
      }
    }

    // hold the latest contract.contract_id from our local state
    const latestId = tasks.length > 0 ? parseInt(tasks[tasks.length - 1].contract_id) + 1 : 1;

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });

      // clear input text
      setNewTask("");
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };


  // update_contract
  const onCheckboxChange = async (event: CheckboxChangeEvent, contractId: string) => {
    if (!account) return;
    if (!event.target.checked) return;
    setTransactionInProgress(true);

    const transaction: InputTransactionData = {
      data: {
        function: `${moduleAddress}::ContractDatabase::update_contract`,
        functionArguments: [contractId]
      }
    }

    try {
      // sign and submit transaction to chain
      const response = await signAndSubmitTransaction(transaction);
      // wait for transaction
      await aptos.waitForTransaction({ transactionHash: response.hash });

      setTasks((prevState) => {
        const newState = prevState.map((obj) => {
          // if contract_id equals the checked contractId, update completed property
          if (obj.contract_id === contractId) {
            return { ...obj, completed: true };
          }

          // otherwise return object as is
          return obj;
        });

        return newState;
      });
    } catch (error: any) {
      console.log("error", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [account?.address]);


  const main = async () => {
    //await fundOwnerAccounts();
    ///////////////////////////////////await settingUpMultiSigAccount();
    //await fundMultiSigAccount();

    //await createMultiSigTransferTransaction();
    //await rejectAndApprove(owner1, owner3, 1);
    //await executeMultiSigTransferTransaction();

    // should be 1_000_000
    //await checkBalance();

    //await createMultiSigTransferTransactionWithPayloadHash();
    //await rejectAndApprove(owner1, owner3, 2);
    //await executeMultiSigTransferTransactionWithPayloadHash();

    // should be 2_000_000
    //await checkBalance();

    //await createAddingAnOwnerToMultiSigAccountTransaction();
    //await rejectAndApprove(owner1, owner3, 3);
    //await executeAddingAnOwnerToMultiSigAccountTransaction();

    // should be 4
    //await getNumberOfOwners();

    //await createRemovingAnOwnerToMultiSigAccount();
    //await rejectAndApprove(owner1, owner3, 4);
    //await executeRemovingAnOwnerToMultiSigAccount();

    // should be 3
    //await getNumberOfOwners();

    //await createChangeSignatureThresholdTransaction();
    //await rejectAndApprove(owner1, owner3, 5);
    //await executeChangeSignatureThresholdTransaction();

    // The multisig account should now be 3-of-3.
    //await getSignatureThreshold();

    //console.log("Multisig setup and transactions complete.");

  };

  main();
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

          <div className="text-white font-bold py-36 text-center space-y-5">
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-5 font-extrabold">
              <h1>Aptos MY Verify</h1>
              <div className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600">
                <TypewriterComponent
                  options={{
                    strings: [
                      "Prevent altered or deleted",
                      "Verification with ZKP",
                      "AI Audit for your contract",
                      "Protect your benefit."
                    ],
                    autoStart: true,
                    loop: true,
                  }}
                />
              </div>
            </div>
            <div className="text-sm md:text-xl font-light text-zinc-400">
              Enjoy great protection with our applications
            </div>
            <div>

              <Button type="primary" style={{ height: "40px", backgroundColor: "#3f67ff" }}>
                Try it
              </Button>

            </div>
            <div className="text-zinc-400 text-xs md:text-sm font-normal">
              Whitelist will release soon !
            </div>


            <Spin spinning={transactionInProgress}>
              {!accountHasList && !contractDatabase ? (
                <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
                  <Col span={8} offset={8}>
                    <Button
                      disabled={!account}
                      block
                      onClick={addNewContract}
                      type="primary"
                      style={{ height: "40px", backgroundColor: "#3f67ff" }}
                    >
                      create contract database
                    </Button>
                  </Col>
                </Row>
              ) : (
                <div className="text-white">
                  <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
                    <Col span={8} offset={8}>
                      <Input.Group compact>
                        <Input
                          onChange={(event) => onWriteTask(event)}
                          style={{ width: "calc(100% - 60px)" }}
                          placeholder="enter expected contract signer's address"
                          size="large"
                          value={newTask}
                          prefix={<UserOutlined />} />

                        <Input
                          type="file"
                          placeholder="Upload Document"
                          //value={message}
                          onChange={(e) => {
                            if (e.target.files != null) {
                              if (e.target.files.length != 0) {
                                setFile(e.target.files[0]);
                              }
                            }

                          }}
                        />
                        <Button onClick={onTaskAdded} type="primary" style={{ height: "40px", backgroundColor: "#3f67ff" }}>
                          upload new contract
                        </Button>
                      </Input.Group>
                    </Col>
                    <Col span={16} offset={4} >
                      {tasks && (
                        <List
                          size="large"
                          bordered
                          dataSource={tasks}
                          renderItem={(task: Task) => (
                            <List.Item
                              actions={[
                                <div>
                                  {task.sign ? (
                                    <Checkbox defaultChecked={true} disabled />
                                  ) : (
                                    <Checkbox onChange={(event) => onCheckboxChange(event, task.contract_id)} />
                                  )}
                                </div>,
                              ]}
                            >
                              <div className="text-white">
                                <List.Item.Meta
                                  title=""
                                  description={
                                    <a
                                      href={`https://explorer.aptoslabs.com/account/${task.contract_signer}/`}
                                      target="_blank"
                                      className="text-white"
                                    >Expected Signer:{`${task.contract_signer.slice(0, 6)}...${task.contract_signer.slice(-5)}`}</a>
                                  }
                                />
                              </div>
                              <div className="relative w-32 mr-4">
                                <Input.Group compact>
                                  <Input
                                    type="file"
                                    placeholder="Upload Document"
                                    onChange={(e) => {
                                      if (e.target.files != null) {
                                        if (e.target.files.length != 0) {
                                          setFile(e.target.files[0]);
                                        }
                                      }
                                    }}
                                  />
                                  <Button type="primary" style={{ height: "40px", backgroundColor: "#3f67ff" }}>
                                    upload your contract
                                  </Button>
                                </Input.Group>
                              </div>
                              <div className="text-white">
                                <List.Item.Meta
                                  title=""
                                  description={
                                    <a
                                      href={`https://explorer.aptoslabs.com/account/${task.creator}/`}
                                      target="_blank"
                                      className="text-white"
                                    >
                                      My Contract:
                                      <br />
                                      {task.content}
                                      <br />
                                      {`${task.creator.slice(0, 6)}...${task.creator.slice(-5)}`}
                                      <br />
                                      {task.contract_id}
                                      <br />
                                      {JSON.stringify(task.sign)}
                                    </a>

                                  }
                                />
                              </div>
                            </List.Item>
                          )}
                        />
                      )}
                    </Col>
                  </Row>
                </div>
              )}
            </Spin>

            <ContractListByOther />

          </div>
        </div>
      </main>
    </>
  )
}

export default App;