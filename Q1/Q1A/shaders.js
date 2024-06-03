
const vsSource = `
    precision mediump float;
    attribute vec3 pos;
    void main() {
        gl_Position = vec4(pos, 1.0);
        gl_PointSize = 50.0;
    }
`;

const fsSource = `
    precision mediump float;
    void main() {
        gl_FragColor = vec4(0.8, 0, 0, 1);
    }
`;

export { vsSource, fsSource }