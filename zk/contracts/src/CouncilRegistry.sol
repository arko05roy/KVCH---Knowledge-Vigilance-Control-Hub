// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.28;

import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";

/// @title CouncilRegistry
/// @notice Immutable, versioned council sets with duty-specific member role
///         masks, per-duty thresholds, active intervals, revocations and
///         delayed set/threshold changes. Historical sets are never deleted.
contract CouncilRegistry is AccessManaged {
    uint64 public constant ROLE_VERIFIER = 1 << 0;
    uint64 public constant ROLE_APPROVER = 1 << 1;
    uint64 public constant ROLE_GOVERNANCE = 1 << 2;
    uint64 public constant ROLE_DISPUTE = 1 << 3;
    uint64 public constant ROLE_EMERGENCY = 1 << 4;

    /// @notice Delay between scheduling and activating a council set.
    ///         Set >= 1 hour in production deployments.
    uint64 public immutable MIN_ACTIVATION_DELAY;
    uint64 public constant MAX_MEMBERS = 16;

    struct Member {
        address key;
        uint64 roleMask;
    }

    struct Thresholds {
        uint16 verifier;
        uint16 approver;
        uint16 governance;
        uint16 dispute;
        uint16 emergency;
    }

    struct CouncilSet {
        uint64 validFrom;
        uint64 validUntil; // 0 = open-ended
        bool revoked;
        Thresholds thresholds;
        Member[] members;
    }

    uint256 public nextSetId = 1;
    uint256 public activeSetId;
    uint256 public pendingSetId;
    uint64 public pendingActivateAfter;

    mapping(uint256 => CouncilSet) internal _sets;
    // setId => member key => index+1 in members array (0 = not a member)
    mapping(uint256 => mapping(address => uint256)) internal _memberIndex;

    event SetRegistered(uint256 indexed setId, uint64 validFrom, uint64 validUntil);
    event ActivationScheduled(uint256 indexed setId, uint64 activateAfter);
    event SetActivated(uint256 indexed setId);
    event SetRevoked(uint256 indexed setId);

    error EmptyMembers();
    error DuplicateMember(address key);
    error ZeroMemberKey();
    error BadThreshold();
    error SetUnknown(uint256 setId);
    error SetRevokedErr(uint256 setId);
    error ActivationNotDue(uint256 setId);
    error SetExpired(uint256 setId);

    constructor(address manager, uint64 activationDelay) AccessManaged(manager) {
        MIN_ACTIVATION_DELAY = activationDelay;
    }

    /// @notice Register a new council set. It is inert until activated.
    function registerSet(Member[] calldata members, Thresholds calldata thresholds, uint64 validFrom, uint64 validUntil)
        external
        restricted
        returns (uint256 setId)
    {
        if (members.length == 0 || members.length > MAX_MEMBERS) revert EmptyMembers();
        if (thresholds.verifier == 0 || thresholds.verifier > members.length) revert BadThreshold();
        if (validUntil != 0 && validUntil <= validFrom) revert BadThreshold();

        setId = nextSetId++;
        CouncilSet storage s = _sets[setId];
        s.validFrom = validFrom;
        s.validUntil = validUntil;
        s.thresholds = thresholds;
        for (uint256 i = 0; i < members.length; i++) {
            address key = members[i].key;
            if (key == address(0)) revert ZeroMemberKey();
            if (_memberIndex[setId][key] != 0) revert DuplicateMember(key);
            s.members.push(members[i]);
            _memberIndex[setId][key] = i + 1;
        }
        emit SetRegistered(setId, validFrom, validUntil);
    }

    /// @notice Schedule activation of a registered set after the delay.
    function scheduleActivation(uint256 setId) external restricted {
        _requireUsable(setId);
        pendingSetId = setId;
        pendingActivateAfter = uint64(block.timestamp) + MIN_ACTIVATION_DELAY;
        emit ActivationScheduled(setId, pendingActivateAfter);
    }

    /// @notice Activate the pending set once its delay has elapsed.
    function activatePendingSet() external {
        uint256 setId = pendingSetId;
        if (setId == 0) revert SetUnknown(0);
        if (block.timestamp < pendingActivateAfter) revert ActivationNotDue(setId);
        _requireUsable(setId);
        activeSetId = setId;
        pendingSetId = 0;
        pendingActivateAfter = 0;
        emit SetActivated(setId);
    }

    /// @notice Revoke a set permanently. Historical data remains readable.
    function revokeSet(uint256 setId) external restricted {
        if (setId >= nextSetId) revert SetUnknown(setId);
        _sets[setId].revoked = true;
        emit SetRevoked(setId);
    }

    function _requireUsable(uint256 setId) internal view {
        if (setId >= nextSetId) revert SetUnknown(setId);
        CouncilSet storage s = _sets[setId];
        if (s.revoked) revert SetRevokedErr(setId);
        if (s.validUntil != 0 && block.timestamp > s.validUntil) revert SetExpired(setId);
    }

    /// @notice True when `key` holds `role` in a currently usable set.
    function isActiveMember(uint256 setId, address key, uint64 role) public view returns (bool) {
        if (setId >= nextSetId) return false;
        CouncilSet storage s = _sets[setId];
        if (s.revoked) return false;
        if (block.timestamp < s.validFrom) return false;
        if (s.validUntil != 0 && block.timestamp > s.validUntil) return false;
        uint256 idx = _memberIndex[setId][key];
        return idx != 0 && (s.members[idx - 1].roleMask & role) != 0;
    }

    function thresholdFor(uint256 setId, uint64 role) external view returns (uint16) {
        Thresholds storage t = _sets[setId].thresholds;
        if (role == ROLE_VERIFIER) return t.verifier;
        if (role == ROLE_APPROVER) return t.approver;
        if (role == ROLE_GOVERNANCE) return t.governance;
        if (role == ROLE_DISPUTE) return t.dispute;
        return t.emergency;
    }

    function memberCount(uint256 setId) external view returns (uint256) {
        return _sets[setId].members.length;
    }

    function memberAt(uint256 setId, uint256 i) external view returns (address key, uint64 roleMask) {
        Member storage m = _sets[setId].members[i];
        return (m.key, m.roleMask);
    }

    function setInfo(uint256 setId) external view returns (uint64 validFrom, uint64 validUntil, bool revoked) {
        CouncilSet storage s = _sets[setId];
        return (s.validFrom, s.validUntil, s.revoked);
    }
}
