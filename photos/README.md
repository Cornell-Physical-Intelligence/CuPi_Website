# Roster photography

Two sets, deliberately kept apart.

`photos/full/` holds the **whole source frame** for each person, one WebP per roster
`imageBase`, long edge 2560px. Nothing on the site loads these. They exist so the
crops can be regenerated without going back to anyone's Downloads folder — which is
exactly the situation that lost Josh Lennon's original.

`src/assets/people/` holds the **crops the site actually serves**, 600x680. Cards
render at roughly 130 CSS px, so this still covers a 3x display with room to spare,
and it is a quarter the weight of the 960x1088 set it replaced. Vite content-hashes
these on build, so replacing one can never be served stale from a cache.

## How the crops are framed

Every non-faculty photo is cropped so that:

- **Shoulders are centred** horizontally on their midpoint, not on the nose, which a
  turned head pulls off-axis.
- **Shoulders sit on one common line** at 0.616 of frame height, within ~7px.

Scale is *not* normalised per person. An earlier pass scaled each photo by iris
diameter to cancel the ~10% camera-distance spread in the shoot, which is
defensible in principle but over-corrected in practice: iris size varies between
people too, so anyone with genuinely small irises got zoomed as though they had
merely stood further back. Scale is therefore left as shot.

Each person instead keeps their **own** previous crop window, recovered by measuring
how large the iris was in the old crop. That window is shrunk only as far as that
particular photo needs in order to bring its shoulder line within tolerance. A single
uniform window would have been 1.13x tighter than the old framing across the board;
per-person it averages about 1.02x.

**The height of the line matters more than it looks.** The old crops used nearly the
full source height, so they carry very little slack, and a crop with no slack cannot
be slid anywhere — so the choice of line decides how much anyone has to be cropped in
to reach it. At 0.601, the average of the old crops, the people whose shoulders sit
lowest in their source had to crop 1.20x tighter. 0.616 is the minimax choice: it
minimises the worst case (1.15x) and very nearly minimises the average. Allowing the
line to drift instead was tried and is worse — people scatter to opposite edges of the
tolerance band, so the visible spread doubles.

**Three deliberate exceptions.** Alan, Mic and Ollie were framed noticeably closer
than the rest — 1.17x, 1.38x and 1.25x the roster's median apparent size, measured by
iris width. For those three, size takes priority over the line: their crops are opened
to the widest their sources permit, which costs them 21px, 55px and 28px of shoulder
alignment respectively. Everyone else remains on the line.

Even wide open they cannot quite reach the median — their photos are simply shot or
cropped closer than the others. Mic is the extreme case. Re-exporting Mic's and
Ollie's photos with more room below the chest would let them match on both counts.

Claire sits at a softer version of the same ceiling: her window tops out 4px from the
frame edge, so on the line she can only zoom out ~1.5% past her original framing —
already applied. Anything wider needs sky her source was never shot with.

The two faculty portraits keep their own framing — they come from a different shoot,
are much looser, and sit well below the line. They are 1024x1024 squares, so they are
cropped to the card's aspect rather than resized to it; resizing a square to 600x680
stretches the face.
