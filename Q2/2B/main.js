
//function to multiply two matrices
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



//create the matrices
const matrixX = [
    1, 0, 0, 0,
    0, Math.cos(theta), -Math.sin(theta), 0,
    0, Math.sin(theta), Math.cos(theta), 0,
    0, 0, 0, 1
]

const matrixId = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
]



// use the multiplyMatrix function to multiply all your matrices together
var matrixXId = multiplyMatrices(matrixX, matrixId);

;