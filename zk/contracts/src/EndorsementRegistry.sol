// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.28;

import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {CouncilRegistry} from "./CouncilRegistry.sol";
import {ArtifactPolicyRegistry} from "./ArtifactPolicyRegistry.sol";
import {ClaimAttestationRegistry} from "./ClaimAttestationRegistry.sol";

/// @title EndorsementRegistry
/// @notice Anchors peer endorsements of active claims. Enforces unique
///         endorser/nullifier per target, excludes the origin issuer, and
///         tracks the corroboration threshold.
contract EndorsementRegistry is AccessManaged, EIP712, Pausable {
    uint256 public constant MAX_ATTESTATIONS = 16;
    uint8 public constant DECISION_APPROVE = 1;

    bytes32 public constant ATTESTATION_TYPEHASH = keccak256(
        "EndorsementAttestation(bytes32 endorsementId,bytes32 targetClaimId,bytes32 bundleDigest,bytes32 publicInputDigest,bytes32 circuitDigest,bytes32 vkDigest,bytes32 policyDigest,uint256 councilSetId,address verifier,uint8 decision,uint8 reasonCode,uint256 nonce,uint64 issuedAt,uint64 deadline)"
    );

    struct EndorsementHeader {
        bytes32 endorsementId;
        bytes32 targetClaimId;
        bytes32 bundleDigest;
        bytes32 publicInputDigest;
        bytes32 endorsementNullifier;
        bytes32 circuitId;
        bytes32 policyId;
        uint256 councilSetId;
        uint64 endorserCompanyCode;
        uint64 expiryEpoch;
        uint16 matchBandCode;
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

    CouncilRegistry public immutable council;
    ArtifactPolicyRegistry public immutable artifacts;
    ClaimAttestationRegistry public immutable claims;

    /// @notice Corroboration threshold: endorsements per target claim.
    uint16 public corroborationThreshold;

    mapping(bytes32 => bool) public endorsementExists;
    mapping(bytes32 => bool) public usedNullifiers;
    // targetClaimId => endorserCompanyCode => endorsed
    mapping(bytes32 => mapping(uint64 => bool)) public endorserUsed;
    mapping(bytes32 => uint256) public endorsementCount;

    event EndorsementAnchored(
        bytes32 indexed endorsementId, bytes32 indexed targetClaimId, uint64 endorserCompanyCode, uint16 matchBandCode
    );
    event CorroborationThresholdSet(uint16 threshold);

    error TargetNotActive();
    error EndorsementExists();
    error NullifierUsed();
    error EndorserIsOrigin();
    error EndorserAlreadyEndorsed();
    error Expired();
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

    constructor(address manager, address council_, address artifacts_, address claims_, uint16 corroborationThreshold_)
        AccessManaged(manager)
        EIP712("KVCHEndorsementRegistry", "1")
    {
        council = CouncilRegistry(council_);
        artifacts = ArtifactPolicyRegistry(artifacts_);
        claims = ClaimAttestationRegistry(claims_);
        corroborationThreshold = corroborationThreshold_;
    }

    function attestationDigest(EndorsementHeader calldata h, Attestation calldata a) public view returns (bytes32) {
        (bytes32 artifactDigest, bytes32 vkDigest,,,,) = artifacts.circuits(h.circuitId);
        (bytes32 policyDigest,,,,,,,) = artifacts.policies(h.policyId);
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    ATTESTATION_TYPEHASH,
                    h.endorsementId,
                    h.targetClaimId,
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

    function submitEndorsement(EndorsementHeader calldata h, Attestation[] calldata atts) external whenNotPaused {
        if (!claims.isClaimActive(h.targetClaimId)) revert TargetNotActive();
        if (endorsementExists[h.endorsementId]) revert EndorsementExists();
        if (usedNullifiers[h.endorsementNullifier]) revert NullifierUsed();
        if (h.expiryEpoch <= block.timestamp) revert Expired();
        (,,, uint64 originIssuer,,) = claims.claims(h.targetClaimId);
        if (h.endorserCompanyCode == originIssuer) revert EndorserIsOrigin();
        if (endorserUsed[h.targetClaimId][h.endorserCompanyCode]) {
            revert EndorserAlreadyEndorsed();
        }
        if (atts.length == 0) revert AttestationsEmpty();
        if (atts.length > MAX_ATTESTATIONS) revert TooManyAttestations();

        _checkArtifacts(h);

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
            if (!SignatureChecker.isValidSignatureNow(a.verifier, attestationDigest(h, a), a.signature)) {
                revert BadSignature();
            }
            valid++;
        }
        if (valid < council.thresholdFor(h.councilSetId, council.ROLE_VERIFIER())) {
            revert QuorumNotMet();
        }

        endorsementExists[h.endorsementId] = true;
        usedNullifiers[h.endorsementNullifier] = true;
        endorserUsed[h.targetClaimId][h.endorserCompanyCode] = true;
        endorsementCount[h.targetClaimId]++;
        emit EndorsementAnchored(h.endorsementId, h.targetClaimId, h.endorserCompanyCode, h.matchBandCode);
    }

    function _checkArtifacts(EndorsementHeader calldata h) internal view {
        (bytes32 artifactDigest, bytes32 vkDigest,,,,) = artifacts.circuits(h.circuitId);
        if (!artifacts.isCircuitActive(h.circuitId, artifactDigest, vkDigest)) {
            revert InactiveArtifact();
        }
        (bytes32 policyDigest,,,,,,,) = artifacts.policies(h.policyId);
        if (!artifacts.isPolicyActive(h.policyId, policyDigest)) revert InactiveArtifact();
        if (!artifacts.compatible(h.policyId, h.circuitId)) revert IncompatiblePolicy();
    }

    function isCorroborated(bytes32 targetClaimId) external view returns (bool) {
        return endorsementCount[targetClaimId] >= corroborationThreshold;
    }

    function setCorroborationThreshold(uint16 t) external restricted {
        corroborationThreshold = t;
        emit CorroborationThresholdSet(t);
    }

    function pause() external restricted {
        _pause();
    }

    function unpause() external restricted {
        _unpause();
    }
}
