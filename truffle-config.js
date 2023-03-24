module.exports = {
    networks: {
      development: {
        host: "127.0.0.1",
        port: 8545,
        network_id: "*", // Match any network id
      },
      // goerli: {
      //   provider: function() {
      //     return new HDWalletProvider(MNEMONIC, "https://goerli.infura.io/v3/aefc48107a904f31a961066e9540afbb")
      //   },
      //   network_id: 5,
      //   gas: 4000000      //make sure this gas allocation isn't over 4M, which is the max
      // }
    },
    // contracts_directory: "./src/contracts/",
    // contracts_build_directory: "./src/abis/",
    migrations_directory: "./migrations",
    compilers: {
      solc: {
        version: "^0.8.0",
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  };