uniform float uTime;
uniform float uAudioLevel;
uniform float uAudioBass;
uniform float uAudioTreble;
uniform float uBaseSpeed;
uniform float uReactivity;
uniform float uTurbulence;
uniform float uTurbFreq;
uniform float uTurbSpeed;
uniform float uSize;
uniform float uSizeContrast;
uniform float uSizeMax;
uniform float uBreathAmt;
uniform float uBreathSpeed;
uniform float uDrift;
uniform float uReactSpeed;
uniform float uReactTurb;
uniform float uReactSize;
uniform float uReactBass;
uniform float uReactRadius;
uniform float uReactScale;
uniform float uHollow;

attribute float aInclination;
attribute float aNode;
attribute float aPhase;
attribute float aSpeed;
attribute float aRadius;
attribute float aSize;
attribute float aDrift;

varying float vAlpha;

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main(){
  float audio = uAudioLevel * uReactivity;
  float bassBoost = uAudioBass * uReactivity * uReactBass;
  float drift = snoise(vec3(aDrift * 3.0, uTime * 0.15 * uDrift, 0.0)) * 0.3;
  float speed = uBaseSpeed * (aSpeed + drift) * (1.0 + audio * uReactSpeed + bassBoost);
  float breath = snoise(vec3(uTime * uBreathSpeed * 0.3, aDrift * 2.0, 0.0)) * uBreathAmt;
  float angle = aPhase + uTime * speed;
  vec3 pos = vec3(cos(angle), 0.0, sin(angle));
  float ci = cos(aInclination); float si = sin(aInclination);
  pos = vec3(pos.x, pos.y * ci - pos.z * si, pos.y * si + pos.z * ci);
  float cn = cos(aNode); float sn = sin(aNode);
  pos = vec3(pos.x * cn - pos.z * sn, pos.y, pos.x * sn + pos.z * cn);
  float turb = snoise(pos * uTurbFreq + uTime * uTurbSpeed) * uTurbulence * (1.0 + audio * uReactTurb);
  // Whole-orb radial expansion with voice ("atoms fly outside boundary")
  float radialKick = audio * uReactRadius;
  // Per-particle kick lets some atoms fly further than others
  float perParticleKick = radialKick * (0.6 + aDrift * 0.004);
  pos *= aRadius * (1.0 + breath + turb + perParticleKick);
  // Global scale pulse with voice — orb as a whole grows when speaking
  pos *= 1.0 + audio * uReactScale;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float atten = 200.0 / -mv.z;
  float depthFade = smoothstep(-5.0, -1.5, mv.z);
  float pSize = 0.03 + pow(aSize, uSizeContrast) * uSizeMax;
  gl_PointSize = max(uSize * pSize * atten * depthFade * (1.0 + audio * uReactSize), 0.3);
  vAlpha = 0.75 + depthFade * 0.25;
  // Hollow the camera-facing center so the orb reads as a sphere shell.
  // Fade particles whose screen-projected position is near center.
  vec2 ndc = gl_Position.xy / max(gl_Position.w, 0.0001);
  float centerDist = length(ndc);
  float hole = uHollow * (1.0 - smoothstep(0.0, 0.55, centerDist));
  vAlpha *= 1.0 - hole;
}
