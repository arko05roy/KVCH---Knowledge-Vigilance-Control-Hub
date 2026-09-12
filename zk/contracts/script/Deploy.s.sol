// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {CouncilRegistry} from "../src/CouncilRegistry.sol";
import {ArtifactPolicyRegistry} from "../src/ArtifactPolicyRegistry.sol";
import {ClaimAttestationRegistry} from "../src/ClaimAttestationRegistry.sol";
import {EndorsementRegistry} from "../src/EndorsementRegistry.sol";
import {DisputeLifecycleRegistry} from "../src/DisputeLifecycleRegistry.sol";

/// @notice Deploys the full KVCH ZK contract suite and wires roles,
///         council set and artifact registrations. The deployer bootstraps
///         as temporary ADMIN/GOVERNANCE, then hands ADMIN to GUARDIAN_ADDR
///         and GOVERNANCE to GOVERNOR_ADDR, renouncing both afterwards.
///
/// Env: DEPLOYER_KEY, GUARDIAN_ADDR, GOVERNOR_ADDR,
///      VERIFIER_{1,2,3} (addresses), ACTIVATION_DELAY (seconds, >=1h prod),
///      CIRCUIT_ID, POLICY_ID, ARTIFACT_DIGEST, VK_DIGEST, POLICY_DIGEST,
///      CODEBOOK_DIGEST (bytes32).
contract Deploy is Script {
    uint64 constant GUARDIAN_ROLE = 1;
    uint64 constant GOVERNANCE_ROLE = 2;
    uint64 constant ADMIN_ROLE = 0;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");
        address deployer = vm.addr(deployerKey);
        address guardian = vm.envAddress("GUARDIAN_ADDR");
        address governor = vm.envAddress("GOVERNOR_ADDR");
        uint64 activationDelay = uint64(vm.envUint("ACTIVATION_DELAY"));

        address[3] memory verifiers =
            [vm.envAddress("VERIFIER_1"), vm.envAddress("VERIFIER_2"), vm.envAddress("VERIFIER_3")];

        vm.startBroadcast(deployerKey);

        AccessManager manager = new AccessManager(deployer);
        CouncilRegistry council = new CouncilRegistry(address(manager), activationDelay);
        ArtifactPolicyRegistry artifacts = new ArtifactPolicyRegistry(address(manager));
        ClaimAttestationRegistry claims =
            new ClaimAttestationRegistry(address(manager), address(council), address(artifacts));
        EndorsementRegistry endorsements =
            new EndorsementRegistry(address(manager), address(council), address(artifacts), address(claims), 2);
        DisputeLifecycleRegistry disputes = new DisputeLifecycleRegistry(address(manager), address(claims));

        // ---- bootstrap roles ----------------------------------------------
        manager.grantRole(GOVERNANCE_ROLE, deployer, 0);
        manager.grantRole(GUARDIAN_ROLE, guardian, 0);
        manager.grantRole(GOVERNANCE_ROLE, governor, 0);
        // DisputeLifecycleRegistry drives claim status transitions on resolve.
        manager.grantRole(GUARDIAN_ROLE, address(disputes), 0);

        bytes4[] memory govSel = new bytes4[](9);
        govSel[0] = CouncilRegistry.registerSet.selector;
        govSel[1] = CouncilRegistry.scheduleActivation.selector;
        govSel[2] = CouncilRegistry.revokeSet.selector;
        govSel[3] = ArtifactPolicyRegistry.registerCircuit.selector;
        govSel[4] = ArtifactPolicyRegistry.registerPolicy.selector;
        govSel[5] = ArtifactPolicyRegistry.setCompatibility.selector;
        govSel[6] = ArtifactPolicyRegistry.setCircuitStatus.selector;
        govSel[7] = ArtifactPolicyRegistry.setPolicyStatus.selector;
        govSel[8] = EndorsementRegistry.setCorroborationThreshold.selector;
        manager.setTargetFunctionRole(address(council), govSel, GOVERNANCE_ROLE);
        manager.setTargetFunctionRole(address(artifacts), govSel, GOVERNANCE_ROLE);
        manager.setTargetFunctionRole(address(endorsements), govSel, GOVERNANCE_ROLE);

        bytes4[] memory guardSel = new bytes4[](7);
        guardSel[0] = ClaimAttestationRegistry.revokeClaim.selector;
        guardSel[1] = ClaimAttestationRegistry.invalidateClaim.selector;
        guardSel[2] = ClaimAttestationRegistry.supersedeClaim.selector;
        guardSel[3] = ClaimAttestationRegistry.pause.selector;
        guardSel[4] = ClaimAttestationRegistry.unpause.selector;
        guardSel[5] = EndorsementRegistry.pause.selector;
        guardSel[6] = EndorsementRegistry.unpause.selector;
        manager.setTargetFunctionRole(address(claims), guardSel, GUARDIAN_ROLE);
        manager.setTargetFunctionRole(address(endorsements), guardSel, GUARDIAN_ROLE);

        bytes4[] memory dispSel = new bytes4[](3);
        dispSel[0] = DisputeLifecycleRegistry.openDispute.selector;
        dispSel[1] = DisputeLifecycleRegistry.resolveDispute.selector;
        dispSel[2] = DisputeLifecycleRegistry.appealDispute.selector;
        manager.setTargetFunctionRole(address(disputes), dispSel, GOVERNANCE_ROLE);

        // ---- council set: 2-of-3 verifiers ---------------------------------
        CouncilRegistry.Member[] memory members = new CouncilRegistry.Member[](3);
        for (uint256 i = 0; i < 3; i++) {
            members[i] = CouncilRegistry.Member(verifiers[i], council.ROLE_VERIFIER());
        }
        CouncilRegistry.Thresholds memory th =
            CouncilRegistry.Thresholds({verifier: 2, approver: 2, governance: 2, dispute: 2, emergency: 1});
        uint256 setId = council.registerSet(members, th, 0, 0);
        council.scheduleActivation(setId);

        // ---- artifact + policy registrations --------------------------------
        bytes32 circuitId = vm.envBytes32("CIRCUIT_ID");
        bytes32 policyId = vm.envBytes32("POLICY_ID");
        artifacts.registerCircuit(
            circuitId,
            vm.envBytes32("ARTIFACT_DIGEST"),
            vm.envBytes32("VK_DIGEST"),
            keccak256("ultrahonk:noir-recursive-no-zk"),
            0,
            0
        );
        artifacts.registerPolicy(
            policyId,
            vm.envBytes32("POLICY_DIGEST"),
            vm.envBytes32("CODEBOOK_DIGEST"),
            bytes32(0),
            bytes32(0),
            bytes32(0),
            0,
            0
        );
        artifacts.setCompatibility(policyId, circuitId, true);

        // Optional second circuit (e.g. peer_endorsement) under the same policy.
        bytes32 circuitId2 = vm.envOr("CIRCUIT_ID_2", bytes32(0));
        if (circuitId2 != bytes32(0)) {
            artifacts.registerCircuit(
                circuitId2,
                vm.envBytes32("ARTIFACT_DIGEST_2"),
                vm.envBytes32("VK_DIGEST_2"),
                keccak256("ultrahonk:noir-recursive-no-zk"),
                0,
                0
            );
            artifacts.setCompatibility(policyId, circuitId2, true);
        }

        // ---- hand over authority --------------------------------------------
        manager.grantRole(ADMIN_ROLE, guardian, 0);
        manager.revokeRole(GOVERNANCE_ROLE, deployer);
        manager.renounceRole(ADMIN_ROLE, deployer);

        vm.stopBroadcast();

        console.log("AccessManager:", address(manager));
        console.log("CouncilRegistry:", address(council));
        console.log("ArtifactPolicyRegistry:", address(artifacts));
        console.log("ClaimAttestationRegistry:", address(claims));
        console.log("EndorsementRegistry:", address(endorsements));
        console.log("DisputeLifecycleRegistry:", address(disputes));
        console.log("councilSetId:", setId);
        console.log("pendingActivateAfter:", council.pendingActivateAfter());

        // ---- deployment manifest ----------------------------------------------
        string memory json = "deployment";
        vm.serializeUint(json, "chainId", block.chainid);
        vm.serializeAddress(json, "deployer", deployer);
        vm.serializeAddress(json, "guardian", guardian);
        vm.serializeAddress(json, "governor", governor);
        vm.serializeAddress(json, "AccessManager", address(manager));
        vm.serializeAddress(json, "CouncilRegistry", address(council));
        vm.serializeAddress(json, "ArtifactPolicyRegistry", address(artifacts));
        vm.serializeAddress(json, "ClaimAttestationRegistry", address(claims));
        vm.serializeAddress(json, "EndorsementRegistry", address(endorsements));
        vm.serializeAddress(json, "DisputeLifecycleRegistry", address(disputes));
        vm.serializeUint(json, "councilSetId", setId);
        vm.serializeUint(json, "pendingActivateAfter", council.pendingActivateAfter());
        vm.serializeBytes32(json, "circuitId", circuitId);
        vm.serializeBytes32(json, "circuitId2", circuitId2);
        string memory out = vm.serializeBytes32(json, "policyId", policyId);
        vm.writeJson(out, "./deployments/latest.json");
    }
}
