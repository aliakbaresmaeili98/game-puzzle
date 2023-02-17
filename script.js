let gl;
const gravity = 9.8;
const lightSource = [-0.3, 0.5, 1];
const programs = [];

const m4 = {

    identity() {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
    },

    translation (tx, ty, tz) {
        return [
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            tx, ty, tz, 1,
        ];
    },

    xRotation(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation (angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation: function(angleInRadians) {
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    scaling (sx, sy, sz) {
        return [
            sx, 0,  0,  0,
            0, sy,  0,  0,
            0,  0, sz,  0,
            0,  0,  0,  1,
        ];
    },

    translate (m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },

    xRotate (m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },

    yRotate (m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },

    zRotate (m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },

    scale (m, sx, sy, sz) {
        return m4.multiply(m, m4.scaling(sx, sy, sz));
    },

    orthographic (left, right, bottom, top, near, far) {
        return [
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,

            (left + right) / (left - right),
            (bottom + top) / (bottom - top),
            (near + far) / (near - far),
            1,
        ];
    },

    multiply (a, b) {
        const b00 = b[0 * 4 + 0];
        const b01 = b[0 * 4 + 1];
        const b02 = b[0 * 4 + 2];
        const b03 = b[0 * 4 + 3];
        const b10 = b[1 * 4 + 0];
        const b11 = b[1 * 4 + 1];
        const b12 = b[1 * 4 + 2];
        const b13 = b[1 * 4 + 3];
        const b20 = b[2 * 4 + 0];
        const b21 = b[2 * 4 + 1];
        const b22 = b[2 * 4 + 2];
        const b23 = b[2 * 4 + 3];
        const b30 = b[3 * 4 + 0];
        const b31 = b[3 * 4 + 1];
        const b32 = b[3 * 4 + 2];
        const b33 = b[3 * 4 + 3];
        const a00 = a[0 * 4 + 0];
        const a01 = a[0 * 4 + 1];
        const a02 = a[0 * 4 + 2];
        const a03 = a[0 * 4 + 3];
        const a10 = a[1 * 4 + 0];
        const a11 = a[1 * 4 + 1];
        const a12 = a[1 * 4 + 2];
        const a13 = a[1 * 4 + 3];
        const a20 = a[2 * 4 + 0];
        const a21 = a[2 * 4 + 1];
        const a22 = a[2 * 4 + 2];
        const a23 = a[2 * 4 + 3];
        const a30 = a[3 * 4 + 0];
        const a31 = a[3 * 4 + 1];
        const a32 = a[3 * 4 + 2];
        const a33 = a[3 * 4 + 3];

        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    }
}


class Cube {

    constructor() {

        this.position = [
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,
            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, -0.5, -0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5, 
            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,
            -0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, 0.5, 
            0.5, 0.5, -0.5,
            -0.5, 0.5, -0.5, 
            -0.5, 0.5, 0.5, 
            0.5, 0.5, 0.5, 


        ];

        this.normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // side
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            ];

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position), gl.STATIC_DRAW);

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

        this.translation = {x: 0, y: 0, z: 0};
        this.rotation = {x: 0, y: 0, z: 0};
        this._rotationStep = {x: randRange(-2, 3), y: randRange(-2, 3), z: randRange(-2, 3)};
        this.scale = {x: 1, y: 1, z: 1};
        this.color = [1, 0, 0];
        this.velocity = {x: 0, y: 0, z: 0};
        this.gravity = 0;
        this.type = Cube.Type.X;    // X, Y
        this.shouldUpdate = false;
    }

    /**
     * Set where the block should start from either on X or Z axis 
     */
    setOrigin() {
        let isX = Math.random() * 20 >= 10;
        let isLeft = Math.random() * 20 >= 10;
        if(isX) {
            this.translation.x = isLeft ? game.boundary.xMin : game.boundary.xMax;
            this.velocity.x = game.speed + (isLeft ? -1 : 1);
            this.type = Cube.Type.X;
        } else {
            this.translation.z = isLeft ? game.boundary.xMin : game.boundary.xMax;
            this.velocity.z = game.speed + (isLeft ? -1 : 1);
            this.type = Cube.Type.Z;
        }
    }

    lock() {
        this.velocity = {x: 0, y: 0, z: 0};
        const axis = this.type === Cube.Type.X ? "x" : "z";
        const diffPos = game.lastBlock.translation[axis] - this.translation[axis];

        if(Math.abs(diffPos) < this.scale[axis]) {

            const scale = this.scale[axis] - Math.abs(diffPos);
            const excellentPercentage = this.scale[axis] * 0.038;

            let fallingBlock = new Cube();
            fallingBlock.translation = {...this.translation};
            fallingBlock.color = [...this.color];
            fallingBlock.scale = {...this.scale};
            fallingBlock.scale[axis] -= scale;

            let oldScale = this.scale[axis];
            this.scale[axis] = scale;

            if(diffPos <= 0) {
                this.translation[axis] = game.lastBlock.translation[axis] 
                        + game.lastBlock.scale[axis]/2 - this.scale[axis]/2;
                fallingBlock.translation[axis] += scale;
            } else {
                this.translation[axis] = game.lastBlock.translation[axis] 
                    - game.lastBlock.scale[axis]/2 + this.scale[axis]/2;
                fallingBlock.translation[axis] -= scale;
            }


            if(oldScale - this.scale[axis] <= excellentPercentage) {
                game.score += game.scoreFactor;
                Paper.create();
            } 
            game.score += game.scoreFactor * (this.scale[axis] / oldScale);

            game.blocks.push(this);
            game.scroll = this.scale.y;
            game.fallingBlocks.push(fallingBlock);
            this.shouldUpdate = true;
        } else {
            // stop updating brick
            game.activeBlock = null;
            this.isLast = true;
            game.fallingBlocks.push(this);
        }
    }

    update(deltaTime) {
        /**
         * FALLLING BLOCKS
         */
        // add gravity to falling block
        if(this.type === Cube.Type.FALLING) {

            // reduce size on falling
            this.scale.x -= this.velocity.y * 0.1 * deltaTime;
            this.scale.y -= this.velocity.y * 0.1 * deltaTime;
            this.scale.z -= this.velocity.y  * 0.1 * deltaTime;
            
            this.scale.x = Math.max(10, this.scale.x);
            this.scale.y = Math.max(10, this.scale.y);
            this.scale.z = Math.max(10, this.scale.z);
            
            // rotate block on falling
            this.rotation.x += this._rotationStep.x * deltaTime;
            this.rotation.y += this._rotationStep.y * deltaTime;
            this.rotation.z += this._rotationStep.z * deltaTime;
            this.velocity.y += 100 * deltaTime;
            this.translation.y += this.velocity.y * deltaTime;

            // delete after reaching a location
            if(this.translation.y > game.boundary.yMax * 2) {
                game.fallingBlocks.splice(game.fallingBlocks.indexOf(this), 1);

                // if this is the last block animate and end game
                if(this.isLast) {
                    game.scaleCounter = 0;
                    game.state = game.stateType.BEFORE_GAMEOVER;
                    let interval = setInterval(() => {
                        
                        // reduce camera scale and rotate game world
                        game.scaleCounter += 2e-3;
                        game.scale.x -= game.scaleCounter;
                        game.scale.y -= game.scaleCounter;
                        game.scale.z -= game.scaleCounter;
                        game.rotation.y += 0.2;

                        if(game.scaleCounter > 0.05) {
                            clearInterval(interval);
                            game.scaleCounter = 0;
                            game.state = game.stateType.GAMEOVER;
                            const menu = document.getElementById("menu");
                            menu.style.zIndex = 100;
                        }
                    }, 1000/60);
                }
            }
        }

        // move block
        this.translation.x += this.velocity.x * deltaTime;
        this.translation.z += this.velocity.z * deltaTime;

        // clamp position on the x-axis and reverse velocity
        if(this.translation.x > game.boundary.xMax) {
            this.translation.x = game.boundary.xMax;
            this.velocity.x *= -1;
        } else if(this.translation.x < game.boundary.xMin) {
            this.translation.x = game.boundary.xMin; 
            this.velocity.x *= -1;
        }

        // clamp position on z-axis and reverse velocity
        if(this.translation.z > game.boundary.zMax) {
            this.translation.z = game.boundary.zMax;
            this.velocity.z *= -1;
        } else if(this.translation.z < game.boundary.zMin) {
            this.translation.z = game.boundary.zMin; 
            this.velocity.z *= -1;
        }

    }

    draw(program) {
        // set transformation matrix
        gl.uniform3fv(program.uniforms.color, this.color);
        let mTransform = m4.translation(this.translation.x, this.translation.y, this.translation.z);

        // apply rotation only to falling block for optimization purpose
        if(this.type === Cube.Type.FALLING) {
            mTransform = m4.xRotate(mTransform, this.rotation.x);
            mTransform = m4.yRotate(mTransform, this.rotation.y);
            mTransform = m4.zRotate(mTransform, this.rotation.z);
        }
        mTransform = m4.scale(mTransform, this.scale.x, this.scale.y, this.scale.z);
        gl.uniformMatrix4fv(program.uniforms.world, false, mTransform);
    
        gl.enableVertexAttribArray(program.attributes.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(program.attributes.position, 3, gl.FLOAT, false, 0, 0);
    
        gl.enableVertexAttribArray(program.attributes.normal);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(program.attributes.normal, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    // copy other block characterisitcs
    static copy(o) {
        const block = new Cube();
        block.color = [...o.color];
        block.scale = {...o.scale};
        block.translation = {...o.translation};
        return block;
    }

    // call this function for creating new block
    static createNew() {
        game.activeBlock = null;
        let oldBlock = game.lastBlock;
        let block = Cube.copy(oldBlock);
        block.color = [...colorManager.color];
        block.translation.y = oldBlock.translation.y - oldBlock.scale.y / 2 - block.scale.y/2;
        game.activeBlock = block;
        block.setOrigin();
        return block;
    }

}


Object.defineProperties(Cube, {
    Type: {
        value: {
            X: "Starts from X",
            Z: "Starts from Z",
            FALLING: "Falling to the bottom"
        }
    }
});

/**
 * Celebration code appears if a block is aligned almost perfectly
 */
class Paper {

    constructor() {

        this.position = [
            // positions
            0, 0, 0,
            1, 1, 0,
            1, 0, 0,  

            0, 0, 0,
            0, 1, 0,
            1, 1, 0,
  

            0, 0, 0,
            1, 1, 0,
            0, 1, 0,

            0, 0, 0,
            1, 1, 0,
            0, 1, 0,

            // normals all facing front
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            0, -1, 0,
            0, -1, 0,
            0, -1, 0,

            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
        ];

        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position), gl.STATIC_DRAW);

        this.rotation = {x: 0, y: 0, z: 0};
        this._rotationStep = {x: randRange(1, 3), y: randRange(1, 3), z: randRange(1, 3)};
        // maxX is the clipping bound for x-axis
        const maxX = gl.canvas.width/2;
        this.translation = {x: randRange(-maxX, maxX), y: -gl.canvas.height/2, z: randRange(-400, 400)};
        this.scale = {x: randRange(10, 20), y: randRange(10, 20), z: 10};
        this.color = [Math.random(), Math.random(), Math.random()];
        this.velocity = {x: randRange(-100, 100), y: randRange(-1000, -20), z: 0};
    }

    draw(program) {

        // set and and update transformation matrix
        gl.uniform3fv(program.uniforms.color, this.color);
        let mTransform = m4.translation(this.translation.x, this.translation.y, this.translation.z);
        mTransform = m4.xRotate(mTransform, this.rotation.x);
        mTransform = m4.yRotate(mTransform, this.rotation.y);
        mTransform = m4.zRotate(mTransform, this.rotation.z);
        mTransform = m4.scale(mTransform, this.scale.x, this.scale.y, this.scale.z);
        gl.uniformMatrix4fv(program.uniforms.world, false, mTransform);
    
        gl.enableVertexAttribArray(program.attributes.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(program.attributes.position, 3, gl.FLOAT, false, 0, 0);
    
        gl.enableVertexAttribArray(program.attributes.normal);
        gl.vertexAttribPointer(program.attributes.position, 3, gl.FLOAT, false, 0, 12);
        gl.drawArrays(gl.TRIANGLES, 0, this.position.length / 12);
        gl.drawArrays(gl.LINE_LOOP, 0, this.position.length / 12);
    }

    /**
     * Update the papers movement and rotation
     * @param {number} deltaTime time difference
     */
    update(deltaTime) {
        // rotate papers randomly
        this.rotation.x += this._rotationStep.x * deltaTime;
        this.rotation.y += this._rotationStep.y * deltaTime;
        this.rotation.z += this._rotationStep.z * deltaTime;    

        // // add gravity and move papers
        this.velocity.y += gravity;
        this.translation.x += this.velocity.x * deltaTime;
        this.translation.y += this.velocity.y * deltaTime;

        // delete papers if out of bound
        if(this.translation.y > gl.canvas.height / 2 || this.translation.x < -gl.canvas.width/2
            || this.translation.x > gl.canvas.width / 2) {
            game.papers.splice(game.papers.indexOf(this), 1);
        }
    }

    static create() {
        // create random 40 - 90 papers 
        let max = randRange(40, 90);
        for(let i = 0; i < max; i++) 
            game.papers.push(new Paper());
    }

}


const createShader = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success) return shader;
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

const createProgram = (gl, vertexShader, fragmentShader) => {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success) return program;

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}


