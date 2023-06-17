////////////////////////////////////////////////////////////////
// Poisson-Disc utility code. Created by Reinder Nijhoff 2019
// https://turtletoy.net/turtle/b5510898dc
////////////////////////////////////////////////////////////////

export function PoissonDiscGrid(radius) {
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