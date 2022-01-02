// const canvasElement = document.getElementsByClassName('output_canvas')[0];
// const canvasCtx = canvasElement.getContext('2d');
//, left_eye, left_eyebrow, right_eyebrow, nose, mouth } 
var colors = {
    background: '#EBE9F2',
    text: '#A6032F',
    decoration: '#F28DB2'
}
var camera_to_screen_rate = 1.0;
var image_base;

var right_eye = new FaceObject('右目');
var left_eye = new FaceObject('左目');
var right_eyebrow = new FaceObject('右眉');
var left_eyebrow = new FaceObject('左眉');
var nose = new FaceObject('鼻');
var mouth = new FaceObject('口');


function drawAllFaceParts() {
    right_eye.draw();
    left_eye.draw();
    right_eyebrow.draw();
    left_eyebrow.draw();
    nose.draw();
    mouth.draw();
}


var g_landmarks = [];
var g_landmarks_captured = [];
var rect_face;


var speaker = new p5.Speech(); // speech synthesis object



var capture;
var canvas_base;
var sound_cursor;
function setup() {

    let canvas_placeholder = document.querySelector('#canvas_placeholder');
    let canvas = createCanvas(
        canvas_placeholder.clientWidth,
        canvas_placeholder.clientWidth * (9 / 16));
    canvas_placeholder.appendChild(canvas.elt);


    canvas_base = createGraphics(1280, 720);


    startMediaPipeFaceMesh();
    pixelDensity(2);
    canvas_placeholder.addEventListener('mouseout',
        function () {
            if (g_mode == 'playing') {
                speaker.cancel();
                speaker.speak('マウスが出ました')
                console.log("mouse out");
            }
        });
    canvas_placeholder.addEventListener('mouseover',
        function () {
            if (g_mode == 'playing') {
                speaker.cancel();
                speaker.speak('マウスが入りました')
                console.log("mouse in");
            }
        });

    var lastmousex = -1;
    var lastmousey = -1;
    canvas_placeholder.addEventListener('mousemove',
        function (event) {
            if (g_mode == 'playing') {
                let speed = sqrt(pow(mouseX - lastmousex, 2) + pow(mouseY - lastmousey, 2));
                lastmousex = mouseX;
                lastmousey = mouseY;
                let notes;
                if (rect_face.inside(mouseX, mouseY)) {
                    notes = ['C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5'];
                } else {
                    notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
                }
                // note velocity (volume, from 0 to 1)
                let velocity = 0.3;
                // time from now (in seconds)
                let time = 0;
                // note duration (in seconds)
                let dur = 1 / 30;

                speed = map(speed, 0.0, 10.0, 0, 7);
                if (speed < 0) speed = 0;
                if (speed > 6) speed = 6;
                sound_cursor.play(notes[parseInt(speed)], velocity, time, dur);
                //console.log("mouse moving", speed);
            }
        });

    textSize(3);
    strokeWeight(0);
    textAlign(CENTER, CENTER);

    capture = createCapture(VIDEO);
    capture.size(1280, 720);
    capture.hide();

    speaker.setRate(1.2);
    textFont('Kaisei Tokumin');

    sound_cursor = new p5.MonoSynth();
    userStartAudio();
}


