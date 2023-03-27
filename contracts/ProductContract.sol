// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

contract ProductContract {
    struct Product {
        string id;
        string name;
        string color;
        string owner;
        uint8 status; //1-active,0-Inactive,
    }

    string[] ProductIdList;
    mapping(string => Product) public productMap;
    address public owner;
    Product[] product;

    constructor() {
        owner = msg.sender;
    }

    modifier isOwner(address _owner) {
        require(owner == _owner, "Not a owner");
        _;
    }

    function addProduct(
        string memory _id,
        string memory _name,
        string memory _color,
        string memory _owner
    ) public isOwner(msg.sender) {
        require(!isProductRegistered(_id));
        productMap[_id] = Product(_id, _name, _color, _owner, 1);
        ProductIdList.push(_id);
        product.push(productMap[_id]);
    }

    function getAllProducts() public view returns (Product[] memory) {
        return product;
    }

    function isProductRegistered(string memory _id) public view returns (bool) {
        if (productMap[_id].status != 0) {
            return true;
        } else {
            return false;
        }
    }

    function changeOwner(
        string memory _id,
        string memory _owner
    ) public returns (string memory) {
        require(isProductRegistered(_id));
        productMap[_id].owner = _owner;
        return "owner changed";
    }

    function getProductById(
        string memory productId
    ) public view returns (Product memory productDetails) {
        Product memory p = productMap[productId];
        return (p);
    }

    function getProductCounts() public view returns (uint256) {
        return ProductIdList.length;
    }
}
