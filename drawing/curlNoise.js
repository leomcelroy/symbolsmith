// Curl Noise. Created by Reinder Nijhoff 2021 - @reindernijhoff
//
// https://turtletoy.net/turtle/740f09b88c
//

const turtle = new Turtle();
turtle.degrees(Math.PI * 2);
turtle.traveled = 0;

const seed = 69; // min=1, max=100, step=1
const radius = 1.3; // min=0.1, max=5, step=0.01
const maxPathLength = 50;  // min=1, max=100, step=0.1
const frequency = 2; //min=.1, max=10, step=.01
const maxTries = 1000;

const noise = new SimplexNoise(seed);
const grid  = new PoissonDiscGrid(radius);

function fbm(x, y) {
    x *= frequency / 1000;
    y *= frequency / 1000;
    let f = 1., v = 0.;
    for (let i=0; i<3; i++) {
        v += noise.noise2D([x * f, y * f]) / f;
        f *= 2; x += 32;
    }
    return v;
}

function curlNoise(x, y) {
    const eps = 0.01;
    
    const dx = (fbm(x, y + eps) - fbm(x, y - eps))/(2 * eps);
    const dy = (fbm(x + eps, y) - fbm(x - eps, y))/(2 * eps);
    
    const l = Math.hypot(dx, dy) / radius * .99;
    return [dx / l, -dy / l]; 
}

function walk(i) {
    const p = turtle.pos();

    const curl = curlNoise(p[0], p[1]);
    const dest = [p[0]+curl[0], p[1]+curl[1]];
    
    if (turtle.traveled < maxPathLength && Math.abs(dest[0]) < 110 && Math.abs(dest[1]) < 110 && grid.insert(dest)) {
        turtle.goto(dest);
        turtle.traveled += Math.hypot(curl[0], curl[1]);
    } else {
        turtle.traveled = 0;
        let r, i = 0;
        do { 
            r =[Math.random()*200-100, Math.random()*200-100];
            i ++;
        } while(!grid.insert(r) && i < maxTries);
        if (i >= maxTries) {
            return false;
        }
        turtle.jump(r);
    }
    return true;
}

////////////////////////////////////////////////////////////////
// Simplex Noise utility code. Created by Reinder Nijhoff 2020
// https://turtletoy.net/turtle/6e4e06d42e
// Based on: http://webstaff.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
////////////////////////////////////////////////////////////////
function SimplexNoise(seed = 1) {
  const grad = [  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
                [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
                [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1] ];
  const perm = new Uint8Array(512);
                
  const F2 = (Math.sqrt(3) - 1) / 2, F3 = 1/3;
  const G2 = (3 - Math.sqrt(3)) / 6, G3 = 1/6;

  const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
  const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

  class SimplexNoise {
    constructor(seed = 1) {
      for (let i = 0; i < 512; i++) {
        perm[i] = i & 255;
      }
      for (let i = 0; i < 255; i++) {
        const r = (seed = this.hash(i+seed)) % (256 - i)  + i;
        const swp = perm[i];
        perm[i + 256] = perm[i] = perm[r];
        perm[r + 256] = perm[r] = swp;
      }
    }
    noise2D(p) {
      const s = dot2(p, [F2, F2]);
      const c = [Math.floor(p[0] + s), Math.floor(p[1] + s)];
      const i = c[0] & 255, j = c[1] & 255;
      const t = dot2(c, [G2, G2]);

      const p0 = sub2(p, sub2(c, [t, t]));
      const o  = p0[0] > p0[1] ? [1, 0] : [0, 1];
      const p1 = sub2(sub2(p0, o), [-G2, -G2]);
      const p2 = sub2(p0, [1-2*G2, 1-2*G2]);
      
      let n =  Math.max(0, 0.5-dot2(p0, p0))**4 * dot2(grad[perm[i+perm[j]] % 12], p0);
          n += Math.max(0, 0.5-dot2(p1, p1))**4 * dot2(grad[perm[i+o[0]+perm[j+o[1]]] % 12], p1);
          n += Math.max(0, 0.5-dot2(p2, p2))**4 * dot2(grad[perm[i+1+perm[j+1]] % 12], p2);
      
      return 70 * n;
    }
    hash(i) {
            i = 1103515245 * ((i >> 1) ^ i);
            const h32 = 1103515245 * (i ^ (i>>3));
            return h32 ^ (h32 >> 16);
    }
  }
  return new SimplexNoise(seed);
}


////////////////////////////////////////////////////////////////
// Poisson-Disc utility code. Created by Reinder Nijhoff 2019
// https://turtletoy.net/turtle/b5510898dc
////////////////////////////////////////////////////////////////
function PoissonDiscGrid(radius) {
    class PoissonDiscGrid {
        constructor(radius) {
            this.cellSize = 1/Math.sqrt(2)/radius;
            this.radius2 = radius*radius;
            this.cells = [];
        }
        insert(p) {
            const x = p[0]*this.cellSize|0, y=p[1]*this.cellSize|0;
            for (let xi = x-1; xi<=x+1; xi++) {
                for (let yi = y-1; yi<=y+1; yi++) {
                    const ps = this.cell(xi,yi);
                    for (let i=0; i<ps.length; i++) {
                        if ((ps[i][0]-p[0])**2 + (ps[i][1]-p[1])**2 < this.radius2) {
                            return false;
                        }
                    }
                }       
            }
            this.cell(x, y).push(p);
            return true;
        }
        cell(x,y) {
            const c = this.cells;
            return (c[x]?c[x]:c[x]=[])[y]?c[x][y]:c[x][y]=[];
        }
    }
    return new PoissonDiscGrid(radius);
}