function drawMessage(_str) {
    fill(colors.decoration);
    textSize(width / 30);
    noStroke();
    textAlign(CENTER, CENTER);
    text(_str, width / 2, height - 1.5 * width / 30);

}
var g_mode = 'capture face';
var g_count = 0;
function draw() {
    camera_to_screen_rate = width / capture.width;
    background(colors.background);
    //if (canvas_base) image(canvas_base, 0, 0, width, height);

    //here
    textAlign(LEFT, TOP);
    textSize(width / 20);
    noStroke();
    fill(colors.text);
    text('ふくわらぶる', 20, 20);


    if (g_landmarks.length > 0) {

        if (g_mode == 'capture face') {
            //            console.log(g_mode);
            fill(0);
            stroke(colors.decoration);
            strokeWeight(3);
            textSize(3);
            beginShape(POINTS);
            let i = 0;
            for (landmark of g_landmarks) {
                vertex(width - landmark.x * width, landmark.y * height);
                i++;
            }
            endShape();

            // 枠と顔の一致度を計算する
            //width / 2, height / 2, height * 0.5, height * 0.6);
            //drawDaen(width / 2, height / 2, height * 0.5 / 2.0, height * 0.6 / 2.0);

            let points_outline = [];
            for (pos of pos_face_outline) {
                points_outline.push({
                    x: width * g_landmarks[pos].x,
                    y: height * g_landmarks[pos].y
                });
            }
            let distance = getEllipseMatching(
                width / 2, height / 2,
                height * 0.5 / 2.0, height * 0.6 / 2.0, points_outline);

            //drawFace();
            drawMessage('この丸に顔を合わせて下さい');
            let match = abs(100 - distance);
            if (match > 200) {
                match = 199;
            }
            if (match > 100) {
                match = 100 - match % 100;
            }
            drawFaceFrame(false);

            fill(colors.text);
            noStroke();
            text(parseInt(match) + '\% Matching', width / 2, height / 2);
            if (match >= 97) {
                g_count++;
            }
            else {
                g_count = 0;
            }
            if (g_count > 100) {
                g_mode = 'close your eyes';
                processCloseYourEyes();
            }
            rectMode(CORNER);
            stroke(colors.decoration);
            strokeWeight(10);
            line(
                width / 2 - 50, height / 2 + 20,
                width / 2 - 50 + g_count, height / 2 + 20,
            );


        }
        else if (g_mode == 'close your eyes') {

            drawFaceFrame(true);
            if (!g_eye_openness.isClosed()) {
                noStroke();
                fill(colors.text);
                textSize(width / 20);
                fill(colors.decoration);
                textSize(width / 30);
                strokeWeight(1);
                drawMessage("目を閉じてください");

                rectMode(CORNER);
                noFill();
                stroke(colors.decoration);
                rect(rect_face.x, rect_face.y,
                    rect_face.w, rect_face.h);

            }
            else {
                speaker.speak('福笑いスタートです。まずはマウスカーソルを動かしてパーツを探しましょう。目を開けると終了します。')
                right_eye.setRandomPosition();
                right_eyebrow.setRandomPosition();
                left_eye.setRandomPosition();
                left_eyebrow.setRandomPosition();
                nose.setRandomPosition();
                mouth.setRandomPosition();
                g_mode = 'playing';
                //stopMediaPipeFaceMesh();
            }
            drawAllFaceParts();
        }
        else if (g_mode == 'playing') {
            // デバッグ用
            // {
            //     drawFaceFrame(true);

            //     drawAllFaceParts();
            //     return;
            // }
            if (g_eye_openness.isClosed()) {
                drawFaceFrame(true);
                drawAllFaceParts();
                //drawFace();
            }
            else {
                speaker.cancel();
                speaker.speak('目を開けたので終了します。');
                g_mode = 'finished';
                document.querySelector('#button_download').disabled = false;
            }
        }
        else if (g_mode == 'finished') {
            drawFaceFrame(true);
            drawAllFaceParts();

        }

    }
}

function windowResized() {
    let canvas_placeholder = document.querySelector('#canvas_placeholder');
    resizeCanvas(
        canvas_placeholder.clientWidth,
        canvas_placeholder.clientWidth * (9 / 16));
}

