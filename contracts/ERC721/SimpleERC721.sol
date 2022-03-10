// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract SimpleERC721 is ERC721Enumerable{

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_){
    }

    function mint(address to, uint256 id) public{
        _mint(to, id);
    }
}