function fract(x) { return x - Math.floor(x); }
function hash(n) { return fract(Math.sin(n * 127.1) * 43758.5453); }

function valueNoise(t) {
  const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f);
  return hash(i) * (1 - u) + hash(i + 1) * u;
}

export function fbm(t, octaves = 5) {
  let v = 0, a = 0.5, f = 1;
  for (let o = 0; o < octaves; o++) {
    v += a * valueNoise(t * f);
    f *= 2.17;
    a *= 0.48;
  }
  return v;
}
