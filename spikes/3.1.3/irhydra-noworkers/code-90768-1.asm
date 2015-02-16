--- FUNCTION SOURCE (IsPrimitive) id{0,0} ---
(a){
return!(%_IsSpecObject(a));
}

--- END ---
--- FUNCTION SOURCE (Instantiate) id{1,0} ---
(a,b){
if(!%IsTemplate(a))return a;
var c=%GetTemplateField(a,0);
switch(c){
case 0:
return InstantiateFunction(a,b);
case 1:
var d=%GetTemplateField(a,3);
var g;
if(typeof d==='undefined'){
g={};
ConfigureTemplateInstance(g,a);
}else{
g=new(Instantiate(d))();
g=%ToFastProperties(g);
}
return g;
default:
throw'Unknown API tag <'+c+'>';
}
}

--- END ---
--- FUNCTION SOURCE (noise) id{2,0} ---
() {
    return Math.random() * 0.5 + 0.5;
};
--- END ---
--- FUNCTION SOURCE (random) id{2,1} ---
(){
var a=(MathImul(18030,rngstate[0]&0xFFFF)+(rngstate[0]>>>16))|0;
rngstate[0]=a;
var b=(MathImul(36969,rngstate[1]&0xFFFF)+(rngstate[1]>>>16))|0;
rngstate[1]=b;
var c=((a<<16)+(b&0xFFFF))|0;
return(c<0?(c+0x100000000):c)*2.3283064365386962890625e-10;
}

--- END ---
INLINE (random) id{2,1} AS 1 AT <0:22>
--- FUNCTION SOURCE (colorDistance) id{3,0} ---
(scale, dest, src) {
    return clamp(scale * dest + (1 - scale) * src);
};
--- END ---
--- FUNCTION SOURCE (clamp) id{3,1} ---
(component) {
    return Math.max(Math.min(255, component), 0);
}
--- END ---
INLINE (clamp) id{3,1} AS 1 AT <0:33>
--- FUNCTION SOURCE (processSepia) id{4,0} ---
(binaryData, l) {
    for (var i = 0; i < l; i += 4) {
        var r = binaryData[i];
        var g = binaryData[i + 1];
        var b = binaryData[i + 2];

        binaryData[i] = colorDistance(noise(), (r * 0.393) + (g * 0.769) + (b * 0.189), r);
        binaryData[i + 1] = colorDistance(noise(), (r * 0.349) + (g * 0.686) + (b * 0.168), g);
        binaryData[i + 2] = colorDistance(noise(), (r * 0.272) + (g * 0.534) + (b * 0.131), b);
    }
};
--- END ---
--- FUNCTION SOURCE (noise) id{4,1} ---
() {
    return Math.random() * 0.5 + 0.5;
};
--- END ---
INLINE (noise) id{4,1} AS 1 AT <0:201>
--- FUNCTION SOURCE (random) id{4,2} ---
(){
var a=(MathImul(18030,rngstate[0]&0xFFFF)+(rngstate[0]>>>16))|0;
rngstate[0]=a;
var b=(MathImul(36969,rngstate[1]&0xFFFF)+(rngstate[1]>>>16))|0;
rngstate[1]=b;
var c=((a<<16)+(b&0xFFFF))|0;
return(c<0?(c+0x100000000):c)*2.3283064365386962890625e-10;
}