function processCloseYourEyes() {
    // 顔のアウトラインからバウンディングボックスを作成しておく
    {
        let x_array = [];
        let y_array = [];
        for (pos of pos_face_outline) {
            x_array.push(g_landmarks[pos].x);
            y_array.push(g_landmarks[pos].y);
        }
        rect_face = getRectangle(x_array, y_array);
        rect_face.x = camera_to_screen_rate * rect_face.x;
        rect_face.y = camera_to_screen_rate * rect_face.y;
        rect_face.w = camera_to_screen_rate * rect_face.w;
        rect_face.h = camera_to_screen_rate * rect_face.h;
    }

    speaker.speak('目を閉じて下さい。ここからは音声にてご案内します。');
    let img = capture;
    g_landmarks_captured = g_landmarks;
    colors.skin = capture.get(capture.width / 2, capture.height / 2);
    canvas_base.image(capture, 0, 0, canvas_base.width, canvas_base.height);
    let margin = 0;
    {
        let x_array = [];
        let y_array = [];
        for (pos of pos_right_eye) {
            x_array.push(g_landmarks[pos].x);
            y_array.push(g_landmarks[pos].y);
        }
        let myrect = getRectangle(x_array, y_array);
        //console.log(rect_right_eye);
        right_eye.image = crop(capture,
            myrect.x, myrect.y,
            myrect.w, myrect.h);

        let rate = width / 1280;
        console.log(rate);
        right_eye.x = rate * (myrect.x) + margin / 2;
        right_eye.y = rate * (myrect.y) + margin / 2;
        right_eye.w = rate * (myrect.w + margin / 2);
        right_eye.h = rate * (myrect.h + margin / 2);
    }
    {
        let x_array = [];
        let y_array = [];
        for (pos of pos_right_eyebrow) {
            x_array.push(g_landmarks[pos].x);
            y_array.push(g_landmarks[pos].y);
        }
        let myrect = getRectangle(x_array, y_array);
        //console.log(rect_right_eye);
        right_eyebrow.image = crop(capture,
            myrect.x, myrect.y,
            myrect.w, myrect.h);
        right_eyebrow.x = camera_to_screen_rate * (myrect.x - margin / 2);
        right_eyebrow.y = camera_to_screen_rate * (myrect.y - margin / 2);
        right_eyebrow.w = camera_to_screen_rate * (myrect.w + margin / 2);
        right_eyebrow.h = camera_to_screen_rate * (myrect.h + margin / 2);
    }

    // LEFT EYE
    {
        let x_array = [];
        let y_array = [];
        for (pos of pos_left_eye) {
            x_array.push(g_landmarks[pos].x);
            y_array.push(g_landmarks[pos].y);
        }
        let myrect = getRectangle(x_array, y_array);
        //console.log(rect_right_eye);
        left_eye.image = crop(capture,
            myrect.x, myrect.y,
            myrect.w, myrect.h);
        left_eye.x = camera_to_screen_rate * (myrect.x - margin / 2);
        left_eye.y = camera_to_screen_rate * (myrect.y - margin / 2);
        left_eye.w = camera_to_screen_rate * (myrect.w + margin / 2);
        left_eye.h = camera_to_screen_rate * (myrect.h + margin / 2);
    }

    // LEFT EYEBROW
    {
        let x_array = [];
        let y_array = [];
        for (pos of pos_left_eyebrow) {
            x_array.push(g_landmarks[pos].x);
            y_array.push(g_landmarks[pos].y);
        }
        let myrect = getRectangle(x_array, y_array);
        //console.log(rect_right_eye);
        left_eyebrow.image = crop(capture,
            myrect.x, myrect.y,
            myrect.w, myrect.h);
        left_eyebrow.x = camera_to_screen_rate * (myrect.x - margin / 2);
        left_eyebrow.y = camera_to_screen_rate * (myrect.y - margin / 2);
        left_eyebrow.w = camera_to_screen_rate * (myrect.w + margin / 2);
        left_eyebrow.h = camera_to_screen_rate * (myrect.h + margin / 2);
    }

    // NOSE
    {
        let x_array = [];
        let y_array = [];
        for (pos of pos_nose) {
            x_array.push(g_landmarks[pos].x);
            y_array.push(g_landmarks[pos].y);
        }
        let myrect = getRectangle(x_array, y_array);
        //console.log(rect_right_eye);
        nose.image = crop(capture,
            myrect.x, myrect.y,
            myrect.w, myrect.h);
        nose.x = camera_to_screen_rate * (myrect.x - margin / 2);
        nose.y = camera_to_screen_rate * (myrect.y - margin / 2);
        nose.w = camera_to_screen_rate * (myrect.w + margin / 2);
        nose.h = camera_to_screen_rate * (myrect.h + margin / 2);
    }

    // MOUTH
    {
        let x_array = [];
        let y_array = [];
        for (pos of pos_mouth) {
            x_array.push(g_landmarks[pos].x);
            y_array.push(g_landmarks[pos].y);
        }
        let myrect = getRectangle(x_array, y_array);
        //console.log(rect_right_eye);

        mouth.image = crop(capture,
            myrect.x, myrect.y,
            myrect.w, myrect.h);
        mouth.x = camera_to_screen_rate * (myrect.x - margin / 2);
        mouth.y = camera_to_screen_rate * (myrect.y - margin / 2);
        mouth.w = camera_to_screen_rate * (myrect.w + margin / 2);
        mouth.h = camera_to_screen_rate * (myrect.h + margin / 2);
    }
}


function keyPressed() {
    if (key == ' ') {
        if (g_mode == 'capture face') {
            g_mode = 'close your eyes';
            processCloseYourEyes();
        }
    }
    else if (key == 'r') {
        g_mode = 'capture face';
        if (document.querySelector('video')) {
            stopMediaPipeFaceMesh();
        }
        startMediaPipeFaceMesh();
        canvas_base.background(colors.background);
    }

}

function toggleMediaPipeFaceMesh() {
    if (document.querySelector('video')) {
        stopMediaPipeFaceMesh();
    }
    else {
        startMediaPipeFaceMesh();
    }
}

function mouseMoved() {
    if (g_mode == 'playing') {
        right_eye.moved();
        right_eyebrow.moved();
        left_eye.moved();
        left_eyebrow.moved();
        nose.moved();
        mouth.moved();
    }
}

function mouseClicked() {
    if (g_mode == 'playing') {
        right_eye.clicked();
        right_eyebrow.clicked();
        left_eye.clicked();
        left_eyebrow.clicked();
        nose.clicked();
        mouth.clicked();
    }
}