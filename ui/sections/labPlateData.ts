import type { Plate } from "@/ui/PlateViewer";

/**
 * Plates from the CAVE Lab — what the motion-capture work looked like.
 *
 * Cut from one composite of lab photographs (public/experience/*.webp). The
 * white paper they were shot on is taken away, so the wearer, the avatar and
 * the boards stand on the site's own dark ground like the stones do; the Yoga
 * Studio is a screen and stays one.
 */

export const LAB_PLATES: Plate[] = [
  {
    id: "calibrate",
    code: "01",
    title: "Calibration",
    caption:
      "Arms out, suit on: every node is zeroed against the T-pose, and the avatar takes the same stance.",
    src: "/experience/calibrate.webp",
    width: 632,
    height: 279,
    alt: "The wearer in a T-pose with sensor straps on the arms, chest, waist and legs, beside a blue 3D avatar in the same pose.",
  },
  {
    id: "node",
    code: "02",
    title: "The node",
    caption:
      "One of the ten: the controller board with its charging circuit, and the MPU6050 motion sensor on its LiPo cell.",
    src: "/experience/node.webp",
    width: 386,
    height: 271,
    alt: "Two green circuit boards: a microcontroller board with USB-C and charging circuit, and an MPU6050 sensor board mounted on a LiPo battery.",
  },
  {
    id: "gait",
    code: "03",
    title: "Gait",
    caption:
      "A walk, reconstructed: sensor readings in, a whole skeleton out, frame after frame.",
    src: "/experience/gait.webp",
    width: 613,
    height: 338,
    alt: "Five frames of the blue avatar walking across a floor grid, reconstructed from the sensors.",
  },
  {
    id: "yoga",
    code: "04",
    title: "Yoga Studio",
    caption:
      "Built on the pipeline: a reference pose against the live one, scored joint by joint while the pose is held.",
    src: "/experience/yoga.webp",
    width: 891,
    height: 592,
    alt: "The Yoga Studio screen: a green reference avatar, the wearer, and the blue live avatar in tree pose, with overall accuracy 82%, a hold timer, and accuracy for nine joints.",
    screen: true,
  },
];
