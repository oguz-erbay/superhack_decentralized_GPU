// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract GPU is ERC1155, Ownable, ERC1155Supply {
    constructor(address initialOwner)
        ERC1155("https://scarlet-secondary-cardinal-153.mypinata.cloud/ipfs/QmW6pMb97e7kzVYoQt6mHahnwcyJBZSaPyMfm8y5LMniF4?pinataGatewayToken=ZY1ezWKkLNrcOey0ASZ-5vVNIAycdZsQOYrYDS3J7U6rKHtbjxXQEL2-Q4c88CGf")
        Ownable(initialOwner)
    {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address account, uint256 id, uint256 amount, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}