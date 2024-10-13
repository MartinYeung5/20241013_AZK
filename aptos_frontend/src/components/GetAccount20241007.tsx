import { Aptos, AptosConfig, ClientConfig, Network } from "@aptos-labs/ts-sdk";

// testing, has bug
interface Args {
    nodeApiUrl: "https://api.testnet.aptoslabs.com";
    apiKey: "";
}

const aptosbuild: Args = {
    nodeApiUrl: "https://api.testnet.aptoslabs.com",
    apiKey: "",
}

const main = async () => {
    const clientConfig: ClientConfig = {
        API_KEY: ""
    };
    const config = new AptosConfig({
        fullnode: "https://api.testnet.aptoslabs.com",
        network: Network.TESTNET,
        clientConfig
    });
    const aptos = new Aptos(config);

    const response = await aptos.account.getAccountInfo({ accountAddress: "0x7001306d411a24cd2a43b9af7d77e88ae53c41b50126d1e86fe20a30892ba1f6" });

    console.log("response = " + response);
}


const main2 = async () => {
    const apiKey = "";
    const clientConfig: ClientConfig = {
        API_KEY: apiKey,
    };
    const config = new AptosConfig({ indexer: "https://api.testnet.aptoslabs.com", clientConfig });
    const aptos = new Aptos(config);

    const response = await aptos.staking.getNumberOfDelegatorsForAllPools();

    console.log(response);
}
main2();

function GetAccount() {
    //const results = main();
    //console.log("results = "+ results);
    // Render the component
    return (
        <div>
            GetAccount20241007
        </div>
    );
}


export default GetAccount;