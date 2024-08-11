// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC1155, Ownable {

    uint256 public constant TOKEN_ID = 1;
    uint256 public constant INITIAL_SUPPLY = 10;
    uint256 public constant MINT_FEE = 0.001 ether;

    constructor() ERC1155("https://scarlet-secondary-cardinal-153.mypinata.cloud/ipfs/QmW6pMb97e7kzVYoQt6mHahnwcyJBZSaPyMfm8y5LMniF4?pinataGatewayToken=ZY1ezWKkLNrcOey0ASZ-5vVNIAycdZsQOYrYDS3J7U6rKHtbjxXQEL2-Q4c88CGf") {
        _mint(msg.sender, TOKEN_ID, INITIAL_SUPPLY, "");
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data) public payable {
        require(msg.value == MINT_FEE, "Incorrect minting fee");
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function checkOwnership(address account, uint256 id) public view returns (bool) {
        uint256 balance = balanceOf(account, id);
        return balance > 0;
    }
}