const time = {
    t0: null,
    t1: null,
    maximum_fps: 1 / 60,
}


/**
 * Contains global entity definitation for the game
 */
const game = {
    activeBlock: null,
    withMusic: true,
    modeType: {
        CLASSIC: "play normal game",
        DEATH: "Spin Game world but score increases by 50%",
    },
    stateType: {
        GAMEOVER: "Object Missed a block by 100%",
        PLAYING: "Game is Playing",
        BEFORE_GAMEOVER: "Happens before game over"
    },

    // boundary for the game
    get boundary() {
        return {
            xMin: -this.maxSize * 2,
            xMax: this.maxSize * 2, 
            zMin: -this.maxSize * 2, 
            zMax: this.maxSize * 2,
            yMin: -gl.canvas.height * 0.5,
            yMax: gl.canvas.height * 0.5
        };
    },

    get lastBlock() {
        return this.blocks[this.blocks.length - 1];
    },

    set score(s) {
        this._s = s;
        this.scoreText.innerHTML = `Score: ${~~this._s}`;
    },

    get score() {
        return this._s;
    },

    get scoreFactor() {
        return this.mode === this.modeType.CLASSIC ? 50 : 120;
    },

    initDOM() {
        this.scoreText = document.getElementById("score");
    },

    restart() {
        this.state = this.stateType.PLAYING;
        this.mode = this.modeType.CLASSIC;
        this.scroll = 0;
        this.speed = 150;
        this.score = 0;
        this.blockHeight = 40;
        this.blocks = [];
        this.papers = [];
        this.fallingBlocks = [];
        this.rotation = {x: 0, y: 0, z: 0};
        this.scale = { x: 1, y: 1, z: 1 };

        // set foundation block
        let oldBlock = new Cube();
        oldBlock.translation.x = 0;
        oldBlock.scale.x = gl.canvas.width * 0.4;
        oldBlock.scale.z = oldBlock.scale.x;
        oldBlock.scale.y = gl.canvas.height * 0.75;
        oldBlock.translation.y = oldBlock.scale.y * 0.5;
        this.blocks.push(oldBlock);

        this.maxSize = oldBlock.scale.x;
    },

    createFirstBlock() {
        const oldBlock = this.lastBlock;
        // set the first active block
        const firstBlock = Cube.createNew();
        firstBlock.color = [...colorManager.color];
        firstBlock.scale.y = this.blockHeight;
        firstBlock.translation.y = oldBlock.translation.y - oldBlock.scale.y / 2 - firstBlock.scale.y/2;
    },

    init() {
        this.initDOM();
        this.restart();
    }
}

