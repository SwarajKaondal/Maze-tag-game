/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const INPUT_TRIANGLES_URL = "triangles.json"; // triangles file loc
// triangles file loc
const INPUT_ELLIPSOIDS_URL =
  "https://ncsucgclass.github.io/prog3/ellipsoids.json"; // ellipsoids file loc
var defaultUp = vec3.fromValues(0, 1, 0); // default view up vector
var lightAmbient = vec3.fromValues(1, 1, 1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1, 1, 1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1, 1, 1); // default light specular emission
var lightPosition = vec3.fromValues(0.5, 0.5, -0.5); // default light position
var rotateTheta = Math.PI / 90; // how much to rotate models by with each key press
var globalLookAtVector = vec3.create();
/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var inputEllipsoids = []; // the ellipsoid data as loaded from input files
var numEllipsoids = 0; // how many ellipsoids in the input scene
var vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
var normalBuffers = []; // this contains normal component lists by set, in triples
var triSetSizes = []; // this contains the size of each triangle set
var triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
var textureMap = {};

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var alphaULoc;
var shininessULoc; // where to put specular exponent for fragment shader
var textureAttribLoc;
let vNormAttribLoc;
const MOUSE_SENS = 700;
var footstepAudio;
var showMiniMap = false;

const minimapStates = {
  ACTIVE: "map is active",
  COOLDOWN: "map is on cooldown",
  READY: "map is ready to be used",
};
var minimapState = minimapStates.READY;

let r = 0;
const dirEnum = { NEGATIVE: -1, POSITIVE: 1 }; // enumerated rotation direction

/* interaction variables */
var Eye; // eye position in world space
var Center; // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space

// ----------------
var texture;
var textureCoordBuffers = [];
// ASSIGNMENT HELPER FUNCTIONS

let winnerAnnounced = false;

// get the JSON file from the passed URL
function getJSONFile(url, descr) {
  try {
    if (typeof url !== "string" || typeof descr !== "string") throw "getJSONFile: parameter not a string";
    else {
      var httpReq = new XMLHttpRequest(); // a new http request
      httpReq.open("GET", url, false); // init the request
      httpReq.send(null); // send the request
      var startTime = Date.now();
      while (httpReq.status !== 200 && httpReq.readyState !== XMLHttpRequest.DONE) {
        if (Date.now() - startTime > 3000) break;
      } // until its loaded or we time out after three seconds
      if (httpReq.status !== 200 || httpReq.readyState !== XMLHttpRequest.DONE) throw "Unable to open " + descr + " file!";
      else return JSON.parse(httpReq.response);
    } // end if good params
  } catch (e) {
    // end try

    console.log(e);
    return String.null;
  }
} // end get input json file

function translateModel(modelId, offset) {
  vec3.add(models[modelId].translation, models[modelId].translation, offset);
} // end translate model

function rotateModel(modelId, axis, direction) {
  var newRotation = mat4.create();

  mat4.fromRotation(newRotation, direction * rotateTheta, axis); // get a rotation matrix around passed axis
  vec3.transformMat4(inputTriangles[modelId].xAxis, inputTriangles[modelId].xAxis, newRotation); // rotate model x axis tip
  vec3.transformMat4(inputTriangles[modelId].yAxis, inputTriangles[modelId].yAxis, newRotation);
} // end rotate model
// document.onmousemove = handleMouseMove;

function horizontalEyeRotate(rotateValue) {
  let lookAt = vec3.create();
  let viewRight = vec3.create();
  let temp = vec3.create(); // lookat, right & temp vectors

  lookAt = vec3.normalize(lookAt, vec3.subtract(temp, Center, Eye)); // get lookat vector
  globalLookAtVector = lookAt;
  viewRight = vec3.normalize(viewRight, vec3.cross(temp, lookAt, Up)); // get view right vector
  Center = vec3.add(Center, Center, vec3.scale(temp, viewRight, rotateValue));
}

function verticalEyeRotate(rotateValue) {
  let lookAt = vec3.create();
  let viewRight = vec3.create();
  let temp = vec3.create();

  lookAt = vec3.normalize(lookAt, vec3.subtract(temp, Center, Eye)); // get lookat vector
  viewRight = vec3.normalize(viewRight, vec3.cross(temp, lookAt, Up));

  Center = vec3.add(Center, Center, vec3.scale(temp, Up, rotateValue));
  vec3.cross(vec3.create(), viewRight, vec3.subtract(lookAt, Center, Eye));
}

function handleMouseMove(event) {
  horizontalEyeRotate(event.movementX / MOUSE_SENS);
  verticalEyeRotate(-event.movementY / MOUSE_SENS);
  sendCurrentPosition();
}

