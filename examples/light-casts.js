const {
  Turtle, Nos
} = art;

const circle = geo.circle(4);
geo.translate(circle, pt(7.688, 5.281));

let final = [ ...circle ];

function bulb(source, step, maxI) {
  for (let a = 0; a < 360; a+= 7) {
    const t = new Turtle({ x: source[0], y: source[1] });
    t.right(a);
    for (let i = 0; i < maxI; i++) {
      t.forward(step);
      const end = t.end;
      if (isPointInPolygon(end, circle[0])) {
        t.applyPts(pt => [pt.x, pt.y]);
        final.push(...t.path);
        break;
      }
    }
  }
}

bulb(pt(14.539, 8.069), 0.03, 1000);


const startPt = pt(0.884, 0.651);

cast(startPt, pt(6.129, 2.73), circle[0], 0.03, 1000);
cast(startPt, pt(6.176, 5.045), circle[0], 0.03, 1000);
cast(startPt, pt(6.507, 6.557), circle[0], 0.03, 1000);
cast(startPt, pt(7.31, 4.006), circle[0], 0.03, 1000);

function cast(start, end, polygon, step, iMax) {
  let intersection = findIntersection(start, end, polygon, step, iMax);
  if (!intersection) intersection = end;

  final.push([start, intersection]);
}

function findIntersection(start, end, polygon, step, iMax) {
    var direction = [end[0] - start[0], end[1] - start[1]];
    var magnitude = Math.sqrt(direction[0]*direction[0] + direction[1]*direction[1]);
    direction = [direction[0] / magnitude, direction[1] / magnitude];  // normalize

   var currentPoint = start;
   for (let i = 0; i < iMax; i++) {
      currentPoint = [currentPoint[0] + step * direction[0], currentPoint[1] + step * direction[1]];
     if (isPointInPolygon(currentPoint, polygon)) return currentPoint;
   }

    return null;  // Intersection point
}



function isPointInPolygon(point, polygon) {
  var x = point[0], y = point[1];

  var inside = false;
  for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      var xi = polygon[i][0], yi = polygon[i][1];
      var xj = polygon[j][0], yj = polygon[j][1];

      var intersect = ((yi > y) !== (yj > y)) &&
          (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
  }

  return inside;
};



final = final.filter(pl => pl.length > 1)

const finalWidth = 15.74015748031496;
const finalHeight = 10.05511811023622;

// geo.scale(final, -0.07);
// const cc = geo.getPoint(final, "cc");
// geo.translate(final, [finalWidth/2, finalHeight/2], cc);

const border = new Turtle();
border.forward(finalWidth);
border.right(-90);
border.forward(finalHeight);
border.right(-90);
border.forward(finalWidth);
border.right(-90);
border.forward(finalHeight);
// border.scale(.99);

border.applyPts(pt => [pt.x, pt.y]);

renderShape({
  shape: final
})

setWorkarea({
  x: [0, finalWidth],
  y: [0, finalHeight]
})
  
 