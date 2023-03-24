require("dotenv").config();
const fs = require("fs");
const { Client, AccountId, PrivateKey, ContractFunctionParameters, ContractExecuteTransaction, ContractCreateFlow, Hbar, ContractCallQuery } = require("@hashgraph/sdk");
var Web3 = require("web3");
var web3 = new Web3();

let productContractJson = require("./build/contracts/ProductContract.json");
let abi = productContractJson.abi;
const bytecode = fs.readFileSync("./bin/contracts_ProductContract_sol_ProductContract.bin");

// Get operator from .env file
const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY);
const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);

const client = Client.forTestnet().setOperator(operatorId, operatorKey);

async function main() {
    const contractId = await deployContract();
    await addProduct(contractId);
    await getProductById(contractId);
    await getAllProducts(contractId);
    await getProductCounts(contractId);
    await changeOwner(contractId);
}

async function deployContract() {
    console.log(`----------------- DeployContract START ----------------`);
    const contractCreate = new ContractCreateFlow()
        .setGas(10000000)
        .setBytecode(bytecode);
    //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await contractCreate.execute(client);
    //Get the receipt of the file create transaction
    const fileReceipt = await submitTx.getReceipt(client);
    // console.log(fileReceipt)
    console.log('----------------- TransactionReceipt Received');
    //Get the file ID from the receipt
    const contractId = fileReceipt.contractId;
    //Log the file ID
    console.log("The smart contract byte code file ID is " + contractId)
    console.log(`----------------- DeployContract END ----------------`);
    return contractId;
}

async function addProduct(contractId) {
    console.log('---------------- AddProduct START -----------------')
    console.log(`contractId = ${contractId}`)
    const contractExecTx = new ContractExecuteTransaction()
        //Set the contract ID to return the request for     
        .setContractId(contractId)
        //Set the gas for the query   
        .setGas(10000000)
        //Set the contract function to call     
        .setFunction("addProduct", new ContractFunctionParameters().addString("P101").addString("Mouse").addString("Black").addString("abid"));
    const submitExecTx = await contractExecTx.execute(client);
    //Get the receipt of the transaction
    const transactionReceipt = await submitExecTx.getReceipt(client);
    //Confirm the transaction was executed successfully 
    console.log("The transaction status is " + transactionReceipt.status.toString());
    console.log('---------------- AddProduct END -----------------')
}

async function getProductById(contractId) {
    console.log('---------------- getProductById START -----------------')
    console.log(`contractId = ${contractId}`)

    // query the contract    
    const contractCall = await new ContractCallQuery()
        .setContractId(contractId)
        .setFunction("getProductById", new ContractFunctionParameters().addString("P101"))
        .setQueryPayment(new Hbar(2))
        .setGas(100000)
        .execute(client);

    // let productDetails = contractCall.bytes;
    // console.log(productDetails.toString());
    let results = decodeFunctionResult('getProductById', contractCall.bytes);
    console.log(results);
    console.log('---------------- getProductById END -----------------')
}

async function getAllProducts(contractId) {
    console.log('---------------- getAllProducts START -----------------')
    console.log(`contractId = ${contractId}`)
    const functionCallAsUint8Array = encodeFunctionCall("getAllProducts", []);
    // query the contract    
    const contractCall = await new ContractCallQuery()
        .setContractId(contractId)
        .setFunctionParameters(functionCallAsUint8Array)
        .setQueryPayment(new Hbar(2))
        .setGas(100000)
        .execute(client);
    let results = decodeFunctionResult('getAllProducts', contractCall.bytes);
    console.log(results);
    console.log('---------------- getAllProducts END -----------------')
}

async function getProductCounts(contractId) {
    console.log('---------------- getProductCounts START -----------------')
    console.log(`contractId = ${contractId}`)

    // query the contract    
    const contractCall = await new ContractCallQuery()
        .setContractId(contractId)
        .setFunction("getProductCounts")
        .setQueryPayment(new Hbar(2))
        .setGas(100000)
        .execute(client);

    let productCount = contractCall.getUint256(0);
    console.log(productCount.toString());
    console.log('---------------- getProductCounts END -----------------')
}

async function changeOwner(contractId) {
    console.log('---------------- ChangeOwner START -----------------')
    console.log(`contractId = ${contractId}`)
    const contractExecTx = new ContractExecuteTransaction()
        //Set the contract ID to return the request for     
        .setContractId(contractId)
        //Set the gas for the query   
        .setGas(10000000)
        //Set the contract function to call     
        .setFunction("changeOwner", new ContractFunctionParameters().addString("P101").addString("Md Abid Khan"));
    const submitExecTx = await contractExecTx.execute(client);
    //Get the receipt of the transaction
    const transactionReceipt = await submitExecTx.getReceipt(client);
    //Confirm the transaction was executed successfully 
    console.log("The transaction status is " + transactionReceipt.status.toString());
    console.log('---------------- ChangeOwner END -----------------')
}

function encodeFunctionCall(functionName, parameters) {
    const functionAbi = abi.find(func => (func.name === functionName && func.type === "function"));
    const encodedParametersHex = web3.eth.abi.encodeFunctionCall(functionAbi, parameters).slice(2);
    return Buffer.from(encodedParametersHex, 'hex');
}

function decodeFunctionResult(functionName, resultAsBytes) {
    const functionAbi = abi.find(func => func.name === functionName);
    const functionParameters = functionAbi.outputs;
    const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'));
    const result = web3.eth.abi.decodeParameters(functionParameters, resultHex);
    return result;
}

main()