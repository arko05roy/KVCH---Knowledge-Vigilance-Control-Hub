// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.28;

import {AccessManaged} from "@openzeppelin/contracts/access/manager/AccessManaged.sol";

/// @title ArtifactPolicyRegistry
/// @notice Registers versioned circuit artifacts and policy artifacts by
///         digest, with effective intervals and pause/deprecate/invalidate
///         lifecycle. History is never deleted.
contract ArtifactPolicyRegistry is AccessManaged {
    enum Status {
        NONE,
        ACTIVE,
        PAUSED,
        DEPRECATED,
        INVALIDATED
    }

    struct Circuit {
        bytes32 artifactDigest; // compiled circuit artifact digest
        bytes32 vkDigest; // verification-key digest
        bytes32 proofFlavor; // e.g. keccak256("ultrahonk:noir-recursive-no-zk")
        uint64 activeFrom;
        uint64 activeUntil; // 0 = open-ended
        Status status;
    }

    struct Policy {
        bytes32 policyDigest;
        bytes32 codebookDigest;
        bytes32 sourceDigest;
        bytes32 auditDigest;
        bytes32 containerDigest;
        uint64 activeFrom;
        uint64 activeUntil;
        Status status;
    }

    mapping(bytes32 => Circuit) public circuits;
    mapping(bytes32 => Policy) public policies;
    // policyId => circuitId => compatible
    mapping(bytes32 => mapping(bytes32 => bool)) public compatible;

    event CircuitRegistered(bytes32 indexed circuitId, bytes32 artifactDigest, bytes32 vkDigest);
    event CircuitStatus(bytes32 indexed circuitId, Status status);
    event PolicyRegistered(bytes32 indexed policyId, bytes32 policyDigest);
    event PolicyStatus(bytes32 indexed policyId, Status status);
    event CompatibilitySet(bytes32 indexed policyId, bytes32 indexed circuitId, bool allowed);

    error AlreadyRegistered();
    error NotRegistered();
    error BadWindow();

    constructor(address manager) AccessManaged(manager) {}

    function registerCircuit(
        bytes32 circuitId,
        bytes32 artifactDigest,
        bytes32 vkDigest,
        bytes32 proofFlavor,
        uint64 activeFrom,
        uint64 activeUntil
    ) external restricted {
        if (circuits[circuitId].status != Status.NONE) revert AlreadyRegistered();
        if (activeUntil != 0 && activeUntil <= activeFrom) revert BadWindow();
        circuits[circuitId] = Circuit({
            artifactDigest: artifactDigest,
            vkDigest: vkDigest,
            proofFlavor: proofFlavor,
            activeFrom: activeFrom,
            activeUntil: activeUntil,
            status: Status.ACTIVE
        });
        emit CircuitRegistered(circuitId, artifactDigest, vkDigest);
    }

    function setCircuitStatus(bytes32 circuitId, Status status) external restricted {
        if (circuits[circuitId].status == Status.NONE) revert NotRegistered();
        circuits[circuitId].status = status;
        emit CircuitStatus(circuitId, status);
    }

    function registerPolicy(
        bytes32 policyId,
        bytes32 policyDigest,
        bytes32 codebookDigest,
        bytes32 sourceDigest,
        bytes32 auditDigest,
        bytes32 containerDigest,
        uint64 activeFrom,
        uint64 activeUntil
    ) external restricted {
        if (policies[policyId].status != Status.NONE) revert AlreadyRegistered();
        if (activeUntil != 0 && activeUntil <= activeFrom) revert BadWindow();
        policies[policyId] = Policy({
            policyDigest: policyDigest,
            codebookDigest: codebookDigest,
            sourceDigest: sourceDigest,
            auditDigest: auditDigest,
            containerDigest: containerDigest,
            activeFrom: activeFrom,
            activeUntil: activeUntil,
            status: Status.ACTIVE
        });
        emit PolicyRegistered(policyId, policyDigest);
    }

    function setPolicyStatus(bytes32 policyId, Status status) external restricted {
        if (policies[policyId].status == Status.NONE) revert NotRegistered();
        policies[policyId].status = status;
        emit PolicyStatus(policyId, status);
    }

    function setCompatibility(bytes32 policyId, bytes32 circuitId, bool allowed) external restricted {
        compatible[policyId][circuitId] = allowed;
        emit CompatibilitySet(policyId, circuitId, allowed);
    }

    /// @notice True when the circuit is registered, ACTIVE, inside its window
    ///         and the stored digests match the presented ones.
    function isCircuitActive(bytes32 circuitId, bytes32 artifactDigest, bytes32 vkDigest) public view returns (bool) {
        Circuit storage c = circuits[circuitId];
        if (c.status != Status.ACTIVE) return false;
        if (block.timestamp < c.activeFrom) return false;
        if (c.activeUntil != 0 && block.timestamp > c.activeUntil) return false;
        return c.artifactDigest == artifactDigest && c.vkDigest == vkDigest;
    }

    function isPolicyActive(bytes32 policyId, bytes32 policyDigest) public view returns (bool) {
        Policy storage p = policies[policyId];
        if (p.status != Status.ACTIVE) return false;
        if (block.timestamp < p.activeFrom) return false;
        if (p.activeUntil != 0 && block.timestamp > p.activeUntil) return false;
        return p.policyDigest == policyDigest;
    }
}