const randRange = (min, max) => Math.random() * (max - min) + min;

const colorManager = {
    r: 255, 
    g: 40,
    b: 90,
    setColor() {
        this.r += 7;
        this.g += 3;
        this.b += 5;
        this.red = Math.abs(Math.sin(this.r * Math.PI / 180) * 70 + 185);
        this.green = Math.abs(Math.sin(this.r * Math.PI / 180) * 175 + 80);
        this.blue = Math.abs(Math.sin(this.r* Math.PI / 180) * 270 + 15);
    },
    get color() {
        this.setColor();
        return [this.red / 255, this.green / 255, this.blue / 255];
    }
};


const setupDOM = () => {
    const canvas = document.getElementById("gl");
    canvas.width = parseFloat(window.getComputedStyle(canvas).getPropertyValue("width"));
    canvas.height = parseFloat(window.getComputedStyle(canvas).getPropertyValue("height"));
    if(!canvas) {
        alert("Your Browser does not support HTML5 Canvas: That's a weird browser");
        throw new Error("Canvas Element not supported");
    }
    gl = canvas.getContext("webgl");
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    if(!gl) alert("Your device does not support webgl");
}

const setupPrograms = () => {
    const vertexShaderSource = document.getElementById("vertex-shader").textContent;
    const fragmentShaderSource = document.getElementById("fragment-shader").textContent;
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = createProgram(gl, vertexShader, fragmentShader);
    programs.push({
        program,
        attributes: {
            position: gl.getAttribLocation(program, "a_position"),
            normal: gl.getAttribLocation(program, "a_normal"),
            color: gl.getAttribLocation(program, "a_color"),
        },
        uniforms: {
            color: gl.getUniformLocation(program, "u_color"),
            worldView: gl.getUniformLocation(program, "u_worldView"),
            world: gl.getUniformLocation(program, "u_world"),
            lightSource: gl.getUniformLocation(program, "u_reverseLightDirection")
        }
    });

    const _program = programs[0];
    gl.useProgram(program);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.uniform3fv(_program.uniforms.lightSource, lightSource);
}


