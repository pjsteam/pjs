--- FUNCTION SOURCE (noise) id{0,0} ---
() {
                return Math.random() * 0.5 + 0.5;
            };
--- END ---
--- FUNCTION SOURCE (random) id{0,1} ---
(){
var a=(MathImul(18030,rngstate[0]&0xFFFF)+(rngstate[0]>>>16))|0;
rngstate[0]=a;
var b=(MathImul(36969,rngstate[1]&0xFFFF)+(rngstate[1]>>>16))|0;
rngstate[1]=b;
var c=((a<<16)+(b&0xFFFF))|0;
return(c<0?(c+0x100000000):c)*2.3283064365386962890625e-10;
}

--- END ---
INLINE (random) id{0,1} AS 1 AT <0:34>
--- FUNCTION SOURCE (colorDistance) id{1,0} ---
(scale, dest, src) {
                return clamp(scale * dest + (1 - scale) * src);
            };
--- END ---
--- FUNCTION SOURCE (clamp) id{2,0} ---
(component) {
                return Math.max(Math.min(255, component), 0);
            }
--- END ---
--- FUNCTION SOURCE () id{3,0} ---
(pixel
/**/) {

            function noise() {
                return Math.random() * 0.5 + 0.5;
            };

            function clamp(component) {
                return Math.max(Math.min(255, component), 0);
            }

            function colorDistance(scale, dest, src) {
                return clamp(scale * dest + (1 - scale) * src);
            };

            var r = pixel & 0xFF;
            var g = (pixel & 0xFF00) >> 8;
            var b = (pixel & 0xFF0000) >> 16;

            var new_r = colorDistance(noise(), (r * 0.393) + (g * 0.769) + (b * 0.189), r);
            var new_g = colorDistance(noise(), (r * 0.349) + (g * 0.686) + (b * 0.168), g);
            var new_b = colorDistance(noise(), (r * 0.272) + (g * 0.534) + (b * 0.131), b);

            return (pixel & 0xFF000000) + (new_b << 16) + (new_g << 8) + (new_r & 0xFF);
        
})
--- END ---
--- FUNCTION SOURCE (random) id{4,0} ---
(){
var a=(MathImul(18030,rngstate[0]&0xFFFF)+(rngstate[0]>>>16))|0;
rngstate[0]=a;
var b=(MathImul(36969,rngstate[1]&0xFFFF)+(rngstate[1]>>>16))|0;
rngstate[1]=b;
var c=((a<<16)+(b&0xFFFF))|0;
return(c<0?(c+0x100000000):c)*2.3283064365386962890625e-10;
}

--- END ---
--- FUNCTION SOURCE (colorDistance) id{5,0} ---
(scale, dest, src) {
                return clamp(scale * dest + (1 - scale) * src);
            };
--- END ---
--- FUNCTION SOURCE (clamp) id{6,0} ---
(component) {
                return Math.max(Math.min(255, component), 0);
            }
--- END ---
--- FUNCTION SOURCE (noise) id{7,0} ---
() {
                return Math.random() * 0.5 + 0.5;
            };
--- END ---
--- FUNCTION SOURCE (random) id{7,1} ---
(){
var a=(MathImul(18030,rngstate[0]&0xFFFF)+(rngstate[0]>>>16))|0;
rngstate[0]=a;
var b=(MathImul(36969,rngstate[1]&0xFFFF)+(rngstate[1]>>>16))|0;
rngstate[1]=b;
var c=((a<<16)+(b&0xFFFF))|0;
return(c<0?(c+0x100000000):c)*2.3283064365386962890625e-10;
}

--- END ---
INLINE (random) id{7,1} AS 1 AT <0:34>
--- FUNCTION SOURCE (module.exports) id{8,0} ---
(event){
  var pack = event.data;
  var arg = pack.arg;
  var code = pack.code;
  /*jslint evil: true */
  var f = new Function(arg, code);
  var array = createTypedArray(pack.elementsType, pack.buffer);

  var i = array.length;
  for ( ; i--; ){
    array[i] = f(array[i]);
  }
  return {
    message: {
      index: pack.index,
      value: array.buffer
    },
    transferables: [ array.buffer ]
  };
};
--- END ---
[deoptimizing (DEOPT soft): begin 0x1b16b00fc969 module.exports (opt #8) @19, FP to SP delta: 168]
            ;;; deoptimize at <0:318> deoptimize: Insufficient type feedback for generic named access
  translating module.exports => node=140, height=48
    0x1184c0710: [top + 88] <- 0x1b16b00f6781 ; [sp + 8] 0x1b16b00f6781 <JS Global Object>
    0x1184c0708: [top + 80] <- 0x1b16b0004121 <undefined> ; literal
    0x1184c0700: [top + 72] <- 0x8543136468c ; caller's pc
    0x1184c06f8: [top + 64] <- 0x1184c0738 ; caller's fp
    0x1184c06f0: [top + 56] <- 0x1b16b00fbde1 ; [sp + 16] 0x1b16b00fbde1 <FixedArray[5]>
    0x1184c06f0: [top + 56] <- 0x1b16b00fbde1; context
    0x1184c06e8: [top + 48] <- 0x1b16b00fc969; function
    0x1184c06e0: [top + 40] <- 0x5a86f905401 ; [sp + 24] 0x5a86f905401 <an Object with map 0x756f9b0cde9>
    0x1184c06d8: [top + 32] <- 0x1b16b0004121 <undefined> ; literal
    0x1184c06d0: [top + 24] <- 0x1b16b0004121 <undefined> ; literal
    0x1184c06c8: [top + 16] <- 0x1b16b0004121 <undefined> ; literal
    0x1184c06c0: [top + 8] <- 0x5a86f9053a9 ; [sp + 40] 0x5a86f9053a9 <an Uint32Array with map 0x756f9b0acb9>
    0x1184c06b8: [top + 0] <- 0x1b16b0004121 <undefined> ; literal
[deoptimizing (soft): end 0x1b16b00fc969 module.exports @19 => node=140, pc=0x85431364996, state=NO_REGISTERS, alignment=no padding, took 0.150 ms]
