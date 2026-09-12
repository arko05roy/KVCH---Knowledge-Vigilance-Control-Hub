// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {AccessManager} from "@openzeppelin/contracts/access/manager/AccessManager.sol";
import {CouncilRegistry} from "../src/CouncilRegistry.sol";
import {ArtifactPolicyRegistry} from "../src/ArtifactPolicyRegistry.sol";
import {ClaimAttestationRegistry} from "../src/ClaimAttestationRegistry.sol";
import {EndorsementRegistry} from "../src/EndorsementRegistry.sol";
import {DisputeLifecycleRegistry} from "../src/DisputeLifecycleRegistry.sol";

contract KvchTest is Test {
    uint64 internal constant GUARDIAN_ROLE = 1;
    uint64 internal constant GOVERNANCE_ROLE = 2;
    uint64 internal constant DISPUTE_ROLE = 3;

    uint256 internal constant V1_KEY = 0xA11CE;
    uint256 internal constant V2_KEY = 0xB0B;
    uint256 internal constant V3_KEY = 0xC0FFEE;
    uint256 internal constant OUTSIDER_KEY = 0xBAD;

    AccessManager manager;
    CouncilRegistry council;
    ArtifactPolicyRegistry artifacts;
    ClaimAttestationRegistry claims;
    EndorsementRegistry endorsements;
    DisputeLifecycleRegistry disputes;

    address admin = address(this);
    address guardian = makeAddr("guardian");
    address governor = makeAddr("governor");

    address v1;
    address v2;
    address v3;
    uint256 setId;

    bytes32 constant CIRCUIT_ID = keccak256("circuit.threat_eligibility.v1");
    bytes32 constant POLICY_ID = keccak256("policy.threat.v1");
    bytes32 constant ARTIFACT_DIGEST = keccak256("artifact.json");
    bytes32 constant VK_DIGEST = keccak256("vk");
    bytes32 constant POLICY_DIGEST = keccak256("policy.json");

    function setUp() public {
        v1 = vm.addr(V1_KEY);
        v2 = vm.addr(V2_KEY);
        v3 = vm.addr(V3_KEY);

        manager = new AccessManager(admin);
        council = new CouncilRegistry(address(manager), 1 hours);
        artifacts = new ArtifactPolicyRegistry(address(manager));
        claims = new ClaimAttestationRegistry(address(manager), address(council), address(artifacts));
        endorsements =
            new EndorsementRegistry(address(manager), address(council), address(artifacts), address(claims), 2);
        disputes = new DisputeLifecycleRegistry(address(manager), address(claims));

        // role wiring
        manager.grantRole(GUARDIAN_ROLE, guardian, 0);
        manager.grantRole(GOVERNANCE_ROLE, governor, 0);
        manager.grantRole(DISPUTE_ROLE, address(disputes), 0);
        manager.grantRole(GUARDIAN_ROLE, address(disputes), 0);

        bytes4[] memory adminSel = new bytes4[](9);
        adminSel[0] = CouncilRegistry.registerSet.selector;
        adminSel[1] = CouncilRegistry.scheduleActivation.selector;
        adminSel[2] = CouncilRegistry.revokeSet.selector;
        adminSel[3] = ArtifactPolicyRegistry.registerCircuit.selector;
        adminSel[4] = ArtifactPolicyRegistry.registerPolicy.selector;
        adminSel[5] = ArtifactPolicyRegistry.setCompatibility.selector;
        adminSel[6] = EndorsementRegistry.setCorroborationThreshold.selector;
        adminSel[7] = ArtifactPolicyRegistry.setCircuitStatus.selector;
        adminSel[8] = ArtifactPolicyRegistry.setPolicyStatus.selector;
        manager.setTargetFunctionRole(address(council), adminSel, GOVERNANCE_ROLE);
        manager.setTargetFunctionRole(address(artifacts), adminSel, GOVERNANCE_ROLE);
        manager.setTargetFunctionRole(address(endorsements), adminSel, GOVERNANCE_ROLE);

        bytes4[] memory guardSel = new bytes4[](6);
        guardSel[0] = ClaimAttestationRegistry.revokeClaim.selector;
        guardSel[1] = ClaimAttestationRegistry.invalidateClaim.selector;
        guardSel[2] = ClaimAttestationRegistry.supersedeClaim.selector;
        guardSel[3] = ClaimAttestationRegistry.pause.selector;
        guardSel[4] = ClaimAttestationRegistry.unpause.selector;
        guardSel[5] = EndorsementRegistry.pause.selector;
        manager.setTargetFunctionRole(address(claims), guardSel, GUARDIAN_ROLE);
        manager.setTargetFunctionRole(address(endorsements), guardSel, GUARDIAN_ROLE);

        bytes4[] memory dispSel = new bytes4[](3);
        dispSel[0] = DisputeLifecycleRegistry.openDispute.selector;
        dispSel[1] = DisputeLifecycleRegistry.resolveDispute.selector;
        dispSel[2] = DisputeLifecycleRegistry.appealDispute.selector;
        manager.setTargetFunctionRole(address(disputes), dispSel, GOVERNANCE_ROLE);

        // council set: 3 verifiers, threshold 2
        CouncilRegistry.Member[] memory members = new CouncilRegistry.Member[](3);
        members[0] = CouncilRegistry.Member(v1, council.ROLE_VERIFIER());
        members[1] = CouncilRegistry.Member(v2, council.ROLE_VERIFIER());
        members[2] = CouncilRegistry.Member(v3, council.ROLE_VERIFIER());
        CouncilRegistry.Thresholds memory th =
            CouncilRegistry.Thresholds({verifier: 2, approver: 2, governance: 2, dispute: 2, emergency: 1});
        vm.prank(governor);
        setId = council.registerSet(members, th, 0, 0);
        vm.prank(governor);
        council.scheduleActivation(setId);
        vm.warp(block.timestamp + council.MIN_ACTIVATION_DELAY());
        council.activatePendingSet();

        // artifacts + policy
        vm.startPrank(governor);
        artifacts.registerCircuit(
            CIRCUIT_ID, ARTIFACT_DIGEST, VK_DIGEST, keccak256("ultrahonk:noir-recursive-no-zk"), 0, 0
        );
        artifacts.registerPolicy(
            POLICY_ID,
            POLICY_DIGEST,
            keccak256("codebook"),
            keccak256("source"),
            keccak256("audit"),
            keccak256("container"),
            0,
            0
        );
        artifacts.setCompatibility(POLICY_ID, CIRCUIT_ID, true);
        vm.stopPrank();
    }

    // ---- helpers -----------------------------------------------------------

    function _header(bytes32 claimId, bytes32 nullifier)
        internal
        view
        returns (ClaimAttestationRegistry.ClaimHeader memory)
    {
        return ClaimAttestationRegistry.ClaimHeader({
            claimId: claimId,
            claimSeriesId: keccak256("series.1"),
            claimVersion: 1,
            bundleDigest: keccak256("bundle.1"),
            bundleRefDigest: keccak256("bundleRef.1"),
            publicInputDigest: keccak256("publicInputs.1"),
            disclosureNullifier: nullifier,
            circuitId: CIRCUIT_ID,
            policyId: POLICY_ID,
            councilSetId: setId,
            issuerCompanyCode: 11,
            expiryEpoch: uint64(block.timestamp) + 1 days
        });
    }

    function _attest(ClaimAttestationRegistry.ClaimHeader memory h, uint256[] memory keys)
        internal
        view
        returns (ClaimAttestationRegistry.Attestation[] memory)
    {
        // sort by address ascending
        for (uint256 i = 0; i < keys.length; i++) {
            for (uint256 j = i + 1; j < keys.length; j++) {
                if (vm.addr(keys[j]) < vm.addr(keys[i])) {
                    (keys[i], keys[j]) = (keys[j], keys[i]);
                }
            }
        }
        ClaimAttestationRegistry.Attestation[] memory atts = new ClaimAttestationRegistry.Attestation[](keys.length);
        for (uint256 i = 0; i < keys.length; i++) {
            atts[i].verifier = vm.addr(keys[i]);
            atts[i].decision = 1;
            atts[i].reasonCode = 0;
            atts[i].nonce = i + 1;
            atts[i].issuedAt = uint64(block.timestamp);
            atts[i].deadline = uint64(block.timestamp) + 1 hours;
            bytes32 digest = claims.attestationDigest(h, atts[i]);
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(keys[i], digest);
            atts[i].signature = abi.encodePacked(r, s, v);
        }
        return atts;
    }

    function _twoKeys() internal pure returns (uint256[] memory) {
        uint256[] memory k = new uint256[](2);
        k[0] = V1_KEY;
        k[1] = V2_KEY;
        return k;
    }

    function _submitDefault() internal returns (bytes32 claimId) {
        claimId = keccak256("claim.1");
        claims.submitClaim(
            _header(claimId, keccak256("nul.1")), _attest(_header(claimId, keccak256("nul.1")), _twoKeys())
        );
    }

    // ---- council -----------------------------------------------------------

    function testCouncilActivationDelay() public {
        CouncilRegistry.Member[] memory m = new CouncilRegistry.Member[](1);
        m[0] = CouncilRegistry.Member(v1, council.ROLE_VERIFIER());
        CouncilRegistry.Thresholds memory th = CouncilRegistry.Thresholds(1, 1, 1, 1, 1);
        vm.prank(governor);
        uint256 sid = council.registerSet(m, th, 0, 0);
        vm.prank(governor);
        council.scheduleActivation(sid);
        vm.expectRevert(abi.encodeWithSelector(CouncilRegistry.ActivationNotDue.selector, sid));
        council.activatePendingSet();
    }

    function testIsActiveVerifier() public view {
        assert(council.isActiveMember(setId, v1, council.ROLE_VERIFIER()));
        assert(!council.isActiveMember(setId, vm.addr(OUTSIDER_KEY), council.ROLE_VERIFIER()));
        assertEq(council.thresholdFor(setId, council.ROLE_VERIFIER()), 2);
    }

    function testDuplicateMemberReverts() public {
        CouncilRegistry.Member[] memory m = new CouncilRegistry.Member[](2);
        m[0] = CouncilRegistry.Member(v1, 1);
        m[1] = CouncilRegistry.Member(v1, 1);
        vm.prank(governor);
        vm.expectRevert(abi.encodeWithSelector(CouncilRegistry.DuplicateMember.selector, v1));
        council.registerSet(m, CouncilRegistry.Thresholds(1, 1, 1, 1, 1), 0, 0);
    }

    // ---- claim submission ---------------------------------------------------

    function testSubmitClaimHappyPath() public {
        bytes32 claimId = _submitDefault();
        assert(claims.isClaimActive(claimId));
        (ClaimAttestationRegistry.ClaimStatus s,,,, bytes32 bundle,) = claims.claims(claimId);
        assertEq(uint8(s), uint8(ClaimAttestationRegistry.ClaimStatus.ACTIVE));
        assertEq(bundle, keccak256("bundle.1"));
    }

    function testThreeOfThreeAlsoPasses() public {
        uint256[] memory k = new uint256[](3);
        k[0] = V1_KEY;
        k[1] = V2_KEY;
        k[2] = V3_KEY;
        bytes32 claimId = keccak256("claim.3of3");
        ClaimAttestationRegistry.ClaimHeader memory h = _header(claimId, keccak256("nul.3"));
        claims.submitClaim(h, _attest(h, k));
        assert(claims.isClaimActive(claimId));
    }

    function testQuorumNotMetWithOneSigner() public {
        uint256[] memory k = new uint256[](1);
        k[0] = V1_KEY;
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, k);
        vm.expectRevert(ClaimAttestationRegistry.QuorumNotMet.selector);
        claims.submitClaim(h, atts);
    }

    function testDuplicateSignerReverts() public {
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        // duplicate first attestation (same signer twice, still sorted-equal)
        atts[1] = atts[0];
        vm.expectRevert(ClaimAttestationRegistry.SignersNotSorted.selector);
        claims.submitClaim(h, atts);
    }

    function testUnsortedSignersRevert() public {
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        (atts[0], atts[1]) = (atts[1], atts[0]);
        vm.expectRevert(ClaimAttestationRegistry.SignersNotSorted.selector);
        claims.submitClaim(h, atts);
    }

    function testNonVerifierSignerReverts() public {
        uint256[] memory k = new uint256[](2);
        k[0] = V1_KEY;
        k[1] = OUTSIDER_KEY;
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, k);
        vm.expectRevert(ClaimAttestationRegistry.NotVerifier.selector);
        claims.submitClaim(h, atts);
    }

    function testExpiredAttestationReverts() public {
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        atts[0].deadline = uint64(block.timestamp) - 1;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(V1_KEY, claims.attestationDigest(h, atts[0]));
        atts[0].signature = abi.encodePacked(r, s, v);
        vm.expectRevert(ClaimAttestationRegistry.AttestationExpired.selector);
        claims.submitClaim(h, atts);
    }

    function testRejectDecisionReverts() public {
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        atts[0].decision = 2;
        vm.expectRevert(ClaimAttestationRegistry.BadDecision.selector);
        claims.submitClaim(h, atts);
    }

    function testWrongDomainSignatureReverts() public {
        // sign the attestation digest under a *different* verifying contract:
        // deploy a second claims registry and sign against its domain.
        ClaimAttestationRegistry other =
            new ClaimAttestationRegistry(address(manager), address(council), address(artifacts));
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        bytes32 wrongDigest = other.attestationDigest(h, atts[0]);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(V1_KEY, wrongDigest);
        atts[0].signature = abi.encodePacked(r, s, v);
        vm.expectRevert(ClaimAttestationRegistry.BadSignature.selector);
        claims.submitClaim(h, atts);
    }

    function testClaimIdReuseReverts() public {
        bytes32 claimId = _submitDefault();
        ClaimAttestationRegistry.ClaimHeader memory h = _header(claimId, keccak256("nul.2"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        vm.expectRevert(ClaimAttestationRegistry.ClaimExists.selector);
        claims.submitClaim(h, atts);
    }

    function testNullifierReuseReverts() public {
        _submitDefault();
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("claim.2"), keccak256("nul.1"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        vm.expectRevert(ClaimAttestationRegistry.NullifierUsed.selector);
        claims.submitClaim(h, atts);
    }

    function testExpiredClaimHeaderReverts() public {
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        h.expiryEpoch = uint64(block.timestamp);
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        vm.expectRevert(ClaimAttestationRegistry.ClaimExpiredErr.selector);
        claims.submitClaim(h, atts);
    }

    function testInactiveCircuitReverts() public {
        vm.prank(governor);
        artifacts.setCircuitStatus(CIRCUIT_ID, ArtifactPolicyRegistry.Status.PAUSED);
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        vm.expectRevert(ClaimAttestationRegistry.InactiveArtifact.selector);
        claims.submitClaim(h, atts);
    }

    function testIncompatiblePolicyReverts() public {
        vm.prank(governor);
        artifacts.setCompatibility(POLICY_ID, CIRCUIT_ID, false);
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        vm.expectRevert(ClaimAttestationRegistry.IncompatiblePolicy.selector);
        claims.submitClaim(h, atts);
    }

    function testPauseBlocksSubmissionButNotRevocation() public {
        bytes32 claimId = _submitDefault();
        vm.prank(guardian);
        claims.pause();
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("claim.x"), keccak256("nul.x"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        vm.expectRevert();
        claims.submitClaim(h, atts);
        vm.prank(guardian);
        claims.revokeClaim(claimId, 7);
        assert(!claims.isClaimActive(claimId));
    }

    // ---- lifecycle ------------------------------------------------------------

    function testRevokeAndTerminalState() public {
        bytes32 claimId = _submitDefault();
        vm.prank(guardian);
        claims.revokeClaim(claimId, 1);
        vm.prank(guardian);
        vm.expectRevert(ClaimAttestationRegistry.AlreadyTerminal.selector);
        claims.invalidateClaim(claimId, 2);
    }

    function testSupersede() public {
        bytes32 oldId = _submitDefault();
        bytes32 newId = keccak256("claim.new");
        ClaimAttestationRegistry.ClaimHeader memory h2 = _header(newId, keccak256("nul.new"));
        claims.submitClaim(h2, _attest(h2, _twoKeys()));
        vm.prank(guardian);
        claims.supersedeClaim(oldId, newId);
        assert(!claims.isClaimActive(oldId));
        assertEq(claims.supersededBy(oldId), newId);
    }

    function testUnauthorizedRevokeReverts() public {
        bytes32 claimId = _submitDefault();
        vm.prank(vm.addr(OUTSIDER_KEY));
        vm.expectRevert();
        claims.revokeClaim(claimId, 1);
    }

    // ---- endorsement ------------------------------------------------------------

    function _endorsementHeader(bytes32 endorsementId, bytes32 target, uint64 endorser, bytes32 nul)
        internal
        view
        returns (EndorsementRegistry.EndorsementHeader memory)
    {
        return EndorsementRegistry.EndorsementHeader({
            endorsementId: endorsementId,
            targetClaimId: target,
            bundleDigest: keccak256("ebundle"),
            publicInputDigest: keccak256("epub"),
            endorsementNullifier: nul,
            circuitId: CIRCUIT_ID,
            policyId: POLICY_ID,
            councilSetId: setId,
            endorserCompanyCode: endorser,
            expiryEpoch: uint64(block.timestamp) + 1 days,
            matchBandCode: 3
        });
    }

    function _eAttest(EndorsementRegistry.EndorsementHeader memory h, uint256[] memory keys)
        internal
        view
        returns (EndorsementRegistry.Attestation[] memory)
    {
        for (uint256 i = 0; i < keys.length; i++) {
            for (uint256 j = i + 1; j < keys.length; j++) {
                if (vm.addr(keys[j]) < vm.addr(keys[i])) {
                    (keys[i], keys[j]) = (keys[j], keys[i]);
                }
            }
        }
        EndorsementRegistry.Attestation[] memory atts = new EndorsementRegistry.Attestation[](keys.length);
        for (uint256 i = 0; i < keys.length; i++) {
            atts[i].verifier = vm.addr(keys[i]);
            atts[i].decision = 1;
            atts[i].reasonCode = 0;
            atts[i].nonce = i + 1;
            atts[i].issuedAt = uint64(block.timestamp);
            atts[i].deadline = uint64(block.timestamp) + 1 hours;
            bytes32 digest = endorsements.attestationDigest(h, atts[i]);
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(keys[i], digest);
            atts[i].signature = abi.encodePacked(r, s, v);
        }
        return atts;
    }

    function testEndorsementHappyPath() public {
        bytes32 target = _submitDefault();
        EndorsementRegistry.EndorsementHeader memory h =
            _endorsementHeader(keccak256("endo.1"), target, 22, keccak256("enul.1"));
        endorsements.submitEndorsement(h, _eAttest(h, _twoKeys()));
        assertEq(endorsements.endorsementCount(target), 1);
    }

    function testEndorserIsOriginReverts() public {
        bytes32 target = _submitDefault();
        EndorsementRegistry.EndorsementHeader memory h = _endorsementHeader(
            keccak256("endo.2"),
            target,
            11, // == issuer
            keccak256("enul.2")
        );
        EndorsementRegistry.Attestation[] memory atts = _eAttest(h, _twoKeys());
        vm.expectRevert(EndorsementRegistry.EndorserIsOrigin.selector);
        endorsements.submitEndorsement(h, atts);
    }

    function testDuplicateEndorserReverts() public {
        bytes32 target = _submitDefault();
        EndorsementRegistry.EndorsementHeader memory h =
            _endorsementHeader(keccak256("endo.3"), target, 22, keccak256("enul.3"));
        endorsements.submitEndorsement(h, _eAttest(h, _twoKeys()));
        EndorsementRegistry.EndorsementHeader memory h2 =
            _endorsementHeader(keccak256("endo.4"), target, 22, keccak256("enul.4"));
        EndorsementRegistry.Attestation[] memory atts = _eAttest(h2, _twoKeys());
        vm.expectRevert(EndorsementRegistry.EndorserAlreadyEndorsed.selector);
        endorsements.submitEndorsement(h2, atts);
    }

    function testEndorsementOnInactiveTargetReverts() public {
        EndorsementRegistry.EndorsementHeader memory h =
            _endorsementHeader(keccak256("endo.5"), keccak256("no.such.claim"), 22, keccak256("enul.5"));
        EndorsementRegistry.Attestation[] memory atts = _eAttest(h, _twoKeys());
        vm.expectRevert(EndorsementRegistry.TargetNotActive.selector);
        endorsements.submitEndorsement(h, atts);
    }

    function testCorroboration() public {
        bytes32 target = _submitDefault();
        EndorsementRegistry.EndorsementHeader memory h1 =
            _endorsementHeader(keccak256("e1"), target, 22, keccak256("en1"));
        endorsements.submitEndorsement(h1, _eAttest(h1, _twoKeys()));
        assert(!endorsements.isCorroborated(target));
        EndorsementRegistry.EndorsementHeader memory h2 =
            _endorsementHeader(keccak256("e2"), target, 33, keccak256("en2"));
        endorsements.submitEndorsement(h2, _eAttest(h2, _twoKeys()));
        assert(endorsements.isCorroborated(target));
    }

    // ---- disputes ----------------------------------------------------------------

    function testDisputeOpenResolveRevoke() public {
        bytes32 claimId = _submitDefault();
        vm.prank(governor);
        disputes.openDispute(claimId, 3, keccak256("evidence"));
        vm.prank(governor);
        disputes.resolveDispute(claimId, 9, keccak256("resolution"), DisputeLifecycleRegistry.ResolutionAction.REVOKE);
        assert(!claims.isClaimActive(claimId));
        assertEq(uint8(disputes.disputeStatus(claimId)), uint8(DisputeLifecycleRegistry.DisputeStatus.RESOLVED));
    }

    function testDisputeAppealFlow() public {
        bytes32 claimId = _submitDefault();
        vm.startPrank(governor);
        disputes.openDispute(claimId, 3, keccak256("evidence"));
        disputes.resolveDispute(claimId, 9, keccak256("resolution"), DisputeLifecycleRegistry.ResolutionAction.NONE);
        disputes.appealDispute(claimId, keccak256("appealRef"));
        vm.stopPrank();
        assert(claims.isClaimActive(claimId));
        assertEq(uint8(disputes.disputeStatus(claimId)), uint8(DisputeLifecycleRegistry.DisputeStatus.APPEALED));
    }

    function testOpenDisputeUnknownClaimReverts() public {
        vm.prank(governor);
        vm.expectRevert(DisputeLifecycleRegistry.ClaimUnknown.selector);
        disputes.openDispute(keccak256("ghost"), 1, keccak256("e"));
    }

    // ---- fuzz ---------------------------------------------------------------------

    function testFuzzSortedUniqueEnforced(uint8 dup) public {
        ClaimAttestationRegistry.ClaimHeader memory h = _header(keccak256("c"), keccak256("n"));
        ClaimAttestationRegistry.Attestation[] memory atts = _attest(h, _twoKeys());
        if (dup % 2 == 0) (atts[0], atts[1]) = (atts[1], atts[0]);
        if (dup % 2 == 0) {
            vm.expectRevert(ClaimAttestationRegistry.SignersNotSorted.selector);
        }
        claims.submitClaim(h, atts);
    }
}
