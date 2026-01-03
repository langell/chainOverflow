// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainOverflowVault
 * @dev A vault for managing L402 payments and question bounties for ChainOverflow.
 */
contract ChainOverflowVault {
    address public owner;
    uint256 public protocolFee = 100000000000000; // 0.0001 ETH default

    struct Bounty {
        uint256 amount;
        address asker;
        bool released;
    }

    // Mapping from questionId (could be a slug or hash) to Bounty
    mapping(string => Bounty) public bounties;

    event PaymentReceived(address indexed payer, string resourceId, uint256 amount);
    event BountyReleased(string indexed questionId, address indexed winner, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    /**
     * @dev Process a payment for asking a question and setting a bounty.
     * The entire msg.value is treated as the bounty.
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
     * Controlled by the API (owner) after an answer is accepted.
     */
    function releaseBounty(string memory questionId, address payable winner) external onlyOwner {
        Bounty storage bounty = bounties[questionId];
        require(bounty.amount > 0, "No bounty found");
        require(!bounty.released, "Bounty already released");

        bounty.released = true;
        uint256 amount = bounty.amount;
        
        (bool success, ) = winner.call{value: amount}("");
        require(success, "Transfer failed");

        emit BountyReleased(questionId, winner, amount);
    }

    /**
     * @dev Withdraw protocol fees collected via payFee.
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        // In a real app, you'd track fee balance separately from active bounties
        // For this demo, we can just withdraw the whole balance if needed
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Update the minimum protocol fee.
     */
    function setProtocolFee(uint256 _newFee) external onlyOwner {
        protocolFee = _newFee;
    }

    // Function to receive ETH
    receive() external payable {}
}
