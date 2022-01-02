function crop(image, x, y, w, h) {
    var cropped = createImage(w, h);
    cropped.copy(image, x, y, x + w, y + h, 0, 0, x + w, y + h)
    return cropped;
}

function getRectangle(x_array, y_array) {
    let maxval = {
        x: max(x_array),
        y: max(y_array)
    }
    let minval = {
        x: min(x_array),
        y: min(y_array)
    }

    let ret = {
        x: minval.x * capture.width,
        y: minval.y * capture.height,
        w: (maxval.x - minval.x) * capture.width,
        h: (maxval.y - minval.y) * capture.height,
        inside: function (_x, _y) {
            let x = (this.x)
            let y = (this.y)
            let w = this.w
            let h = this.h
            if (x <= _x && _x <= x + w &&
                y <= _y && _y <= y + h) {
                return true;
            }
            return false;
        }
    }
    return ret;
}

function download() {
    save('Fukuwarable.jpg');
}

function onlyFaceDownload() {

}


function drawFaceFrame(_fill) {
    rectMode(CENTER, CENTER);
    if (_fill) {
        fill(colors.skin);
        stroke(colors.decoration);
        noStroke();
        beginShape();
        for (pos of pos_face_outline) {
            vertex(
                width * g_landmarks_captured[pos].x,
                height * g_landmarks_captured[pos].y
            );
        }
        endShape(CLOSE);
    }
    else {
        noFill();
        stroke(colors.decoration);
        strokeWeight(5);
        ellipse(width / 2, height / 2, height * 0.5, height * 0.6);
    }

}

function drawFace() {
    if (g_landmarks.length > 0) {
        noFill();
        stroke(colors.decoration);
        strokeWeight(5);
        beginShape();
        for (pos of pos_mouth) {
            vertex(width * g_landmarks[pos].x,
                height * g_landmarks[pos].y);
        }
        endShape(CLOSE);
        beginShape();
        for (pos of pos_left_eye) {
            vertex(width * g_landmarks[pos].x,
                height * g_landmarks[pos].y);
        }
        endShape(CLOSE);
        beginShape();
        for (pos of pos_right_eye) {
            vertex(width * g_landmarks[pos].x,
                height * g_landmarks[pos].y);
        }
        endShape(CLOSE);
        beginShape();
        for (pos of pos_nose) {
            vertex(width * g_landmarks[pos].x,
                height * g_landmarks[pos].y);
        }
        endShape(CLOSE);
        beginShape();
        for (pos of pos_left_eyebrow) {
            vertex(width * g_landmarks[pos].x,
                height * g_landmarks[pos].y);
        }
        endShape(CLOSE);
        beginShape();
        for (pos of pos_right_eyebrow) {
            vertex(width * g_landmarks[pos].x,
                height * g_landmarks[pos].y);
        }
        endShape(CLOSE);
    }
}

function drawDaen(_x, _y, _a, _b) {
    beginShape();
    for (let x = 0; x < _a; x++) {
        vertex(x + _x, _y + _b * sqrt(1.0 - pow(x / _a, 2)));
    }
    endShape();

    //    let distance = 1.0 - (pow((mouseX - _x) / _a, 2) + pow((mouseY - _y) / _b, 2));

}

function getEllipseMatching(_x, _y, _a, _b, _points) {
    //console.log(_points);
    let distance = 0.0;
    for (point of _points) {
        distance += 1.0 - (pow((point.x - _x) / _a, 2) + pow((point.y - _y) / _b, 2));
    }
    return distance;

}