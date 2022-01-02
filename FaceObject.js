

var g_eye_openness = {
    left: 1.0,
    left_buffer: [],
    right_buffer: [],
    addBuffer: function () {
        this.left_buffer.unshift(this.left);
        this.right_buffer.unshift(this.right);
        if (this.left_buffer.length > this.buffer_size) {
            this.left_buffer.pop();
        }
        if (this.right_buffer.length > this.buffer_size) {
            this.right_buffer.pop();
        }
    },
    buffer_size: 10,
    left_smooth: 0.0,
    right_smooth: 0.0,
    sensitivity: 0.02,
    right: 1.0,
    threshold: 0.01,
    is_closed: false,
    isClosed: function () {
        if (this.left_smooth < this.threshold && this.right_smooth < this.threshold) {
            return true;
        }
        return false;
    },
    isJustClosed: function () {
        if (this.left_smooth < this.threshold && this.right_smooth < this.threshold
            && this.is_closed == false) {
            this.is_closed = true;
            return true;
        }
        this.is_closed = false;
        return false;
    }
}


class FaceObject {
    constructor(_name) {
        this.image = null;
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.is_hover = false;
        this.is_selected = false;
        this.name = _name;
    }
    draw() {
        image(this.image,
            this.x,
            this.y,
            this.w,
            this.h);
    }
    setRandomPosition() {
        this.setPosition(random(0.1, 1.0), random(0.1, 1.0));
    }
    setPosition(_x, _y) {
        this.x = width * _x;
        this.y = height * _y;
    }
    clicked() {
        if (this.inside()) {
            this.is_selected = !this.is_selected;
            if (this.is_selected) {
                speaker.speak(this.name + 'を持ちました')
            }
            else {
                speaker.speak(this.name + 'を置きました')
            }
        }
    }
    moved() {
        if (this.is_selected) {
            this.x = mouseX - this.w / 2;
            this.y = mouseY - this.h / 2;
        }
        if (this.is_hover == false && this.inside()) {
            speaker.speak(this.name + "です.");
            this.is_hover = true;
        }
        else if (!this.inside()) {
            this.is_hover = false;
        }
    }
    inside() {
        let x = (this.x)
        let y = (this.y)
        let w = this.w
        let h = this.h
        if (x <= mouseX && mouseX <= x + w &&
            y <= mouseY && mouseY <= y + h) {
            return true;
        }
        return false;
    }
}