
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
const perspectiveLocation = gl.getUniformLocation(program, 'u_perspective');
const viewLocation = gl.getUniformLocation(program, 'u_view');

var perspectiveMatrixOutput = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

// NOTE: it takes the identity matrix and an input and modifies it within the function
perspective(perspectiveMatrixOutput, 75 * Math.PI / 180, canvas.width / canvas.height, 0.1, 10000);

const viewMatrixOutput = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

// It's meant to place the camera at a position in x, y, and z, whatever that means
translator(viewMatrixOutput, viewMatrixOutput, [0, 0, 1]);
invert(viewMatrixOutput, viewMatrixOutput);

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


theta = theta + Math.PI / 500;

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
gl.uniformMatrix4fv(perspectiveLocation, false, perspectiveMatrixOutput);
gl.uniformMatrix4fv(viewLocation, false, viewMatrixOutput);

// Enable depth testing
gl.enable(gl.DEPTH_TEST);
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





function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf;
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[15] = 0;

    if (far != null && far !== Infinity) {
      nf = 1 / (near - far);
      out[10] = (far + near) * nf;
      out[14] = 2 * far * near * nf;
    } else {
      out[10] = -1;
      out[14] = -2 * near;
    }

    return out;
  }
  
  function invert(out, a) {
    var a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
    var a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    var a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    var a30 = a[12],
        a31 = a[13],
        a32 = a[14],
        a33 = a[15];
    var b00 = a00 * a11 - a01 * a10;
    var b01 = a00 * a12 - a02 * a10;
    var b02 = a00 * a13 - a03 * a10;
    var b03 = a01 * a12 - a02 * a11;
    var b04 = a01 * a13 - a03 * a11;
    var b05 = a02 * a13 - a03 * a12;
    var b06 = a20 * a31 - a21 * a30;
    var b07 = a20 * a32 - a22 * a30;
    var b08 = a20 * a33 - a23 * a30;
    var b09 = a21 * a32 - a22 * a31;
    var b10 = a21 * a33 - a23 * a31;
    var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }

    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
  }
  
   function translator(out, a, v) {
    var x = v[0],
        y = v[1],
        z = v[2];
    var a00, a01, a02, a03;
    var a10, a11, a12, a13;
    var a20, a21, a22, a23;

    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      a00 = a[0];
      a01 = a[1];
      a02 = a[2];
      a03 = a[3];
      a10 = a[4];
      a11 = a[5];
      a12 = a[6];
      a13 = a[7];
      a20 = a[8];
      a21 = a[9];
      a22 = a[10];
      a23 = a[11];
      out[0] = a00;
      out[1] = a01;
      out[2] = a02;
      out[3] = a03;
      out[4] = a10;
      out[5] = a11;
      out[6] = a12;
      out[7] = a13;
      out[8] = a20;
      out[9] = a21;
      out[10] = a22;
      out[11] = a23;
      out[12] = a00 * x + a10 * y + a20 * z + a[12];
      out[13] = a01 * x + a11 * y + a21 * z + a[13];
      out[14] = a02 * x + a12 * y + a22 * z + a[14];
      out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }

    return out;
  }