--- END ---
INLINE (random) id{4,2} AS 2 AT <1:22>
--- FUNCTION SOURCE (colorDistance) id{4,3} ---
(scale, dest, src) {
    return clamp(scale * dest + (1 - scale) * src);
};
--- END ---
INLINE (colorDistance) id{4,3} AS 3 AT <0:187>
--- FUNCTION SOURCE (clamp) id{4,4} ---
(component) {
    return Math.max(Math.min(255, component), 0);
}
--- END ---
INLINE (clamp) id{4,4} AS 4 AT <3:33>
INLINE (noise) id{4,1} AS 5 AT <0:298>
INLINE (random) id{4,2} AS 6 AT <5:22>
INLINE (colorDistance) id{4,3} AS 7 AT <0:284>
INLINE (clamp) id{4,4} AS 8 AT <7:33>
INLINE (noise) id{4,1} AS 9 AT <0:395>
INLINE (random) id{4,2} AS 10 AT <9:22>
INLINE (colorDistance) id{4,3} AS 11 AT <0:381>
INLINE (clamp) id{4,4} AS 12 AT <11:33>
[marking dependent code 0xb7c5886e681 (opt #4) for deoptimization, reason: weak-code]
[deoptimize marked code in all contexts]
[deoptimizer unlinked: processSepia / 3649e8040071]
--- FUNCTION SOURCE (ScriptNameOrSourceURL) id{5,0} ---
(){
if(this.line_offset>0||this.column_offset>0){
return this.name;
}
if(this.source_url){
return this.source_url;
}
return this.name;
}

--- END ---
--- FUNCTION SOURCE (lastIndexOf) id{6,0} ---
(a){
if((this==null)&&!(%_IsUndetectableObject(this)))throw MakeTypeError('called_on_null_or_undefined',["String.prototype.lastIndexOf"]);
var b=((typeof(%IS_VAR(this))==='string')?this:NonStringToString(this));
var c=b.length;
var a=((typeof(%IS_VAR(a))==='string')?a:NonStringToString(a));
var d=a.length;
var g=c-d;
if(%_ArgumentsLength()>1){
var h=ToNumber(%_Arguments(1));
if(!(!%_IsSmi(%IS_VAR(h))&&!(h==h))){
h=(%_IsSmi(%IS_VAR(h))?h:%NumberToInteger(ToNumber(h)));
if(h<0){
h=0;
}
if(h+d<c){
g=h;
}
}
}
if(g<0){
return-1;
}
return %StringLastIndexOf(b,a,g);
}

--- END ---
--- FUNCTION SOURCE (DebuggerScript._formatScript) id{7,0} ---
(script)
{
    var lineEnds = script.line_ends;
    var lineCount = lineEnds.length;
    var endLine = script.line_offset + lineCount - 1;
    var endColumn;
    // V8 will not count last line if script source ends with \x5cn.
    if (script.source[script.source.length - 1] === '\x5cn') {
        endLine += 1;
        endColumn = 0;
    } else {
        if (lineCount === 1)
            endColumn = script.source.length + script.column_offset;
        else
            endColumn = script.source.length - (lineEnds[lineCount - 2] + 1);
    }

    return {
        id: script.id,
        name: script.nameOrSourceURL(),
        sourceURL: script.source_url,
        sourceMappingURL: script.source_mapping_url,
        source: script.source,
        startLine: script.line_offset,
        startColumn: script.column_offset,
        endLine: endLine,
        endColumn: endColumn,
        isContentScript: !!script.context_data && script.context_data.indexOf("injected") == 0
    };
}

--- END ---
[deoptimizing (DEOPT soft): begin 0x656a263d1b9 ScriptNameOrSourceURL (opt #5) @7, FP to SP delta: 24]
            ;;; deoptimize at <0:61> deoptimize: Insufficient type feedback for generic named access
  translating ScriptNameOrSourceURL => node=5, height=0
    0x7fff5ee1e840: [top + 32] <- 0x348ed3004571 ; [sp + 40] 0x348ed3004571 <a Script with map 0x1d082951c251 value = 0x3649e8053851 <Script>>
    0x7fff5ee1e838: [top + 24] <- 0xb7c588a77d1 ; caller's pc
    0x7fff5ee1e830: [top + 16] <- 0x7fff5ee1e880 ; caller's fp
    0x7fff5ee1e828: [top + 8] <- 0x656a2623459 ; [sp + 0] 0x656a2623459 <FixedArray[4]>
    0x7fff5ee1e828: [top + 8] <- 0x656a2623459; context
    0x7fff5ee1e820: [top + 0] <- 0x656a263d1b9; function
[deoptimizing (soft): end 0x656a263d1b9 ScriptNameOrSourceURL @7 => node=5, pc=0xb7c5889ae48, state=NO_REGISTERS, alignment=no padding, took 0.045 ms]
--- FUNCTION SOURCE (ScriptNameOrSourceURL) id{8,0} ---
(){
if(this.line_offset>0||this.column_offset>0){
return this.name;
}
if(this.source_url){
return this.source_url;
}
return this.name;
}

--- END ---
[deoptimize all code in all contexts]
[deoptimizer unlinked: ScriptNameOrSourceURL / 656a263d1b9]
[deoptimizer unlinked: DebuggerScript._formatScript / 656a268d051]
[deoptimizer unlinked: lastIndexOf / 656a264c8e9]
[deoptimizer unlinked: Instantiate / 2c1b3d89d659]
[deoptimizer unlinked: IsPrimitive / 2c1b3d8a2d91]
[deoptimizer unlinked: colorDistance / 2c1b3d862c11]
[deoptimizer unlinked: noise / 2c1b3d862b81]
