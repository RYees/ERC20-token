// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./DappToken.sol";

contract DappTokenSale {
    address payable admin;
    DappToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);
    
    constructor (DappToken _tokenContract, uint256 _tokenPrice){
        admin = payable(msg.sender);
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }
    
    // multiply function
    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y)/ y == x);
    }

    // Buy Tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        // Keep track number of tokenSold
        require(msg.value == multiply(_numberOfTokens , tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender,_numberOfTokens);
    }
    
    // Ending Token DappTokenSale by admin
   function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        //selfdestruct(admin);
    }

}


