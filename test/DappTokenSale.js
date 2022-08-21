var DappToken = artifacts.require("./DappToken.sol");
var DappTokenSale = artifacts.require("./DappTokenSale.sol");

contract('DappTokenSale', function(accounts){
    var tokenInstance;
    var tokenSaleInstance;
    var admin = accounts[0];
    var buyer = accounts[1];
    var tokenPrice = 1000000000000000; // in wei
    var tokensAvailable = 750000;
    var numberOfTokens;

    it('initializes the contract with the correct values', function() {
        return DappTokenSale.deployed().then(function(instance){
        tokenSaleInstance = instance;
        return tokenSaleInstance.address
    }).then(function(address){
        assert.notEqual(address, 0x0, 'has contract address');
        return tokenSaleInstance.tokenContract();
    }).then(function(address){
        assert.notEqual(address, 0x0, 'has token contract address');
        return tokenSaleInstance.tokenPrice();
    }).then(function(price){
        assert.equal(price, tokenPrice, 'token price is correct');
    });
  });

  it('facilitates token buying', function() {
    return DappTokenSale.deployed().then(function(instance) {
        // Grab token instance first
        tokenInstance = instance;
        return DappTokenSale.deployed();
    }).then(function(instance) {
       // Then grap token sale instance 
        tokenSaleInstance = instance;
        // Provision 75% of all tokens to the token sale from the totalSupply which currently belong to account 1 in the DappToken contract
        return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
    }).then(function(receipt) {
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice })
    }).then(function(receipt) {
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
        assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account the tokens are transferred from');
        assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the account the tokens are transferred to');
        return tokenSaleInstance.tokensSold();
    }).then(function(amount) {
        assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');
        return tokenInstance.balanceOf(buyer);
    }).then(function(balance) {
        assert.equal(balance.toNumber(), numberOfTokens);
        return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance) {
        assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);
        // Try to buy tokens different from the ether value
        return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1 })
    }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
        return tokenSaleInstance.buyTokens(10000, {from: buyer, value: numberOfTokens * tokenPrice })
    }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') <= 0, 'cannot purchase more tokens than available');
    });
  });




});