function handleKeyUp(event) {
  switch (event.code) {
    case "KeyW":
      if (!footstepAudio.paused) {
        footstepAudio.pause();
      }
      break;
    case "KeyS":
      if (!footstepAudio.paused) {
        footstepAudio.pause();
      }
      break;
    case "KeyA":
      if (!footstepAudio.paused) {
        footstepAudio.pause();
      }
      break;
    case "KeyD":
      if (!footstepAudio.paused) {
        footstepAudio.pause();
      }
      break;
  }
}

// does stuff when keys are pressed
function handleKeyDown(event) {
  // if (gameOver) {
  //   return;
  // }
  // set up needed view params
  var lookAt = vec3.create(),
    viewRight = vec3.create(),
    temp = vec3.create(); // lookat, right & temp vectors
  lookAt = vec3.normalize(lookAt, vec3.subtract(temp, Center, Eye)); // get lookat vector
  viewRight = vec3.normalize(viewRight, vec3.cross(temp, lookAt, Up)); // get view right vector

  switch (event.code) {
    // view change
    case "KeyD": // translate view left, rotate left with shift
      if (!event.getModifierState("Shift")) {
        if (footstepAudio.paused) {
          footstepAudio.play();
        }
        let tempEye = vec3.create();
        let tempCenter = vec3.create();
        tempEye = vec3.add(tempEye, Eye, vec3.scale(temp, viewRight, viewDelta));
        tempCenter = vec3.add(tempCenter, Center, vec3.scale(temp, viewRight, viewDelta));
        if (!getIntersectionDirection(vec3.fromValues(tempEye[0], Eye[1], Eye[2]))) {
          Eye = vec3.fromValues(tempEye[0], Eye[1], Eye[2]);
          Center = vec3.fromValues(tempCenter[0], Center[1], Center[2]);
        }
        tempEye = vec3.add(tempEye, Eye, vec3.scale(temp, viewRight, viewDelta));
        tempCenter = vec3.add(tempCenter, Center, vec3.scale(temp, viewRight, viewDelta));
        if (!getIntersectionDirection(vec3.fromValues(Eye[0], Eye[1], tempEye[2]))) {
          Eye = vec3.fromValues(Eye[0], Eye[1], tempEye[2]);
          Center = vec3.fromValues(Center[0], Center[1], tempCenter[2]);
        }
      }
      break;
    case "KeyA": // translate view right, rotate right with shift
      if (!event.getModifierState("Shift")) {
        if (footstepAudio.paused) {
          footstepAudio.play();
        }
        let tempEye = vec3.create();
        let tempCenter = vec3.create();
        tempEye = vec3.add(tempEye, Eye, vec3.scale(temp, viewRight, -viewDelta));
        tempCenter = vec3.add(tempCenter, Center, vec3.scale(temp, viewRight, -viewDelta));
        if (!getIntersectionDirection(vec3.fromValues(tempEye[0], Eye[1], Eye[2]))) {
          Eye = vec3.fromValues(tempEye[0], Eye[1], Eye[2]);
          Center = vec3.fromValues(tempCenter[0], Center[1], Center[2]);
        }
        tempEye = vec3.add(tempEye, Eye, vec3.scale(temp, viewRight, -viewDelta));
        tempCenter = vec3.add(tempCenter, Center, vec3.scale(temp, viewRight, -viewDelta));
        if (!getIntersectionDirection(vec3.fromValues(Eye[0], Eye[1], tempEye[2]))) {
          Eye = vec3.fromValues(Eye[0], Eye[1], tempEye[2]);
          Center = vec3.fromValues(Center[0], Center[1], tempCenter[2]);
        }
      }

      break;
    case "KeyS": // translate view backward, rotate up with shift
      if (event.getModifierState("Shift")) {
        Center = vec3.add(Center, Center, vec3.scale(temp, Up, viewDelta));
        Up = vec3.cross(Up, viewRight, vec3.subtract(lookAt, Center, Eye)); /* global side effect */
      } else {
        if (footstepAudio.paused) {
          footstepAudio.play();
        }
        let tempEye = vec3.create();
        let tempCenter = vec3.create();
        tempEye = vec3.add(tempEye, Eye, vec3.scale(temp, vec3.fromValues(lookAt[0], 0, lookAt[2]), -viewDelta));
        tempCenter = vec3.add(tempCenter, Center, vec3.scale(temp, vec3.fromValues(lookAt[0], 0, lookAt[2]), -viewDelta));
        if (!getIntersectionDirection(vec3.fromValues(tempEye[0], Eye[1], Eye[2]))) {
          Eye = vec3.fromValues(tempEye[0], Eye[1], Eye[2]);
          Center = vec3.fromValues(tempCenter[0], Center[1], Center[2]);
        }
        tempEye = vec3.add(tempEye, Eye, vec3.scale(temp, vec3.fromValues(lookAt[0], 0, lookAt[2]), -viewDelta));
        tempCenter = vec3.add(tempCenter, Center, vec3.scale(temp, vec3.fromValues(lookAt[0], 0, lookAt[2]), -viewDelta));
        if (!getIntersectionDirection(vec3.fromValues(Eye[0], Eye[1], tempEye[2]))) {
          Eye = vec3.fromValues(Eye[0], Eye[1], tempEye[2]);
          Center = vec3.fromValues(Center[0], Center[1], tempCenter[2]);
        }
      } // end if shift not pressed
      break;
    case "KeyW": // translate view forward, rotate down with shift
      if (event.getModifierState("Shift")) {
        Center = vec3.add(Center, Center, vec3.scale(temp, Up, -viewDelta));
        Up = vec3.cross(Up, viewRight, vec3.subtract(lookAt, Center, Eye)); /* global side effect */
      } else {
        if (footstepAudio.paused) {
          footstepAudio.play();
        }
        let tempEye = vec3.create();
        let tempCenter = vec3.create();
        tempEye = vec3.add(tempEye, Eye, vec3.scale(temp, vec3.fromValues(lookAt[0], 0, lookAt[2]), viewDelta));
        tempCenter = vec3.add(tempCenter, Center, vec3.scale(temp, vec3.fromValues(lookAt[0], 0, lookAt[2]), viewDelta));
        if (!getIntersectionDirection(vec3.fromValues(tempEye[0], Eye[1], Eye[2]))) {
          Eye = vec3.fromValues(tempEye[0], Eye[1], Eye[2]);
          Center = vec3.fromValues(tempCenter[0], Center[1], Center[2]);
        }

        tempEye = vec3.add(tempEye, Eye, vec3.scale(temp, vec3.fromValues(lookAt[0], 0, lookAt[2]), viewDelta));
        tempCenter = vec3.add(tempCenter, Center, vec3.scale(temp, vec3.fromValues(lookAt[0], 0, lookAt[2]), viewDelta));
        if (!getIntersectionDirection(vec3.fromValues(Eye[0], Eye[1], tempEye[2]))) {
          Eye = vec3.fromValues(Eye[0], Eye[1], tempEye[2]);
          Center = vec3.fromValues(Center[0], Center[1], tempCenter[2]);
        }
      } // end if shift not pressed
      break;

    case "Space":
      if (minimapState === minimapStates.READY) {
        minimapState = minimapStates.ACTIVE;
        console.log("READY -> Active");
      }
      loadMinimap();
      break;
    case "KeyQ": // translate view up, rotate counterclockwise with shift
      if (event.getModifierState("Shift")) Up = vec3.normalize(Up, vec3.add(Up, Up, vec3.scale(temp, viewRight, -viewDelta)));
      else {
        Eye = vec3.add(Eye, Eye, vec3.scale(temp, Up, viewDelta));
        Center = vec3.add(Center, Center, vec3.scale(temp, Up, viewDelta));
      } // end if shift not pressed
      break;
    case "KeyE": // translate view down, rotate clockwise with shift
      if (event.getModifierState("Shift")) Up = vec3.normalize(Up, vec3.add(Up, Up, vec3.scale(temp, viewRight, viewDelta)));
      else {
        Eye = vec3.add(Eye, Eye, vec3.scale(temp, Up, -viewDelta));
        Center = vec3.add(Center, Center, vec3.scale(temp, Up, -viewDelta));
      } // end if shift not pressed
      break;
    // case "Escape": // reset view to default
    //   Eye = vec3.copy(Eye, defaultEye);
    //   Center = vec3.copy(Center, defaultCenter);
    //   Up = vec3.copy(Up, defaultUp);
    //   break;

    // model transformation
    case "KeyK": // translate left, rotate left with shift
      if (event.getModifierState("Shift")) rotateModel(0, Up, dirEnum.NEGATIVE);
      else translateModel(vec3.scale(temp, viewRight, viewDelta));
      break;
    case "Semicolon": // translate right, rotate right with shift
      if (event.getModifierState("Shift")) rotateModel(Up, dirEnum.POSITIVE);
      else translateModel(vec3.scale(temp, viewRight, -viewDelta));
      break;
    case "KeyL": // translate backward, rotate up with shift
      if (event.getModifierState("Shift")) rotateModel(viewRight, dirEnum.POSITIVE);
      else translateModel(vec3.scale(temp, lookAt, -viewDelta));
      break;
    case "KeyO": // translate forward, rotate down with shift
      if (event.getModifierState("Shift")) rotateModel(viewRight, dirEnum.NEGATIVE);
      else translateModel(vec3.scale(temp, lookAt, viewDelta));

      break;
    case "KeyI": // translate up, rotate counterclockwise with shift
      rotateModel(0, lookAt, dirEnum.POSITIVE);
      // socket.send(JSON.stringify({ id: screenId }));

      break;
    case "KeyZ":
      socket.send(JSON.stringify({ id: screenId }));
      lastTimeStamp = new Date();
      break;
    case "KeyP": // translate down, rotate clockwise with shift
      if (event.getModifierState("Shift")) rotateModel(lookAt, dirEnum.NEGATIVE);
      else translateModel(vec3.scale(temp, Up, -viewDelta));
      break;
  } // end switch
  sendCurrentPosition();
  loadMinimap();
} // end handleKeyDown

