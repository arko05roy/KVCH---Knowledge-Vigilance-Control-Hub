// kvch_merkle: fixed-depth binary Merkle tree over the pinned Poseidon2 sponge.
// Arity 2, empty leaf = 0, depth = MERKLE_DEPTH (10, max 1024 leaves).
// Path index order: little-endian bits, bit i selects position at level i.
use kvch_commitments::{poseidon2, EvidenceLeaf, TAG_MERKLE_NODE};
use kvch_encoding::MERKLE_DEPTH;

// Opening of one leaf plus the snapshot commitment fields it lives under.
pub struct EvidenceOpening {
    pub leaf: EvidenceLeaf,
    pub index_bits: [bool; MERKLE_DEPTH],
    pub siblings: [Field; MERKLE_DEPTH],
    pub selection_policy_code: u16,
    pub normalization_version_code: u16,
}

pub fn node_hash(left: Field, right: Field) -> Field {
    poseidon2([TAG_MERKLE_NODE, left, right])
}

// index_bits[i] = false -> node is the left child at level i; true -> right.

pub fn compute_root(
    leaf: Field,
    index_bits: [bool; MERKLE_DEPTH],
    siblings: [Field; MERKLE_DEPTH],
) -> Field {
    let mut node = leaf;
    for i in 0..MERKLE_DEPTH {
        let sib = siblings[i];
        node = if index_bits[i] {
            node_hash(sib, node)
        } else {
            node_hash(node, sib)
        };
    }
    node
}

pub fn assert_membership(
    expected_root: Field,
    leaf: Field,
    index_bits: [bool; MERKLE_DEPTH],
    siblings: [Field; MERKLE_DEPTH],
) {
    let root = compute_root(leaf, index_bits, siblings);
    assert(root == expected_root, "merkle membership failed");
}

// Number of trailing zero-hash levels for a tree holding leaf_count leaves.
// Leaves >= leaf_count are padded with EMPTY_LEAF by the caller (off-circuit
// builders pass a fully padded sibling path; the count is committed separately
// in the snapshot commitment to prevent padding ambiguity).
pub global EMPTY_LEAF: Field = 0;

mod tests {
    use super::{MERKLE_DEPTH, assert_membership, compute_root, node_hash};

    #[test]
    fn root_for_single_leaf() {
        // depth-10 tree, leaf at index 0, all siblings zero-equivalent pads.
        let leaf = node_hash(1, 2);
        let mut sibs: [Field; MERKLE_DEPTH] = [0; MERKLE_DEPTH];
        let mut pad = 0;
        for i in 0..MERKLE_DEPTH {
            sibs[i] = pad;
            pad = node_hash(pad, pad);
        }
        let bits: [bool; MERKLE_DEPTH] = [false; MERKLE_DEPTH];
        let root = compute_root(leaf, bits, sibs);
        assert(root != 0);
    }

    #[test(should_fail)]
    fn wrong_sibling_fails() {
        let leaf = node_hash(1, 2);
        let sibs: [Field; MERKLE_DEPTH] = [7; MERKLE_DEPTH];
        let bits: [bool; MERKLE_DEPTH] = [false; MERKLE_DEPTH];
        let root = compute_root(leaf, bits, sibs);
        assert_membership(root, leaf, bits, [8; MERKLE_DEPTH]);
    }
}
