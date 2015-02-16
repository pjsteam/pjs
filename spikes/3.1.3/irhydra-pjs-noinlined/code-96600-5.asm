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
INLINE (random) id{0,1} AS 1 AT <0:33>
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
INLINE (random) id{7,1} AS 1 AT <0:33>
--- FUNCTION SOURCE (module.exports) id{8,0} ---
(event){
  var pack = event.data;
  var arg = pack.arg;
  var code = pack.code;
  console.log(code);
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
[deoptimizing (DEOPT soft): begin 0x35d7808fc969 module.exports (opt #8) @22, FP to SP delta: 184]
            ;;; deoptimize at <0:339> deoptimize: Insufficient type feedback for generic named access
  translating module.exports => node=155, height=48
    0x118699710: [top + 88] <- 0x35d7808f6781 ; [sp + 8] 0x35d7808f6781 <JS Global Object>
    0x118699708: [top + 80] <- 0x35d780804121 <undefined> ; literal
    0x118699700: [top + 72] <- 0x162c414647ec ; caller's pc
    0x1186996f8: [top + 64] <- 0x118699738 ; caller's fp
    0x1186996f0: [top + 56] <- 0x6e3d6609259 ; [sp + 16] 0x6e3d6609259 <FixedArray[5]>
    0x1186996f0: [top + 56] <- 0x6e3d6609259; context
    0x1186996e8: [top + 48] <- 0x35d7808fc969; function
    0x1186996e0: [top + 40] <- 0x6e3d6609a61 ; [sp + 24] 0x6e3d6609a61 <an Object with map 0xae6f5e0cde9>
    0x1186996d8: [top + 32] <- 0x35d780804121 <undefined> ; literal
    0x1186996d0: [top + 24] <- 0x35d780804121 <undefined> ; literal
    0x1186996c8: [top + 16] <- 0x35d780804121 <undefined> ; literal
    0x1186996c0: [top + 8] <- 0x6e3d6609a09 ; [sp + 40] 0x6e3d6609a09 <an Uint32Array with map 0xae6f5e0acb9>
    0x1186996b8: [top + 0] <- 0x35d780804121 <undefined> ; literal
[deoptimizing (soft): end 0x35d7808fc969 module.exports @22 => node=155, pc=0x162c41464b44, state=NO_REGISTERS, alignment=no padding, took 0.161 ms]
--- FUNCTION SOURCE (colorDistance) id{9,0} ---
(scale, dest, src) {
                return clamp(scale * dest + (1 - scale) * src);
            };
--- END ---
--- FUNCTION SOURCE (clamp) id{10,0} ---
(component) {
                return Math.max(Math.min(255, component), 0);
            }

--- END ---
--- FUNCTION SOURCE (noise) id{11,0} ---
() {
                return Math.random() * 0.5 + 0.5;
            };
--- END ---
--- FUNCTION SOURCE (random) id{11,1} ---
(){
var a=(MathImul(18030,rngstate[0]&0xFFFF)+(rngstate[0]>>>16))|0;
rngstate[0]=a;
var b=(MathImul(36969,rngstate[1]&0xFFFF)+(rngstate[1]>>>16))|0;
rngstate[1]=b;
var c=((a<<16)+(b&0xFFFF))|0;
return(c<0?(c+0x100000000):c)*2.3283064365386962890625e-10;
}

--- END ---
INLINE (random) id{11,1} AS 1 AT <0:33>
--- FUNCTION SOURCE () id{12,0} ---
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
--- FUNCTION SOURCE (colorDistance) id{13,0} ---
(scale, dest, src) {
                return clamp(scale * dest + (1 - scale) * src);
            };
--- END ---
--- FUNCTION SOURCE (clamp) id{14,0} ---
(component) {
                return Math.max(Math.min(255, component), 0);
            }

--- END ---
--- FUNCTION SOURCE (noise) id{15,0} ---
() {
                return Math.random() * 0.5 + 0.5;
            };
--- END ---
--- FUNCTION SOURCE (random) id{15,1} ---
(){
var a=(MathImul(18030,rngstate[0]&0xFFFF)+(rngstate[0]>>>16))|0;
rngstate[0]=a;
var b=(MathImul(36969,rngstate[1]&0xFFFF)+(rngstate[1]>>>16))|0;
rngstate[1]=b;
var c=((a<<16)+(b&0xFFFF))|0;
return(c<0?(c+0x100000000):c)*2.3283064365386962890625e-10;
}

--- END ---
INLINE (random) id{15,1} AS 1 AT <0:33>
--- FUNCTION SOURCE (module.exports) id{16,0} ---
(event){
  var pack = event.data;
  var arg = pack.arg;
  var code = pack.code;
  console.log(code);
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
[marking dependent code 0x162c41472541 (opt #16) for deoptimization, reason: weak-code]
[deoptimize marked code in all contexts]
[deoptimizer unlinked: module.exports / 35d7808fc969]
