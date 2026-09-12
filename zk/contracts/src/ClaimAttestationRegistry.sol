// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.28;

import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {CouncilRegistry} from "./CouncilRegistry.sol";
import {ArtifactPolicyRegistry} from "./ArtifactPolicyRegistry.sol";

/// @title ClaimAttestationRegistry
/// @notice Anchors minimized KVCH claim headers on-chain after M-of-N
///         verifier-council EIP-712 attestations. No proof bytes, witness
///         material, approval signatures or private values are stored.
contract ClaimAttestationRegistry is AccessManaged, EIP712, Pausable {
    uint64 public constant ROLE_DISPUTE_CALLER = 1 << 5;
    uint256 public constant MAX_ATTESTATIONS = 16;
    uint8 public constant DECISION_APPROVE = 1;

    // EIP-712 attestation signed by each verifier node off-chain.
    bytes32 public constant ATTESTATION_TYPEHASH = keccak256(
        "VerificationAttestation(bytes32 claimId,bytes32 bundleDigest,bytes32 publicInputDigest,bytes32 circuitDigest,bytes32 vkDigest,bytes32 policyDigest,uint256 councilSetId,address verifier,uint8 decision,uint8 reasonCode,uint256 nonce,uint64 issuedAt,uint64 deadline)"
    );

    enum ClaimStatus {
        NONE,
        ACTIVE,
        REVOKED,
        SUPERSEDED,
        INVALIDATED
    }

    /// @notice Minimized claim header — commitments and bands only.
    struct ClaimHeader {
        bytes32 claimId;
        bytes32 claimSeriesId;
        uint64 claimVersion;
        bytes32 bundleDigest;
        bytes32 bundleRefDigest;
        bytes32 publicInputDigest;
        bytes32 disclosureNullifier;
        bytes32 circuitId;
        bytes32 policyId;
        uint256 councilSetId;
        uint64 issuerCompanyCode;
        uint64 expiryEpoch;
    }

    struct Attestation {
        address verifier;
        uint8 decision;
        uint8 reasonCode;
        uint256 nonce;
        uint64 issuedAt;
        uint64 deadline;
        bytes signature;
    }

    struct ClaimRecord {
        ClaimStatus status;
        uint64 submittedAt;
        uint64 expiryEpoch;
        uint64 issuerCompanyCode;
        bytes32 bundleDigest;
        bytes32 publicInputDigest;
    }

    CouncilRegistry public immutable council;
    ArtifactPolicyRegistry public immutable artifacts;

    mapping(bytes32 => ClaimRecord) public claims;
    mapping(bytes32 => bool) public usedNullifiers;
    mapping(bytes32 => bytes32) public supersededBy; // old claimId => new claimId

    event ClaimAnchored(
        bytes32 indexed claimId,
        bytes32 indexed claimSeriesId,
        bytes32 bundleDigest,
        bytes32 publicInputDigest,
        uint64 issuerCompanyCode,
        uint64 expiryEpoch
    );
    event ClaimStatusChanged(bytes32 indexed claimId, ClaimStatus status, uint8 reasonCode);
    event ClaimSuperseded(bytes32 indexed oldClaimId, bytes32 indexed newClaimId);

    error ClaimExists();
    error ClaimUnknown();
    error NullifierUsed();
    error ClaimExpiredErr();
    error AlreadyTerminal();
    error AttestationsEmpty();
    error TooManyAttestations();
    error SignersNotSorted();
    error AttestationExpired();
    error BadDecision();
    error NotVerifier();
    error BadSignature();
    error QuorumNotMet();
    error InactiveArtifact();
    error IncompatiblePolicy();

    constructor(address manager, address council_, address artifacts_)
        AccessManaged(manager)
        EIP712("KVCHClaimAttestationRegistry", "1")
    {
        council = CouncilRegistry(council_);
        artifacts = ArtifactPolicyRegistry(artifacts_);
    }

    /// @notice Hash of one verifier attestation under this contract's domain.
    function attestationDigest(ClaimHeader calldata h, Attestation calldata a) public view returns (bytes32) {
        (bytes32 artifactDigest, bytes32 vkDigest,) = _circuitDigests(h.circuitId);
        bytes32 policyDigest = _policyDigest(h.policyId);
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    ATTESTATION_TYPEHASH,
                    h.claimId,
                    h.bundleDigest,
                    h.publicInputDigest,
                    artifactDigest,
                    vkDigest,
                    policyDigest,
                    h.councilSetId,
                    a.verifier,
                    a.decision,
                    a.reasonCode,
                    a.nonce,
                    a.issuedAt,
                    a.deadline
                )
            )
        );
    }

    /// @notice Anchor a claim. Attestations must be sorted by strictly
    ///         ascending verifier address and meet the verifier threshold.
    function submitClaim(ClaimHeader calldata h, Attestation[] calldata atts) external whenNotPaused {
        if (h.claimId == bytes32(0) || claims[h.claimId].status != ClaimStatus.NONE) {
            revert ClaimExists();
        }
        if (h.expiryEpoch <= block.timestamp) revert ClaimExpiredErr();
        if (usedNullifiers[h.disclosureNullifier]) revert NullifierUsed();
        if (atts.length == 0) revert AttestationsEmpty();
        if (atts.length > MAX_ATTESTATIONS) revert TooManyAttestations();

        _checkArtifacts(h);
        _checkQuorum(h, atts);

        usedNullifiers[h.disclosureNullifier] = true;
        claims[h.claimId] = ClaimRecord({
            status: ClaimStatus.ACTIVE,
            submittedAt: uint64(block.timestamp),
            expiryEpoch: h.expiryEpoch,
            issuerCompanyCode: h.issuerCompanyCode,
            bundleDigest: h.bundleDigest,
            publicInputDigest: h.publicInputDigest
        });
        emit ClaimAnchored(
            h.claimId, h.claimSeriesId, h.bundleDigest, h.publicInputDigest, h.issuerCompanyCode, h.expiryEpoch
        );
    }

    /// @dev The attestation digest binds the *registered* artifact digests,
    ///      so a verifier signing different circuit/vk/policy digests cannot
    ///      produce a valid signature here. Active windows and
    ///      policy↔circuit compatibility are checked against the registry.
    function _checkArtifacts(ClaimHeader calldata h) internal view {
        (bytes32 artifactDigest, bytes32 vkDigest,) = _circuitDigests(h.circuitId);
        if (!artifacts.isCircuitActive(h.circuitId, artifactDigest, vkDigest)) {
            revert InactiveArtifact();
        }
        if (!artifacts.isPolicyActive(h.policyId, _policyDigest(h.policyId))) {
            revert InactiveArtifact();
        }
        if (!artifacts.compatible(h.policyId, h.circuitId)) revert IncompatiblePolicy();
    }

    function _checkQuorum(ClaimHeader calldata h, Attestation[] calldata atts) internal view {
        address prev = address(0);
        uint256 valid = 0;
        for (uint256 i = 0; i < atts.length; i++) {
            Attestation calldata a = atts[i];
            if (a.verifier <= prev) revert SignersNotSorted();
            prev = a.verifier;
            if (a.deadline < block.timestamp) revert AttestationExpired();
            if (a.decision != DECISION_APPROVE) revert BadDecision();
            if (!council.isActiveMember(h.councilSetId, a.verifier, council.ROLE_VERIFIER())) {
                revert NotVerifier();
            }
            bytes32 digest = attestationDigest(h, a);
            if (!SignatureChecker.isValidSignatureNow(a.verifier, digest, a.signature)) {
                revert BadSignature();
            }
            valid++;
        }
        if (valid < council.thresholdFor(h.councilSetId, council.ROLE_VERIFIER())) {
            revert QuorumNotMet();
        }
    }

    function _circuitDigests(bytes32 circuitId)
        internal
        view
        returns (bytes32 artifactDigest, bytes32 vkDigest, bytes32 proofFlavor)
    {
        (artifactDigest, vkDigest, proofFlavor,,,) = artifacts.circuits(circuitId);
    }

    function _policyDigest(bytes32 policyId) internal view returns (bytes32) {
        (bytes32 policyDigest,,,,,,,) = artifacts.policies(policyId);
        return policyDigest;
    }

    // ---- lifecycle ---------------------------------------------------------

    function revokeClaim(bytes32 claimId, uint8 reasonCode) external restricted {
        _setStatus(claimId, ClaimStatus.REVOKED, reasonCode);
    }

    function invalidateClaim(bytes32 claimId, uint8 reasonCode) external restricted {
        _setStatus(claimId, ClaimStatus.INVALIDATED, reasonCode);
    }

    /// @notice Mark `oldId` superseded by the already-anchored `newId`.
    function supersedeClaim(bytes32 oldId, bytes32 newId) external restricted {
        if (claims[newId].status != ClaimStatus.ACTIVE) revert ClaimUnknown();
        _setStatus(oldId, ClaimStatus.SUPERSEDED, 0);
        supersededBy[oldId] = newId;
        emit ClaimSuperseded(oldId, newId);
    }

    function _setStatus(bytes32 claimId, ClaimStatus status, uint8 reasonCode) internal {
        ClaimRecord storage r = claims[claimId];
        if (r.status == ClaimStatus.NONE) revert ClaimUnknown();
        if (r.status != ClaimStatus.ACTIVE) revert AlreadyTerminal();
        r.status = status;
        emit ClaimStatusChanged(claimId, status, reasonCode);
    }

    // ---- views ---------------------------------------------------------------

    function isClaimActive(bytes32 claimId) external view returns (bool) {
        ClaimRecord storage r = claims[claimId];
        return r.status == ClaimStatus.ACTIVE && block.timestamp <= r.expiryEpoch;
    }

    // ---- admin -----------------------------------------------------------------

    function pause() external restricted {
        _pause();
    }

    function unpause() external restricted {
        _unpause();
    }
}
