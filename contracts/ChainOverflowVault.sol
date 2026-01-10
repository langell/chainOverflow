// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title ChainOverflowVault
 * @dev A vault for managing L402 payments and question bounties for ChainOverflow.
 * This version is UUPS upgradeable.
 */
contract ChainOverflowVault is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 public protocolFee;

    struct Bounty {
        uint256 amount;
        address asker;
        bool released;
    }

    // Mapping from questionId to Bounty
    mapping(string => Bounty) public bounties;

    event PaymentReceived(address indexed payer, string resourceId, uint256 amount);
    event BountyReleased(string indexed questionId, address indexed winner, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        protocolFee = 100000000000000; // 0.0001 ETH default
    }

    /**
     * @dev Process a payment for asking a question and setting a bounty.
     */
    function payForQuestion(string memory questionId) external payable {
        require(msg.value > 0, "Payment must be greater than 0");
        require(bounties[questionId].asker == address(0), "Question ID already exists");

        bounties[questionId] = Bounty({
            amount: msg.value,
            asker: msg.sender,
            released: false
        });

        emit PaymentReceived(msg.sender, questionId, msg.value);
    }

    /**
     * @dev Simple payment for other services (e.g., posting an answer fee).
     */
    function payFee(string memory resourceId) external payable {
        require(msg.value >= protocolFee, "Insufficient fee");
        emit PaymentReceived(msg.sender, resourceId, msg.value);
    }

    /**
     * @dev Release a bounty to the winning answerer.
     * Can be called by the owner or the original asker.
     */
    function releaseBounty(string memory questionId, address payable winner) external {
        Bounty storage bounty = bounties[questionId];
        require(bounty.amount > 0, "No bounty found");
        require(!bounty.released, "Bounty already released");
        require(msg.sender == owner() || msg.sender == bounty.asker, "Not authorized");

        bounty.released = true;
        uint256 amount = bounty.amount;
        
        (bool success, ) = winner.call{value: amount}("");
        require(success, "Transfer failed");

        emit BountyReleased(questionId, winner, amount);
    }

    /**
     * @dev Pay a reward from the general contract balance (e.g. protocol fees).
     */
    function payoutReward(address payable winner, uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance in vault");
        (bool success, ) = winner.call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Withdraw protocol fees.
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Update the minimum protocol fee.
     */
    function setProtocolFee(uint256 _newFee) external onlyOwner {
        protocolFee = _newFee;
    }

    /**
     * @dev Required by UUPSUpgradeable to authorize an upgrade.
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Function to receive ETH
    receive() external payable {}
}
