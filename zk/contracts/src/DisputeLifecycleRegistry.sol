// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.28;

import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ClaimAttestationRegistry} from "./ClaimAttestationRegistry.sol";

/// @title DisputeLifecycleRegistry
/// @notice Dispute open/resolve/appeal state machine with restricted
///         evidence digests only — no dispute narrative on-chain. Resolution
///         can drive claim status transitions in ClaimAttestationRegistry.
contract DisputeLifecycleRegistry is AccessManaged, Pausable {
    enum DisputeStatus {
        NONE,
        OPEN,
        RESOLVED,
        APPEALED
    }

    enum ResolutionAction {
        NONE,
        REVOKE,
        INVALIDATE
    }

    struct Dispute {
        DisputeStatus status;
        uint8 reasonCode;
        uint64 openedAt;
        uint64 resolvedAt;
        bytes32 evidenceDigest;
        bytes32 resolutionDigest;
        bytes32 appealRef;
    }

    ClaimAttestationRegistry public immutable claims;

    mapping(bytes32 => Dispute) public disputes; // keyed by claimId

    event DisputeOpened(bytes32 indexed claimId, uint8 reasonCode, bytes32 evidenceDigest);
    event DisputeResolved(
        bytes32 indexed claimId, uint8 resolutionCode, bytes32 resolutionDigest, ResolutionAction action
    );
    event DisputeAppealed(bytes32 indexed claimId, bytes32 appealRef);

    error ClaimUnknown();
    error DisputeExists();
    error DisputeNotOpen();
    error BadTransition();

    constructor(address manager, address claims_) AccessManaged(manager) {
        claims = ClaimAttestationRegistry(claims_);
    }

    /// @notice Open a dispute on an existing claim. Restricted to the
    ///         dispute-duty role (council governance or guardian).
    function openDispute(bytes32 claimId, uint8 reasonCode, bytes32 evidenceDigest) external restricted whenNotPaused {
        (ClaimAttestationRegistry.ClaimStatus s,,,,,) = claims.claims(claimId);
        if (s == ClaimAttestationRegistry.ClaimStatus.NONE) revert ClaimUnknown();
        if (disputes[claimId].status == DisputeStatus.OPEN) revert DisputeExists();
        disputes[claimId] = Dispute({
            status: DisputeStatus.OPEN,
            reasonCode: reasonCode,
            openedAt: uint64(block.timestamp),
            resolvedAt: 0,
            evidenceDigest: evidenceDigest,
            resolutionDigest: bytes32(0),
            appealRef: bytes32(0)
        });
        emit DisputeOpened(claimId, reasonCode, evidenceDigest);
    }

    /// @notice Resolve an open dispute; optionally revoke/invalidate the
    ///         underlying claim in one transaction.
    function resolveDispute(bytes32 claimId, uint8 resolutionCode, bytes32 resolutionDigest, ResolutionAction action)
        external
        restricted
    {
        Dispute storage d = disputes[claimId];
        if (d.status != DisputeStatus.OPEN && d.status != DisputeStatus.APPEALED) {
            revert DisputeNotOpen();
        }
        d.status = DisputeStatus.RESOLVED;
        d.resolvedAt = uint64(block.timestamp);
        d.resolutionDigest = resolutionDigest;
        emit DisputeResolved(claimId, resolutionCode, resolutionDigest, action);

        if (action == ResolutionAction.REVOKE) {
            claims.revokeClaim(claimId, resolutionCode);
        } else if (action == ResolutionAction.INVALIDATE) {
            claims.invalidateClaim(claimId, resolutionCode);
        }
    }

    /// @notice Record an appeal reference against a resolved dispute.
    function appealDispute(bytes32 claimId, bytes32 appealRef) external restricted {
        Dispute storage d = disputes[claimId];
        if (d.status != DisputeStatus.RESOLVED) revert BadTransition();
        d.status = DisputeStatus.APPEALED;
        d.appealRef = appealRef;
        emit DisputeAppealed(claimId, appealRef);
    }

    function disputeStatus(bytes32 claimId) external view returns (DisputeStatus) {
        return disputes[claimId].status;
    }

    function pause() external restricted {
        _pause();
    }

    function unpause() external restricted {
        _unpause();
    }
}
