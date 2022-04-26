// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

interface IRewardToken is IERC20Upgradeable {
    function mint(address to, uint256 amount) external;
}

contract BTMTStaking is
    Initializable,
    PausableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    address public rewardToken;
    address public btmtCollection;
    address public operator;

    mapping(uint256 => address) private _tokenOwner;

    event Stake(uint256 indexed tokenId, address owner);

    event UnStake(uint256 indexed tokenId, uint256 rewardAmount, address owner);

    event ClaimReward(
        uint256 indexed tokenId,
        uint256 rewardAmount,
        address owner
    );

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
        bytes memory _signature
    ) internal view {
        require(_tokenOwner[_tokenId] == msg.sender, "Not owner");
        bytes32 ethSignedMessageHash = ECDSAUpgradeable.toEthSignedMessageHash(
            keccak256(
                abi.encodePacked(
                    _tokenId,
                    _rewardAmount,
                    msg.sender,
                    operator,
                    address(this)
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
        bytes calldata _signature
    ) external whenNotPaused {
        _verifySignature(_tokenId, _rewardAmount, _signature);
        IRewardToken(rewardToken).mint(msg.sender, _rewardAmount);
        _releaseNFT(_tokenId, msg.sender);
        emit UnStake(_tokenId, _rewardAmount, msg.sender);
    }

    function claimReward(
        uint256 _tokenId,
        uint256 _rewardAmount,
        bytes calldata _signature
    ) external whenNotPaused {
        _verifySignature(_tokenId, _rewardAmount, _signature);
        IRewardToken(rewardToken).mint(msg.sender, _rewardAmount);
        emit ClaimReward(_tokenId, _rewardAmount, msg.sender);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}
}