var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
var minimapCanvas = document.getElementById("minimap");
let minimap = minimapCanvas.getContext("2d");
const aspectRatio = canvas.width / canvas.height;
const MOVEMENT_THRESHOLD = 0.15 * aspectRatio;
var viewDelta = (2.5 * canvas.width) / 100000; // how much to displace view with each key press

// set up the webGL environment
function setupWebGL() {
  // Set up keys
  document.onkeydown = handleKeyDown; // call this when key pressed
  document.onkeyup = handleKeyUp;

  // var imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
  // var cw = imageCanvas.width,
  //   ch = imageCanvas.height;
  // imageContext = imageCanvas.getContext("2d");
  // var bkgdImage = new Image();
  // bkgdImage.crossOrigin = "Anonymous";
  // bkgdImage.src = "https://ncsucgclass.github.io/prog3/sky.jpg";
  // bkgdImage.onload = function () {
  //   var iw = bkgdImage.width,
  //     ih = bkgdImage.height;
  //   imageContext.drawImage(bkgdImage, 0, 0, iw, ih, 0, 0, cw, ch);
  // };

  // Get the canvas and context
  canvas.addEventListener("click", async () => {
    document.addEventListener("mousemove", handleMouseMove, false);

    await canvas.requestPointerLock();
  });
  canvas.click();

  gl = canvas.getContext("webgl"); // get a webgl object from it

  try {
    if (gl == null) {
      throw "unable to create gl context -- is your browser gl ready?";
    } else {
      gl.clearColor(0.68, 0.85, 1.0, 1.0); // use black when we clear the frame buffer
      gl.clearDepth(1.0); // use max when we clear the depth buffer
      gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
    }
  } catch (e) {
    // end try

    console.log(e);
  } // end catch
} // end setupWebGL

