export function applyFn(shape, fn) {
  shape.forEach((pl, i) => {
    pl.forEach((pt, i) => {
      const [ newX, newY ] = fn(pt);
      pt[0] = newX;
      pt[1] = newY;
    })
  })

  return shape;
}