const update = deltaTime => {
    // rotate camera on x-axis
    game.rotation.x = Math.PI / 4;
    if(game.state === game.stateType.PLAYING && game.mode != game.modeType.DEATH)
        game.rotation.y = Math.PI / 4;

    // set death mode parameters
    if(game.mode === game.modeType.DEATH) {
        game.rotation.y += 4 * deltaTime;
        game.speed = 250;
    }

    // reset mode to classic
    if(game.state == game.stateType.GAMEOVER) {
        game.mode = game.modeType.CLASSIC;
        document.getElementById("deathBtn").style.fill = "#000";
    }
    
    // update blocks

    if(game.activeBlock != null)
        game.activeBlock.update(deltaTime);

    game.blocks.forEach(block => {
        block.translation.y += game.scroll; // block should move on save
        block.update(deltaTime);
    });

    // set scroll to zero to prevent infinite saved block movement
    game.scroll = 0;

    // create new block after previous block has been positioned
    if(game.lastBlock.shouldUpdate) {
        const c = Cube.createNew();
        c.scale.x = game.lastBlock.scale.x;
        c.scale.z = game.lastBlock.scale.z;
        game.lastBlock.shouldUpdate = false;
    }

    // update falling blocks
    game.fallingBlocks.forEach(block => {
        block.type = Cube.Type.FALLING;
        block.update(deltaTime);
    });

    // update papers
    game.papers.forEach(paper => paper.update(deltaTime));
}