// read models in, load them into webgl buffers
function loadModels() {
  try {
    if (inputTriangles == String.null) throw "Unable to load triangles file!";
    else {
      var whichSetVert; // index of vertex in current triangle set
      var whichSetTri; // index of triangle in current triangle set
      var vtxToAdd; // vtx coords to add to the coord array
      var normToAdd; // vtx normal to add to the coord array
      var triToAdd; // tri indices to add to the index array
      var maxCorner = vec3.fromValues(Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE); // bbox corner
      var minCorner = vec3.fromValues(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE); // other corner

      // process each triangle set to load webgl vertex and triangle buffers
      numTriangleSets = inputTriangles.length; // remember how many tri sets
      for (var whichSet = 0; whichSet < numTriangleSets; whichSet++) {
        // for each tri set

        inputTriangles[whichSet].index = whichSet;
        // set up hilighting, modeling translation and rotation
        inputTriangles[whichSet].center = vec3.fromValues(0, 0, 0); // center point of tri set
        inputTriangles[whichSet].on = false; // not highlighted
        inputTriangles[whichSet].translation = vec3.fromValues(0, 0, 0); // no translation
        inputTriangles[whichSet].xAxis = vec3.fromValues(1, 0, 0); // model X axis
        inputTriangles[whichSet].yAxis = vec3.fromValues(0, 1, 0); // model Y axis

        // set up the vertex and normal arrays, define model center and axes
        inputTriangles[whichSet].glVertices = []; // flat coord list for webgl
        inputTriangles[whichSet].glNormals = []; // flat normal list for webgl
        var numVerts = inputTriangles[whichSet].vertices.length; // num vertices in tri set
        for (whichSetVert = 0; whichSetVert < numVerts; whichSetVert++) {
          // verts in set
          vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert]; // get vertex to add
          normToAdd = inputTriangles[whichSet].normals[whichSetVert]; // get normal to add
          inputTriangles[whichSet].glVertices.push(vtxToAdd[0], vtxToAdd[1], vtxToAdd[2]); // put coords in set coord list
          inputTriangles[whichSet].glNormals.push(normToAdd[0], normToAdd[1], normToAdd[2]); // put normal in set coord list
          vec3.max(maxCorner, maxCorner, vtxToAdd); // update world bounding box corner maxima
          vec3.min(minCorner, minCorner, vtxToAdd); // update world bounding box corner minima
          vec3.add(inputTriangles[whichSet].center, inputTriangles[whichSet].center, vtxToAdd); // add to ctr sum
        } // end for vertices in set
        vec3.scale(inputTriangles[whichSet].center, inputTriangles[whichSet].center, 1 / numVerts); // avg ctr sum

        textureCoordBuffers.push(gl.createBuffer());
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffers[whichSet]);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].uvs.flat()), gl.STATIC_DRAW);

        // send the vertex coords and normals to webGL
        vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].glVertices), gl.STATIC_DRAW); // data in
        normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].glNormals), gl.STATIC_DRAW); // data in

        // set up the triangle index array, adjusting indices across sets
        inputTriangles[whichSet].glTriangles = []; // flat index list for webgl
        triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length; // number of tris in this set
        for (whichSetTri = 0; whichSetTri < triSetSizes[whichSet]; whichSetTri++) {
          triToAdd = inputTriangles[whichSet].triangles[whichSetTri]; // get tri to add
          inputTriangles[whichSet].glTriangles.push(triToAdd[0], triToAdd[1], triToAdd[2]); // put indices in set list
        } // end for triangles in set

        // send the triangle indices to webGL
        triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(inputTriangles[whichSet].glTriangles), gl.STATIC_DRAW); // data in
      } // end for each triangle set
    } // end if triangle file loaded
  } catch (e) {
    // end try

    console.log(e);
  } // end catch
} // end load models

