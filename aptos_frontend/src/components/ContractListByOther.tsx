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

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

type Task = {
    creator: string;
    sign: boolean;
    content: string;
    contract_signer: string;
    contract_id: string;
};

export const moduleAddress = "0x546db4d367eaae5232e5326cf56e054c33faccd2413eaa9d00e2c06628815952";

function ContractListByOther() {
    const [contractList, setContractList] = useState<Task[]>([]);
    const [contractCreatorAddress, setContractCreatorAddress] = useState<string>("");
    const [accountHasList, setAccountHasList] = useState<boolean>(false);
    const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false);
    const [contractDatabase, setContractDatabase] = useState<boolean>(false);

    const [file, setFile] = useState<File | null>(null);

    const APTOS_NETWORK: Network = Network.TESTNET;

    const onWriteTask = (event: React.ChangeEvent<HTMLInputElement>) => {
        // get the input value (contract creator)
        const value = event.target.value;

        // pass value to setContractCreatorAddress
        setContractCreatorAddress(value);
    };

    // Setup the client
    const config = new AptosConfig({ network: APTOS_NETWORK });
    const aptos = new Aptos(config);
    const { account, signAndSubmitTransaction } = useWallet();

    // The contract list is created by others
    const fetchList2 = async () => {
        if (!account) return [];
        try {
            const todoListResource2 = await aptos.getAccountResource(
                {
                    accountAddress: contractCreatorAddress,
                    resourceType: `${moduleAddress}::ContractDatabase::Contracts`
                }
            );

            setAccountHasList(true);
            setContractDatabase(true);
            console.log("todoListResource2 =" + JSON.stringify(todoListResource2));
            // contracts table handle
            const tableHandle = (todoListResource2 as any).contract_saved.handle;
            console.log("tableHandle2 [=] " + tableHandle);

            // contracts table counter
            const contractCounter = (todoListResource2 as any).contract_counter;
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
                if (contract.contract_signer == account.address) {
                    contracts.push(contract);
                }
                counter++;
            }
            // check each contract data
            console.log("contracts2 " + JSON.stringify(contracts));

            // put contracts to setContractList
            setContractList(contracts);
        } catch (e: any) {
            setAccountHasList(false);
        }
    };

    // update_contract
    const onCheckboxChange = async (event: CheckboxChangeEvent, contractId: string) => {
        if (!account) return;
        if (!event.target.checked) return;
        setTransactionInProgress(true);

        //checking
        console.log("contractId =" + contractId);
        console.log("account =" + account.address);
        const signer_address = account.address;

        const transaction: InputTransactionData = {
            data: {
                function: `${moduleAddress}::ContractDatabase::update_contract`,
                functionArguments: [contractId]
            }
        }

        try {
            // sign and submit transaction to chain
            const response = await signAndSubmitTransaction(transaction);
            // wait for transaction results
            await aptos.waitForTransaction({ transactionHash: response.hash });

            setContractList((prevState) => {
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

    // check contract validity
    const checkContractValidity = async (contractData: string) => {
        if (!account) return;

        try {
            var hash = require('object-hash');
            const hashData = hash.MD5(file);
            if (contractData == hashData) {
                alert("Contract Valid!");
            } else {
                alert("Wrong Contract!");
            }
        } catch (error: any) {
            console.log("error", error);
        } finally {
            // reset the value fo setFile
            setFile(null);
        }
    };

    // update_contract2
    const onCheckboxChange2 = async (event: CheckboxChangeEvent, creator: any, contract_signer: any, contractId: string) => {
        if (!account) return;
        if (!event.target.checked) return;
        setTransactionInProgress(true);

        //checking
        console.log("contractId =" + contractId);
        // contract_signer
        console.log("account =" + account.address);
        
        const transaction: InputTransactionData = {
            data: {
                function: `${moduleAddress}::ContractDatabase::update_contract_by_signer`,
                functionArguments: [creator, contract_signer, contractId]
            }
        }

        try {
            // sign and submit transaction to chain
            const response = await signAndSubmitTransaction(transaction);
            // wait for transaction results
            await aptos.waitForTransaction({ transactionHash: response.hash });

            setContractList((prevState) => {
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

    return (
        <>
            <main className="h-full bg-[#000000] overflow-auto">
                <div className="mx-auto max-w-screen-xl h-full w-full">
                    <div className="text-white font-bold py-36 text-center space-y-5">
                        <Spin spinning={transactionInProgress}>
                            <div className="text-white">
                                <Row gutter={[0, 32]} style={{ marginTop: "2rem" }}>
                                    <Col span={8} offset={8}>
                                        <Input.Group compact>
                                            <Input
                                                onChange={(event) => onWriteTask(event)}
                                                style={{ width: "calc(100% - 60px)" }}
                                                placeholder="enter contract creator's address"
                                                size="large"
                                                value={contractCreatorAddress}
                                                prefix={<UserOutlined />} />
                                            <Button onClick={fetchList2} type="primary" style={{ height: "40px", backgroundColor: "#3f67ff" }}>
                                                Check contract list
                                            </Button>
                                        </Input.Group>
                                    </Col>

                                </Row>

                                <Col span={16} offset={4} >
                                    {contractList && (
                                        <List
                                            size="large"
                                            bordered
                                            dataSource={contractList}
                                            renderItem={(task: Task) => (
                                                <List.Item
                                                    actions={[
                                                        <Col span={4}>
                                                            {JSON.stringify(task.sign) == "true" ? (
                                                                <Checkbox defaultChecked={true} disabled />
                                                            ) : (
                                                                <Checkbox onChange={(event) => onCheckboxChange2(event, task.creator, task.contract_signer, task.contract_id)} />
                                                            )}
                                                        </Col>,
                                                    ]}
                                                >
                                                    <Col span={4} className="text-white">
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
                                                    </Col>

                                                    <Col span={6} className="text-white">
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
                                                            <Button onClick={() => checkContractValidity(task.content)} type="primary" style={{ height: "40px", backgroundColor: "#3f67ff" }}>
                                                                upload your contract
                                                            </Button>
                                                        </Input.Group>
                                                    </Col>

                                                    <Col span={4}  className="text-white">
                                                        <List.Item.Meta
                                                            title=""
                                                            description={
                                                                <a
                                                                    href={`https://explorer.aptoslabs.com/account/${task.creator}/`}
                                                                    target="_blank"
                                                                    className="text-white"
                                                                >
                                                                    Contract Data:
                                                                    <br />
                                                                    {task.content}
                                                                    <br />
                                                                    {`${task.creator.slice(0, 6)}...${task.creator.slice(-5)}`}
                                                                    <br />
                                                                    {JSON.stringify(task.sign)}
                                                                </a>

                                                            }
                                                        />
                                                    </Col>
                                                </List.Item>
                                            )}
                                        />
                                    )}
                                </Col>
                            </div>
                        </Spin>
                    </div>
                </div>
            </main>
        </>
    )
}

export default ContractListByOther;