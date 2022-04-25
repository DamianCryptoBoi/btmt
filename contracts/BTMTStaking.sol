// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

interface IRewardToken is IERC20Upgradeable {
    function mint(address to, uint256 amount) external;
}

contract BTMTStaking is
    Initializable,
    PausableUpgradeable,
    OwnableUpgradeable,
    ERC721HolderUpgradeable,
    UUPSUpgradeable
{
    address public rewardToken;
    address public btmtCollection;
    address public operator;

    mapping(uint256 => address) private _tokenOwner;

    event Stake(
        uint256 indexed tokenId,
        uint256 startTime,
        uint256 endTime,
        address owner
    );

    event UnStake(uint256 indexed tokenId, address owner);

    event Claim(uint256 indexed tokenId, uint256 rewardAmount, address owner);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(
        address _rewardToken,
        address _btmtCollection,
        address _operator
    ) public initializer {
        __Pausable_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
        rewardToken = _rewardToken;
        btmtCollection = _btmtCollection;
        operator = _operator;
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

    function _releaseNFT(uint256 _tokenId) private {
        _tokenOwner[_tokenId] = address(0);
        IERC721Upgradeable(btmtCollection).transferFrom(
            address(this),
            msg.sender,
            _tokenId
        );
    }

    function stake(uint256 _tokenId, uint256 _duration) external {
        //todo: require(...)

        _tokenOwner[_tokenId] = msg.sender;
        IERC721Upgradeable(btmtCollection).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        emit Stake(
            _tokenId,
            block.timestamp,
            block.timestamp + _duration,
            msg.sender
        );
    }

    function unStake(uint256 _tokenId) external {
        //todo: require(...)

        _releaseNFT(_tokenId);
        emit UnStake(_tokenId, msg.sender);
    }

    function claim(
        uint256 _tokenId,
        uint256 _rewardAmount,
        bytes calldata _signature
    ) external {
        //todo: require(...)

        bytes32 ethSignedMessageHash = ECDSAUpgradeable.toEthSignedMessageHash(
            keccak256(abi.encodePacked(_tokenId, _rewardAmount))
        );

        require(
            operator ==
                ECDSAUpgradeable.recover(ethSignedMessageHash, _signature),
            "invalid signature"
        );

        _releaseNFT(_tokenId);

        IRewardToken(rewardToken).mint(msg.sender, _rewardAmount);

        emit Claim(_tokenId, _rewardAmount, msg.sender);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
