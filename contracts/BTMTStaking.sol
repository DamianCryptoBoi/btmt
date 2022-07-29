// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

contract BTMTStaking is
    Initializable,
    PausableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    address public rewardToken;
    address public btmtCollection;
    address public operator;
    address public treasuryWallet;

    mapping(address => mapping(uint256 => bool)) public executedReward; // address => nonce => executed

    mapping(uint256 => address) private _tokenOwner;

    event Stake(uint256 indexed tokenId, address owner);

    event UnStake(
        uint256 indexed tokenId,
        uint256 rewardAmount,
        address owner,
        uint256 nonce
    );

    event ClaimReward(
        uint256 indexed tokenId,
        uint256 rewardAmount,
        address owner,
        uint256 nonce
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        address _rewardToken,
        address _btmtCollection,
        address _operator,
        address _treasuryWallet
    ) public initializer {
        __Pausable_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
        rewardToken = _rewardToken;
        btmtCollection = _btmtCollection;
        operator = _operator;
        treasuryWallet = _treasuryWallet;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function setRewardToken(address _rewardToken) public onlyOwner {
        rewardToken = _rewardToken;
    }

    function setCollection(address _btmtCollection) public onlyOwner {
        btmtCollection = _btmtCollection;
    }

    function setOperator(address _operator) public onlyOwner {
        operator = _operator;
    }

    function setTreasury(address _treasuryWallet) public onlyOwner {
        treasuryWallet = _treasuryWallet;
    }

    function _releaseNFT(uint256 _tokenId, address _to) internal {
        _tokenOwner[_tokenId] = address(0);
        IERC721Upgradeable(btmtCollection).transferFrom(
            address(this),
            _to,
            _tokenId
        );
    }

    function _verifySignature(
        uint256 _tokenId,
        uint256 _rewardAmount,
        uint256 _nonce,
        bytes memory _signature
    ) internal view {
        require(_tokenOwner[_tokenId] == msg.sender, "Not owner");
        require(!executedReward[msg.sender][_nonce], "Reward executed");
        bytes32 ethSignedMessageHash = ECDSAUpgradeable.toEthSignedMessageHash(
            keccak256(
                abi.encodePacked(
                    _tokenId,
                    _rewardAmount,
                    msg.sender,
                    operator,
                    address(this),
                    _nonce
                )
            )
        );

        require(
            operator ==
                ECDSAUpgradeable.recover(ethSignedMessageHash, _signature),
            "invalid signature"
        );
    }

    function stake(uint256 _tokenId) external whenNotPaused {
        require(_tokenOwner[_tokenId] == address(0), "NFT is already staked");

        _tokenOwner[_tokenId] = msg.sender;
        IERC721Upgradeable(btmtCollection).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        emit Stake(_tokenId, msg.sender);
    }

    function unStake(
        uint256 _tokenId,
        uint256 _rewardAmount,
        uint256 _nonce,
        bytes calldata _signature
    ) external whenNotPaused {
        _verifySignature(_tokenId, _rewardAmount, _nonce, _signature);
        executedReward[msg.sender][_nonce] = true;
        IERC20Upgradeable(rewardToken).transferFrom(
            treasuryWallet,
            msg.sender,
            _rewardAmount
        );
        _releaseNFT(_tokenId, msg.sender);
        emit UnStake(_tokenId, _rewardAmount, msg.sender, _nonce);
    }

    function claimReward(
        uint256 _tokenId,
        uint256 _rewardAmount,
        uint256 _nonce,
        bytes calldata _signature
    ) external whenNotPaused {
        _verifySignature(_tokenId, _rewardAmount, _nonce, _signature);
        executedReward[msg.sender][_nonce] = true;
        IERC20Upgradeable(rewardToken).transferFrom(
            treasuryWallet,
            msg.sender,
            _rewardAmount
        );
        emit ClaimReward(_tokenId, _rewardAmount, msg.sender, _nonce);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
