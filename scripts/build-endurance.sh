#!/usr/bin/env sh
# Rebuilds public/models/endurance.glb from assets/endurance-source.glb.
#
# The source is 21MB, 492 nodes and 310 separate mesh primitives. Those
# primitives were the single biggest cost in the scene: the Experience section
# is draw-call bound, not fill bound (measured — dropping the device pixel
# ratio from 2 to 0.4 moved the frame by under 2ms, while removing draw calls
# moved it by 7ms), so the craft was costing ~370 draw calls a frame.
#
#   flatten  bakes each node's transform into its geometry, so the hierarchy
#            can be collapsed. Safe here because the craft is rigid and spins
#            as one group, and the tether anchor is a measured constant in
#            model space rather than a node lookup.
#   join     merges primitives that share a material: 310 -> 25.
#   webp     re-encodes the seven textures.
#   meshopt  quantises and compresses vertex data.
#
# Verified against the unjoined model with the ring rotation pinned, at the
# same scroll position: no visible difference.
#
# Costs 2.87MB -> 5.25MB, because merged primitives can no longer share vertex
# buffers between repeated modules. That is a one-time download behind the
# hero, traded for ~290 fewer draw calls on every frame of the section.
set -e
cd "$(dirname "$0")/.."
TMP="$(mktemp -d)"
npx @gltf-transform/cli flatten assets/endurance-source.glb "$TMP/a.glb"
npx @gltf-transform/cli join    "$TMP/a.glb" "$TMP/b.glb"
npx @gltf-transform/cli webp    "$TMP/b.glb" "$TMP/c.glb"
npx @gltf-transform/cli meshopt "$TMP/c.glb" public/models/endurance.glb
rm -rf "$TMP"
