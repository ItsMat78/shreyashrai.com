---
title: FDTD / DMD wave simulation
blurb: "An electromagnetic wave simulation sped up ~10× using Dynamic Mode Decomposition."
outcome: "~10× speedup over direct FDTD at ~96% accuracy, via Dynamic Mode Decomposition."
tech: ["Python", "NumPy", "DMD"]
order: 5
---

An FDTD electromagnetic wave simulation sped up roughly 10× by replaying the
field's dominant modes with Dynamic Mode Decomposition instead of stepping
the full grid.
