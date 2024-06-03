
import { vsSource } from './shaders.js';
import { fsSource } from './shaders.js';

const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

const picImage = document.getElementById('pic');
picImage.style.display = 'none';

if (!gl) {
    throw new Error('WebGL not supported');
}

// Vertices
const vertexData = [

    //front
   0.5, 0.5, 0, //0
   -0.5, 0.5, 0, //1
   -0.5, -0.5, 0, //2
   0.5, -0.5, 0,  //3

    //right face
    0.5, -0.5, 0, //4
    0.5, -0.5, 1, //5
    0.5, 0.5, 1, //6
    0.5, 0.5, 0, //7

    //top face 
    0.5, 0.5, 0, //8
    -0.5, 0.5, 0, //9
    -0.5, 0.5, 1, //10
    0.5, 0.5, 1, //11

    //back face
   0.5, 0.5, 1, //12
   -0.5, 0.5, 1, //13
   -0.5, -0.5, 1, //14
   0.5, -0.5, 1,  //15

   //bottomn face
   0.5, -0.5, 1,  //16
   -0.5, -0.5, 1, //17
   -0.5, -0.5, 0,  //18
   0.5, -0.5, 0,  //19

   //right face
   -0.5, -0.5, 0,  //20
   -0.5, -0.5, 1,  //21
   -0.5, 0.5, 1, //22
   -0.5, 0.5, 0, //23

   
];

// coordinates for textures

const picTexCoordinate = [
    1.0, 1.0, // upper right
    0.0, 1.0, // upper left
    0.0, 0.0, // bottom left
    1.0, 0.0, // bottom right

    1.0, 1.0, // upper right
    0.0, 1.0, // upper left
    0.0, 0.0, // bottom left
    1.0, 0.0, // bottom right

    1.0, 1.0, // upper right
    0.0, 1.0, // upper left
    0.0, 0.0, // bottom left
    1.0, 0.0, // bottom right

    1.0, 1.0, // upper right
    0.0, 1.0, // upper left
    0.0, 0.0, // bottom left
    1.0, 0.0, // bottom right

    1.0, 1.0, // upper right
    0.0, 1.0, // upper left
    0.0, 0.0, // bottom left
    1.0, 0.0, // bottom right

    1.0, 1.0, // upper right
    0.0, 1.0, // upper left
    0.0, 0.0, // bottom left
    1.0, 0.0, // bottom right
    
];



// Buffer
const buffer = gl.createBuffer();
if (!buffer) {
    console.error('Failed to create buffer');
} else {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
}

const picBuffer = gl.createBuffer();
if (!picBuffer) {
    console.error("Failed to create buffer");
} else {
    gl.bindBuffer(gl.ARRAY_BUFFER, picBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(picTexCoordinate), gl.STATIC_DRAW);

}

const picTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, picTexture);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // This flips the image orientation to be upright.

if (isPowerOfTwo(picImage.width) && isPowerOfTwo(picImage.height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
} else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, picImage);




// Vertex shader
const vertexShaderSourceCode = vsSource;
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);

// Error checking for vertex shader
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error(`Vertex shader compilation error: ${gl.getShaderInfoLog(vertexShader)}`);
}

// Fragment shader
const fragmentShaderSourceCode = fsSource;
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);

// Error checking for fragment shader
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error(`Fragment shader compilation error: ${gl.getShaderInfoLog(fragmentShader)}`);
}

// Program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Linking error
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(`Shader program linking error: ${gl.getProgramInfoLog(program)}`);
}

const positionLocation = gl.getAttribLocation(program, 'pos');
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

// Attribute location of texture coordinates
const picTexCoordLocation = gl.getAttribLocation(program, "picTexCoord");
gl.enableVertexAttribArray(picTexCoordLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, picBuffer);
gl.vertexAttribPointer(picTexCoordLocation, 2, gl.FLOAT, false, 0, 0);

const uTranslateMatrix = gl.getUniformLocation(program, `u_TranslateMatrix`);

let translatedMatrix = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
];

const uMatrix = gl.getUniformLocation(program, 'u_Matrix');

function multiplyMatrices(matrixA, matrixB) {
    let result = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                result[i * 4 + j] += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
        }
    }
    return result;
}

// angle of rotation
let theta = Math.PI / 1;


draw();

function draw(){
gl.clearColor(0, 0, 0, 0); // Set clear color
gl.clear(gl.COLOR_BUFFER_BIT);
gl.useProgram(program);


//uncomment this for rotation
// theta = theta + Math.PI / 500;

const matrixX = [
    1, 0, 0, 0,
    0, Math.cos(theta), -Math.sin(theta), 0,
    0, Math.sin(theta), Math.cos(theta), 0,
    0, 0, 0, 1
]
const matrixY = [
    Math.cos(theta), 0, Math.sin(theta), 0,
    0, 1, 0, 0,
    -Math.sin(theta), 0, Math.cos(theta), 0,
    0, 0, 0, 1
]
const matrixZ = [
    Math.cos(theta), -Math.sin(theta), 0, 0,
    Math.sin(theta), Math.cos(theta), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]

// Step6 use the multiplyMatrix function to multiply all your matrices together
var matrixXY = multiplyMatrices(matrixX, matrixY);
var matrixXYZ = multiplyMatrices(matrixXY, matrixZ);
var matrixYZ = multiplyMatrices(matrixY, matrixZ);
var matrixXZ = multiplyMatrices(matrixX, matrixZ);

gl.uniformMatrix4fv(uTranslateMatrix, false, translatedMatrix);
gl.uniformMatrix4fv(uMatrix, false, matrixXYZ);
// Enable depth testing
gl.enable(gl.DEPTH_TEST);
gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);
gl.drawArrays(gl.TRIANGLE_FAN, 12, 4);
gl.drawArrays(gl.TRIANGLE_FAN, 16, 4);
gl.drawArrays(gl.TRIANGLE_FAN, 20, 4);


window.requestAnimationFrame(draw);

}

// checks if it's a power of two
function isPowerOfTwo(value) {
    return (value & (value - 1)) === 0;
}

window.up = function() {
    translatedMatrix[13] += 0.1;
    
}

window.down = function() {
 
    translatedMatrix[13] -= 0.1;
    
}

window.left = function() {
 
    translatedMatrix[12] -= 0.1;
    
}

window.right = function() {
 
    translatedMatrix[12] += 0.1;
    
}



document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case "ArrowLeft":
            translatedMatrix[12] -= 0.1;
            break;
        case "ArrowRight":
            translatedMatrix[12] += 0.1;
            break;
        case "ArrowUp":
            translatedMatrix[13] += 0.1;
            break;
        case "ArrowDown":
            translatedMatrix[13] -= 0.1;
            break;
    }
});