// setup the webGL shaders
function setupShaders() {
  // define vertex shader in essl using es6 template strings
  var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        attribute vec2 aTextureCoord;
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader


        varying highp vec2 vTextureCoord;
        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);

            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
            vTextureCoord = vec2(1.0 - aTextureCoord.x, 1.0 - aTextureCoord.y);
        }
    `;

  // define fragment shader in essl using es6 template strings
  var fShaderCode = `
        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;

        precision mediump float; // set float to medium precision

        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uAlpha;
        uniform float uShininess; // the specular exponent
        
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
            
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
            
            // combine to output color
            vec3 colorOut = ambient + diffuse + specular; // no specular yet

            vec4 textureVector = texture2D(uSampler, vTextureCoord);
            float t = uAlpha;
            if (uAlpha == 0.0) {
              t = textureVector.a;
            } 
            gl_FragColor = vec4(textureVector.rgb, textureVector.a*uAlpha);
        }
    `;

  try {
    var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
    gl.shaderSource(fShader, fShaderCode); // attach code to shader
    gl.compileShader(fShader); // compile the code for gpu execution

    var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
    gl.shaderSource(vShader, vShaderCode); // attach code to shader
    gl.compileShader(vShader); // compile the code for gpu execution

    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
      // bad frag shader compile
      throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
      gl.deleteShader(fShader);
    } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
      // bad vertex shader compile
      throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
      gl.deleteShader(vShader);
    } else {
      // no compile errors
      var shaderProgram = gl.createProgram(); // create the single shader program
      gl.attachShader(shaderProgram, fShader); // put frag shader in program
      gl.attachShader(shaderProgram, vShader); // put vertex shader in program
      gl.linkProgram(shaderProgram); // link program into gl context

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        // bad program link
        throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
      } else {
        // no shader program link errors
        gl.useProgram(shaderProgram); // activate shader program (frag and vert)

        textureAttribLoc = gl.getAttribLocation(shaderProgram, "aTextureCoord");
        gl.enableVertexAttribArray(textureAttribLoc);
        // locate and enable vertex attributes
        vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
        gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
        vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
        gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array

        // locate vertex uniforms
        mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
        pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat

        // locate fragment uniforms
        var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
        var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient");
        // ptr to light ambient
        var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
        var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
        var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
        ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
        diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
        specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
        alphaULoc = gl.getUniformLocation(shaderProgram, "uAlpha");
        shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess

        // pass global constants into fragment uniforms
        gl.uniform3fv(eyePositionULoc, Eye); // pass in the eye's position
        gl.uniform3fv(lightAmbientULoc, lightAmbient); // pass in the light's ambient emission

        gl.uniform3fv(lightDiffuseULoc, lightDiffuse); // pass in the light's diffuse emission
        gl.uniform3fv(lightSpecularULoc, lightSpecular); // pass in the light's specular emission
        gl.uniform3fv(lightPositionULoc, lightPosition); // pass in the light's position

        const programInfo = {
          program: shaderProgram,
          attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
          },
          uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
          },
        };

        gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
        gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
      } // end if no shader program link errors
    } // end if no compile errors
  } catch (e) {
    // end try

    console.log(e);
  } // end catch
} // end setup shaders

function pressKey(key) {
  handleKeyDown({
    code: key,
    getModifierState: (s) => true,
  });
}

function sendCurrentPosition() {
  if (gameConnected === true) {
    socket.send(
      JSON.stringify({
        screenId: screenId,
        position: { Eye, Center },
        angle: globalLookAtVector,
      })
    );
  }
}

// render the loaded model
function renderModels() {
  // construct the model transform matrix, based on model state

  if (gameOver && !winnerAnnounced) {
    if (winner) {
      console.log("you've lost");
    } else {
      console.log("you won");
    }
    winnerAnnounced = true;
  }

  let renderingTransparent = false;
  function makeModelTransform(currModel) {
    if (currModel.id === "Frog" && currentEnemyPosition !== undefined) {
      loadMinimap();
      let pos = vec3.create();
      vec3.subtract(pos, vec3.fromValues(...Object.values(currentEnemyPosition.position.Eye)), defaultEye);
      currModel.translation = pos;
      currModel.xAxis = vec3.fromValues(currentEnemyPosition.angle[0], 0, currentEnemyPosition.angle[2]);
    }
    var zAxis = vec3.create(),
      sumRotation = mat4.create(),
      temp = mat4.create(),
      negCtr = vec3.create();

    // move the model to the origin
    mat4.fromTranslation(mMatrix, vec3.negate(negCtr, currModel.center));

    // rotate the model to current interactive orientation
    vec3.normalize(zAxis, vec3.cross(zAxis, currModel.xAxis, currModel.yAxis)); // get the new model z axis
    mat4.set(
      sumRotation, // get the composite rotation
      currModel.xAxis[0],
      currModel.yAxis[0],
      zAxis[0],
      0,
      currModel.xAxis[1],
      currModel.yAxis[1],
      zAxis[1],
      0,
      currModel.xAxis[2],
      currModel.yAxis[2],
      zAxis[2],
      0,
      0,
      0,
      0,
      1
    );
    mat4.multiply(mMatrix, sumRotation, mMatrix); // R(ax) * S(1.2) * T(-ctr)

    // translate back to model center
    mat4.multiply(mMatrix, mat4.fromTranslation(temp, currModel.center), mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

    // translate model to current interactive orientation
    mat4.multiply(mMatrix, mat4.fromTranslation(temp, currModel.translation), mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)
  } // end make model transform

  // var hMatrix = mat4.create(); // handedness matrix
  var pMatrix = mat4.create(); // projection matrix
  var vMatrix = mat4.create(); // view matrix
  var mMatrix = mat4.create(); // model matrix
  var pvMatrix = mat4.create(); // hand * proj * view matrices
  var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
  window.requestAnimationFrame(renderModels); // set up frame render callback

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers

  // set up projection and view
  // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
  mat4.perspective(pMatrix, 0.4 * Math.PI, aspectRatio, 0.1, blockLength * maze.length + 5); // create projection matrix
  mat4.lookAt(vMatrix, Eye, Center, Up); // create view matrix
  mat4.multiply(pvMatrix, pvMatrix, pMatrix); // projection
  mat4.multiply(pvMatrix, pvMatrix, vMatrix); // projection * view

  // render each triangle set
  var currSet; // the tri set and its material properties

  let sortedTriangles = [...inputTriangles];
  sortedTriangles.sort((a, b) => b.material.alpha - a.material.alpha);
  sortedTriangles.forEach((triangle) => {
    whichTriSet = triangle.index;
    // inputTriangles[whichTriSet].index = whichTriSet;
    // let index = inputTriangles[whichTriSet].index;
    currSet = inputTriangles[whichTriSet];
    if (currSet.material.alpha === 1.0) {
      gl.depthMask(true);
    } else {
      gl.depthMask(false);
    }

    // make model transform, add to view project
    makeModelTransform(currSet);
    mat4.multiply(pvmMatrix, pvMatrix, mMatrix); // project * view * model
    gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
    gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix

    // reflectivity: feed to the fragment shader
    gl.uniform3fv(ambientULoc, currSet.material.ambient); // pass in the ambient reflectivity
    gl.uniform3fv(diffuseULoc, currSet.material.diffuse); // pass in the diffuse reflectivity
    gl.uniform3fv(specularULoc, currSet.material.specular); // pass in the specular reflectivity
    gl.uniform1f(alphaULoc, currSet.material.alpha);
    gl.uniform1f(shininessULoc, currSet.material.n); // pass in the specular exponent
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffers[whichTriSet]);
    gl.vertexAttribPointer(textureAttribLoc, 2, gl.FLOAT, false, 0, 0);

    // vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[whichTriSet]); // activate
    gl.vertexAttribPointer(vPosAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffers[whichTriSet]); // activate
    gl.vertexAttribPointer(vNormAttribLoc, 3, gl.FLOAT, false, 0, 0); // feed

    // Tell WebGL we want to affect texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // Bind the texture to texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texturesList[whichTriSet]);

    // Tell the shader we bound the texture to texture unit 0

    // triangle buffer: activate and render
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichTriSet]); // activate
    gl.drawElements(gl.TRIANGLES, 3 * triSetSizes[whichTriSet], gl.UNSIGNED_SHORT, 0); // render
  });
} // end render model

/* MAIN -- HERE is where execution begins after window load */

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
  if (textureMap.hasOwnProperty(url)) {
    return textureMap[url];
  }
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;

  image.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs. non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // No, it's not a power of 2. Turn off mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    }
  };
  textureMap[url] = texture;
  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}

let texturesList = [];

function loadSortedObjects() {
  let loadedInputTriangles = map;
  loadedInputTriangles = loadedInputTriangles.map((x) => ({
    ...x,
    xAxis: vec3.create(),
    yAxis: vec3.create(),
  }));
  let xOffset = -0.5;
  let yOffset = -0.5;
  let zOffset = -0.5;
  // if (makeItYourOwn) {
  //   loadedInputTriangles = icoSphere;
  //   let max = 1.0;
  //   let min = 0.0;
  //   loadedInputTriangles[0].uvs = loadedInputTriangles[0].vertices.map(() => [
  //     Math.random() * (max - min) + min,
  //     Math.random() * (max - min) + min,
  //   ]);
  //   loadedInputTriangles[0].vertices = loadedInputTriangles[0].vertices.map(
  //     (vertex) => [
  //       vertex[0] - xOffset,
  //       vertex[1] - yOffset,
  //       vertex[2] - zOffset,
  //     ]
  //   );
  // }

  loadedInputTriangles.sort((a, b) => b.material.alpha - a.material.alpha);
  let opaqueObjects = [];
  let transparentObjects = [];

  loadedInputTriangles.forEach((triangle) => {
    if (triangle.material.alpha >= 1.0) {
      opaqueObjects.push(triangle);
    } else {
      transparentObjects.push(triangle);
    }
  });

  inputTriangles = [...transparentObjects, ...opaqueObjects];
  texturesList = inputTriangles.map((triangle) => loadTexture(gl, `images/${triangle.material.texture}`));
}

function loadStuff() {
  loadSortedObjects();
  loadModels();
  footstepAudio = new Audio("./sounds/footsteps.wav");
}

function main() {
  Center = vec3.fromValues(
    defaultEye[0] - 0.1,
    defaultEye[1] - 0.1,
    defaultEye[2] - 0.1
  );
  Eye = vec3.clone(defaultEye);

  setupWebGL(); // set up the webGL environment

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  // load in the models from tri file
  loadStuff();
  loadMinimap();
  setupShaders(); // setup the webGL shaders
  renderModels();

  // draw the triangles using webGL
} // end main

function getIntersectionDirection(newEye) {
  checkCatch();
  let eyeGrid = [Math.floor(newEye[2] / blockLength), Math.floor(newEye[0] / blockLength)];
  let blocks = checkAdjacentBlocks(maze, eyeGrid);
  let boxPosition = [newEye[2] % blockLength, newEye[0] % blockLength];
  let isBlocked = false;
  // console.log(boxPosition, blocks);
  if (blocks.forward && boxPosition[1] + MOVEMENT_THRESHOLD >= blockLength) {
    // console.log("blocking forward");
    isBlocked = true;
  }
  if (blocks.back && boxPosition[1] - MOVEMENT_THRESHOLD <= 0) {
    // console.log("blocking back");
    isBlocked = true;
  }
  if (blocks.right && boxPosition[0] - MOVEMENT_THRESHOLD <= 0) {
    // console.log("blocking right");
    isBlocked = true;
  }
  if (blocks.left && boxPosition[0] + MOVEMENT_THRESHOLD >= blockLength) {
    // console.log("blocking left");
    isBlocked = true;
  }

  // let corners = [];
  // if (blocks.rightBack) {
  //   corners.push([Math.floor(newEye[0] / blockLength), Math.floor(newEye[2] / blockLength)]);
  // }
  // if (blocks.leftBack) {
  //   corners.push([Math.ceil(newEye[0] / blockLength), Math.floor(newEye[2] / blockLength)]);
  // }
  // if (blocks.rightForward) {
  //   corners.push([Math.floor(newEye[0] / blockLength), Math.ceil(newEye[2] / blockLength)]);
  // }
  // if (blocks.leftForward) {
  //   corners.push([Math.ceil(newEye[0] / blockLength), Math.ceil(newEye[2] / blockLength)]);
  // }

  // console.log(Eye[0], Eye[2]);
  // corners.forEach((corner) => {
  //   console.log(corner[0], corner[1]);
  //   if (euclideanDistance(newEye[0], newEye[2], corner[0], corner[1]) < MOVEMENT_THRESHOLD * 0.5) {
  //     isBlocked = true;
  //   }
  // });
  return isBlocked;
}

function checkAdjacentBlocks(mazeArray, currPosition) {
  let adjacentBlocks = {
    left: false,
    right: false,
    forward: false,
    back: false,
    rightBack: false,
    leftBack: false,
    rightForward: false,
    leftForward: false,
  };
  if (
    (currPosition[1] > 0 &&
      mazeArray[currPosition[1] - 1][currPosition[0]] === "#") ||
    currPosition[1] == 0
  ) {
    adjacentBlocks.back = true;
  }
  if (
    (currPosition[1] < mazeArray.length - 1 &&
      mazeArray[currPosition[1] + 1][currPosition[0]] === "#") ||
    currPosition[1] == maze.length - 1
  ) {
    adjacentBlocks.forward = true;
  }
  if (
    (currPosition[0] > 0 &&
      mazeArray[currPosition[1]][currPosition[0] - 1] === "#") ||
    currPosition[0] == 0
  ) {
    adjacentBlocks.right = true;
  }
  if (
    (currPosition[0] < mazeArray[0].length - 1 &&
      mazeArray[currPosition[1]][currPosition[0] + 1] === "#") ||
    currPosition[0] == maze.length - 1
  ) {
    adjacentBlocks.left = true;
  }
  if (
    currPosition[0] - 1 > -1 &&
    currPosition[1] - 1 > -1 &&
    mazeArray[currPosition[0] - 1][currPosition[1] - 1] == "#"
  ) {
    adjacentBlocks.leftBack = true;
  }
  if (
    currPosition[0] + 1 < maze.length &&
    currPosition[1] - 1 > -1 &&
    mazeArray[currPosition[0] + 1][currPosition[1] - 1] == "#"
  ) {
    adjacentBlocks.rightBack = true;
  }
  if (
    currPosition[0] - 1 > -1 &&
    currPosition[1] + 1 < maze.length &&
    mazeArray[currPosition[0] - 1][currPosition[1] + 1] == "#"
  ) {
    adjacentBlocks.lefttForward = true;
  }
  if (
    currPosition[0] + 1 < maze.length &&
    currPosition[1] + 1 < maze.length &&
    mazeArray[currPosition[0] + 1][currPosition[1] + 1] == "#"
  ) {
    adjacentBlocks.rightForward = true;
  }
  return adjacentBlocks;
}

function euclideanDistance(x1, y1, x2, y2) {
  // Calculate the squared differences
  const xDiffSquared = Math.pow(x2 - x1, 2);
  const yDiffSquared = Math.pow(y2 - y1, 2);

  // Sum the squared differences and take the square root
  const distance = Math.sqrt(xDiffSquared + yDiffSquared);

  return distance;
}

function checkCatch() {
  // console.log(
  //   "dist isssss: ",
  //   // currentEnemyPosition
  //   euclideanDistance(Eye, currentEnemyPosition.position.Eye)
  // );
  // if (!currentEnemyPosition?.position?.Eye) {
  //   return;
  // }
  let opponentEye = Object.values(currentEnemyPosition.position.Eye);
  let dist = euclideanDistance(Eye[2], Eye[0], opponentEye[2], opponentEye[0]);
  if (currentEnemyPosition?.position?.Eye && dist < catchDistance) {
    gameOver = true;
    sendGameOverMessage("seeker");
    if (role === "seeker") {
      winner = true;
    } else {
      winner = false;
    }
    console.log("caught!!!!!!! ");
  }
}

function sendGameOverMessage(winner) {
  if (gameConnected === true) {
    socket.send(
      JSON.stringify({
        type: "game_over",
        winner,
      })
    );
  }
}
