function noise() {
    return Math.random() * 0.5 + 0.5;
};

function colorDistance(scale, dest, src) {
    return Math.max(Math.min(255, scale * dest + (1 - scale) * src), 0);
};

var processBW = function (binaryData, l) {
    for (var i = 0; i < l; i += 4) {
        var r = binaryData[i];
        var g = binaryData[i + 1];
        var b = binaryData[i + 2];
        var luminance = r * 0.21 + g * 0.71 + b * 0.07;
        binaryData[i] = luminance;
        binaryData[i + 1] = luminance;
        binaryData[i + 2] = luminance;
    }
};

var processSepia = function (binaryData, l) {
    for (var i = 0; i < l; i += 4) {
        var r = binaryData[i];
        var g = binaryData[i + 1];
        var b = binaryData[i + 2];

        var noise_r = Math.random() * 0.5 + 0.5;
        var noise_g = Math.random() * 0.5 + 0.5;
        var noise_b = Math.random() * 0.5 + 0.5;

        binaryData[i] = Math.max(Math.min(255, noise_r * ((r * 0.393) + (g * 0.769) + (b * 0.189)) + (1 - noise_r) * r), 0);
        binaryData[i + 1] = Math.max(Math.min(255, noise_g * ((r * 0.349) + (g * 0.686) + (b * 0.168)) + (1 - noise_g) * g), 0);
        binaryData[i + 2] = Math.max(Math.min(255, noise_b * ((r * 0.272) + (g * 0.534) + (b * 0.131)) + (1 - noise_b) * b), 0);
    }
};
