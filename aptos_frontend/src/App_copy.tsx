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
import GetAccountBalances from './components/GetAccountBalances';

// will use index
import GetAccount from './components/GetAccount20241007';
import MultiSigFunction from './components/MultiSigFunction';
import MultiSigFunction1 from './components/MultiSigFunction1';

type Task = {
  creator: string;
  sign: boolean;
  content: string;
  contract_signer: string;
  contract_id: string;
};

export const moduleAddress = "0x546db4d367eaae5232e5326cf56e054c33faccd2413eaa9d00e2c06628815952";

function App() {
  const { 
    account,
    network,
    signAndSubmitTransaction 
  } = useWallet();
  // Default to devnet, but allow for overriding
  const APTOS_NETWORK: Network = Network.TESTNET;

  // Setup the client
  const config = new AptosConfig({ network: APTOS_NETWORK });
  const aptos = new Aptos(config);

  const owner1 = account;
  console.log("owner1 = " + owner1?.address);

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