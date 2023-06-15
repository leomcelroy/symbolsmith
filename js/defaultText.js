export const basicSetup = ` // drop in SVGs
const { scale, translate, rotate, originate } = geo;
const { Turtle, Nos } = art; 

const final = [];

final.push(path([7.407, 6.255], [ "cubic", [3.409, 11.182], [3.328, 8.557], [3.247, 5.932] ], [0.945, 3.509],));

scale(final, .3);
originate(final);
translate(final, pt(0.654, 9.168))

renderShape({
  shape: final,
  stroke: "black",
  fill: "none"
});

setWorkarea({
  x: [ 0, 8.5 ],
  y: [ 0, 11 ]
});



`

export const defaultText = basicSetup;
