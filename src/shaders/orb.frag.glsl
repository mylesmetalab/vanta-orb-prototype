varying float vAlpha;
uniform float uOpacity;
uniform vec3 uColor;
void main(){
  float d = length(gl_PointCoord - vec2(0.5));
  if(d > 0.45) discard;
  float a = smoothstep(0.45, 0.38, d) * vAlpha * uOpacity;
  gl_FragColor = vec4(uColor, a);
}
