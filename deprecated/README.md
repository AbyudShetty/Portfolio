# Deprecated — the free-navigation chamber

These components implemented the Milestone 1 "measured test chamber" that the
user navigated with free camera movement (lateral drag + scroll dolly). The
portfolio moved to a scroll-driven cinematic space journey, which makes their
navigation model obsolete rather than merely restyled.

They are kept, not deleted, because several contain reasoning worth re-reading
when building later milestones:

| File | Why it is here | What was salvaged |
|---|---|---|
| `CameraRig.tsx` | Camera was driven by wheel delta and drag, not by scroll position | Spring/damp approach and the object-framing maths moved to `scene/ScrollCameraRig.tsx` |
| `SpatialField.tsx` | Canvas root built around the chamber scene graph | Canvas config, visibility pause, perf provider and dev handle moved to `scene/SpaceScene.tsx` |
| `ReferenceGrid.tsx` | The reference grid *is* the chamber metaphor | Domain marker idea may return in the Index |
| `Horizon.tsx` | A horizon only exists in a room with a floor | — |
| `ExperienceAnchor.tsx` | Tethered monolith on a base plate needs a ground plane | Five-axis differentiation logic informed `experience/ExperienceComposition.tsx` |
| `GlassDock.tsx` | Jumped between free-camera marks; navigation is now scroll | Glass/magnetic styling worth reusing when the real nav is built |
| `FieldKeyboardLayer.tsx` | Hidden focus list substituted for real page structure | Superseded by genuine DOM sections + `ui/ProjectList.tsx` |
| `MobileCoreSample.tsx` | "Core sample" depth ruler was a chamber reading | Superseded by `ui/MobileNarrative.tsx` |

Nothing here is imported by the application. Delete freely once later
milestones have settled.
