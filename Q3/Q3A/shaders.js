
const vsSource = `
    precision mediump float;
    attribute vec3 pos;

    attribute vec2 picTexCoord;
    varying vec2 vTexCoord;

    uniform mat4 u_TranslateMatrix;
     uniform mat4 u_Matrix;

     uniform mat4 u_perspective;
    uniform mat4 u_view;

    
    void main() {
        gl_Position = u_perspective * u_view * u_Matrix * u_TranslateMatrix * vec4(pos*0.4, 1.0);

        gl_PointSize = 50.0;

        vTexCoord = picTexCoord;
    }
`;


const fsSource = `
    precision mediump float;

    varying vec2 vTexCoord;
    uniform sampler2D texture;

    void main() {
        gl_FragColor = texture2D(texture, vTexCoord);
    }
`;

export { vsSource, fsSource }