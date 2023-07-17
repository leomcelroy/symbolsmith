let jsr = 69;

export function rand() {
  const max = 4294967295;
  jsr ^= (jsr<<17);
  jsr ^= (jsr>>>13);
  jsr ^= (jsr<<5);
  return (jsr>>>0)/max;
}

function isect_circ_line(cx,cy,r,x0,y0,x1,y1){
  //https://stackoverflow.com/a/1084899
  let dx = x1-x0;
  let dy = y1-y0;
  let fx = x0-cx;
  let fy = y0-cy;
  let a = dx*dx+dy*dy;
  let b = 2*(fx*dx+fy*dy);
  let c = (fx*fx+fy*fy)-r*r;
  let discriminant = b*b-4*a*c;
  if (discriminant<0){
    return null;
  }
  discriminant = Math.sqrt(discriminant);
  let t0 = (-b - discriminant)/(2*a);
  if (0 <= t0 && t0 <= 1){
    return t0;
  }
  let t = (-b + discriminant)/(2*a);
  if (t > 1 || t < 0){
    return null;
  }
  return t;
}

function resample(polyline,step){
  if (polyline.length < 2){
    return polyline.slice();
  }
  polyline = polyline.slice();
  let out = [polyline[0].slice()];
  let next = null;
  let i = 0;
  while(i < polyline.length-1){
    let a = polyline[i];
    let b = polyline[i+1];
    let dx = b[0]-a[0];
    let dy = b[1]-a[1];
    let d = Math.sqrt(dx*dx+dy*dy);
    if (d == 0){
      i++;
      continue;
    }
    let n = ~~(d/step);
    let rest = (n*step)/d;
    let rpx = a[0] * (1-rest) + b[0] * rest;
    let rpy = a[1] * (1-rest) + b[1] * rest;
    for (let j = 1; j <= n; j++){
      let t = j/n;
      let x = a[0]*(1-t) + rpx*t;
      let y = a[1]*(1-t) + rpy*t;
      let xy = [x,y];
      for (let k = 2; k < a.length; k++){
        xy.push(a[k]*(1-t) + (a[k] * (1-rest) + b[k] * rest)*t);
      }
      out.push(xy);
    }

    next = null;
    for (let j = i+2; j < polyline.length; j++){
      let b = polyline[j-1];
      let c = polyline[j];
      if (b[0] == c[0] && b[1] == c[1]){
        continue;
      }
      let t = isect_circ_line(rpx,rpy,step,b[0],b[1],c[0],c[1]);
      if (t == null){
        continue;
      }
 
      let q = [
        b[0]*(1-t)+c[0]*t,
        b[1]*(1-t)+c[1]*t,
      ];
      for (let k = 2; k < b.length; k++){
        q.push(b[k]*(1-t)+c[k]*t);
      }
      out.push(q);
      polyline[j-1] = q;
      next = j-1;
      break;
    }
    if (next == null){
      break;
    }
    i = next;

  }

  if (out.length > 1){
    let lx = out[out.length-1][0];
    let ly = out[out.length-1][1];
    let mx = polyline[polyline.length-1][0];
    let my = polyline[polyline.length-1][1];
    let d = Math.sqrt((mx-lx)**2+(my-ly)**2);
    if (d < step*0.5){
      out.pop(); 
    }
  }
  out.push(polyline[polyline.length-1].slice());
  return out;
}

function seg_isect(p0x, p0y, p1x, p1y, q0x, q0y, q1x, q1y, is_ray = false) {
  let d0x = p1x - p0x;
  let d0y = p1y - p0y;
  let d1x = q1x - q0x;
  let d1y = q1y - q0y;
  let vc = d0x * d1y - d0y * d1x;
  if (vc == 0) {
    return null;
  }
  let vcn = vc * vc;
  let q0x_p0x = q0x - p0x;
  let q0y_p0y = q0y - p0y;
  let vc_vcn = vc / vcn;
  let t = (q0x_p0x * d1y - q0y_p0y * d1x) * vc_vcn;
  let s = (q0x_p0x * d0y - q0y_p0y * d0x) * vc_vcn;
  if (0 <= t && (is_ray || t < 1) && 0 <= s && s < 1) {
    let ret = {t, s, side: null, other: null, xy: null};
    ret.xy = [p1x * t + p0x * (1 - t), p1y * t + p0y * (1 - t)];
    ret.side = pt_in_pl(p0x, p0y, p1x, p1y, q0x, q0y) < 0 ? 1 : -1;
    return ret;
  }
  return null;
}
function pt_in_pl(x, y, x0, y0, x1, y1) {
  let dx = x1 - x0;
  let dy = y1 - y0;
  let e = (x - x0) * dy - (y - y0) * dx;
  return e;
}



function dist_transform(b,m,n) {
  // Meijster distance
  // adapted from https://github.com/parmanoir/Meijster-distance
  function EDT_f(x, i, g_i) {
    return (x - i) * (x - i) + g_i * g_i;
  }
  function EDT_Sep(i, u, g_i, g_u) {
    return Math.floor((u * u - i * i + g_u * g_u - g_i * g_i) / (2 * (u - i)));
  }
  // First phase
  let infinity = m + n;
  let g = new Array(m * n).fill(0);
  for (let x = 0; x < m; x++) {
    if (b[x + 0 * m]){
      g[x + 0 * m] = 0;
    }else{
      g[x + 0 * m] = infinity;
    }
    // Scan 1
    for (let y = 1; y < n; y++) {
      if (b[x + y * m]){
        g[x + y * m] = 0;
      }else{
        g[x + y * m] = 1 + g[x + (y - 1) * m];
      }
    }
    // Scan 2
    for (let y = n - 2; y >= 0; y--) {
      if (g[x + (y + 1) * m] < g[x + y * m]){
        g[x + y * m] = 1 + g[x + (y + 1) * m];
      }
    }
  }

  // Second phase
  let dt = new Array(m * n).fill(0);
  let s = new Array(m).fill(0);
  let t = new Array(m).fill(0);
  let q = 0;
  let w;
  for (let y = 0; y < n; y++) {
    q = 0;
    s[0] = 0;
    t[0] = 0;

    // Scan 3
    for (let u = 1; u < m; u++) {
      while (q >= 0 && EDT_f(t[q], s[q], g[s[q] + y * m]) > EDT_f(t[q], u, g[u + y * m])){
        q--;
      }
      if (q < 0) {
        q = 0;
        s[0] = u;
      } else {
        w = 1 + EDT_Sep(s[q], u, g[s[q] + y * m], g[u + y * m]);
        if (w < m) {
          q++;
          s[q] = u;
          t[q] = w;
        }
      }
    }
    // Scan 4
    for (let u = m - 1; u >= 0; u--) {
      let d = EDT_f(u, s[q], g[s[q] + y * m]);

      d = Math.floor(Math.sqrt(d));
      dt[u + y * m] = d;
      if (u == t[q]) q--;
    }
  }
  return dt;
}