// @version: v0.1.0
 // drop in SVGs
const { 
  turnForward,
  vec,
  close,
  translate,
  rotate,
  scale,
  originate,
  goTo,
  reverse,
  thicken,
  copyPaste,
  offset,
  offset2,
  outline,
  expand,
  intersect,
  difference,
  union,
  xor,
  getAngle,
  extrema,
  getPoint,
  centroid,
  width,
  height,
  getPathData,
  pathD,
  arc,
  rectangle,
  circle,
  bezier,
  // path,
  applyFn,
  path2,
  boolean,
  convertPtType,
  transform
} = geo;

const { 
  Turtle, 
  noise, 
  Nos, 
  lerp, 
  randInRange, 
  rand, 
  randomIntFromRange 
} = art; 

const final = [];

const t = new Turtle();

t.arc(180, 3)
t.arc(-180, 3)
t.setAngle(203)
t.forward(6)
// console.log(t.start, t.end)
t.ptArrs();
console.log(t)
const tp = t.path;
offset2(tp, 1.6)


renderShape({
  shape: tp
})

setWorkarea({
  x: [0, 10],
  y: [0, 10]
})