const draw = () => {
    // set basic webgl parameters for 3d
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // set worldView model
    let matrix = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, 400, -400);
    matrix = m4.translate(matrix, gl.canvas.width / 2, gl.canvas.height/2, 0);
    matrix = m4.xRotate(matrix, game.rotation.x);
    matrix = m4.yRotate(matrix, game.rotation.y);
    matrix = m4.scale(matrix, game.scale.x, game.scale.y, game.scale.z);
    gl.uniformMatrix4fv(programs[0].uniforms.worldView, false, matrix);

    // draw blocks
    game.blocks.forEach(block => block.draw(programs[0]));
    game.fallingBlocks.forEach(block => block.draw(programs[0]));
    game.papers.forEach(paper => paper.draw(programs[0]));

    if(game.activeBlock != null) game.activeBlock.draw(programs[0]);

}

/**
 * Update the game loop based on the minimum fps 
 */
const animate = () => {
    time.t1 = Date.now();
    let deltaTime = (time.t1 - time.t0) * 0.001;
    while (deltaTime > time.maximum_fps) {
        deltaTime -= time.maximum_fps;
        update(time.maximum_fps);
    }
    update(deltaTime);
    time.t0 = Date.now();
    draw();
    requestAnimationFrame(animate);
}


const eventHandler = () => {
    const menu = document.getElementById("menu");
    const music = document.getElementById("music");
    music.loop = true;
    ["touchdown", "mousedown"].forEach(evt => {

        document.getElementById("fog").addEventListener(evt, e => {
            if(game.activeBlock != null) game.activeBlock.lock();
        });

        gl.canvas.addEventListener(evt, e => {
            if(game.activeBlock != null) game.activeBlock.lock();
        });

        menu.addEventListener(evt, e => {
            menu.style.zIndex = -100;
            game.restart();
            game.createFirstBlock();
            music.play();
        });

    });

    const deathBtn = document.getElementById("deathBtn");
    deathBtn.addEventListener("click", e => {
        if(game.state === game.stateType.PLAYING) {
            game.mode = game.mode === game.modeType.CLASSIC ? game.modeType.DEATH : game.modeType.CLASSIC;
            if(game.mode == game.modeType.CLASSIC)
                deathBtn.style.fill = "#000";
            else deathBtn.style.fill = "#a5e";
        }
    });

    const musicBtn = document.getElementById("musicBtn");
    musicBtn.addEventListener("click", e => {
        game.withMusic = !game.withMusic;
        musicBtn.innerHTML = "";
        musicBtn.style.transition = "1s";
        if(game.withMusic) {
            musicBtn.style.transform = "rotate(360deg)";
            music.play();
            musicBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M16 37.85v-28l22 14Zm3-14Zm0 8.55 13.45-8.55L19 15.3Z"/></svg>`;
        }
        else {
            musicBtn.style.transform = "rotate(0deg)";
            music.pause();
            musicBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="48" width="48"><path d="M40.3 45.2 2.85 7.75 5 5.6l37.45 37.45Zm-13-21.55-3-3V6H36v6.75h-8.7ZM19.8 42q-3.15 0-5.325-2.175Q12.3 37.65 12.3 34.5q0-3.15 2.175-5.325Q16.65 27 19.8 27q1.4 0 2.525.4t1.975 1.1v-3.6l3 3v6.6q0 3.15-2.175 5.325Q22.95 42 19.8 42Z"/></svg>`;
        }
    });

}


const main = () => {
    setupDOM();
    setupPrograms();
    time.t0 = Date.now();
    game.init();
    requestAnimationFrame(animate);
    eventHandler();
}

addEventListener("load", main);