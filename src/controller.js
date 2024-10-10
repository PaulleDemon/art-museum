const KEYS = {
    'a': 65,
    's': 83,
    'w': 87,
    'd': 68,
};

function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}

class InputController {
    constructor(target) {
        this.target_ = target || document;
        this.initialize_();
    }

    initialize_() {
        this.current_ = {
            leftButton: false,
            rightButton: false,
            mouseXDelta: 0,
            mouseYDelta: 0,
            mouseX: 0,
            mouseY: 0,
        };
        this.previous_ = null;
        this.keys_ = {};
        this.previousKeys_ = {};
        this.target_.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
        this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
        this.target_.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
        this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
        this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
    }

    onMouseMove_(e) {
        this.current_.mouseX = e.pageX - window.innerWidth / 2;
        this.current_.mouseY = e.pageY - window.innerHeight / 2;

        if (this.previous_ === null) {
            this.previous_ = { ...this.current_ };
        }

        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
    }

    onMouseDown_(e) {
        this.onMouseMove_(e);

        switch (e.button) {
            case 0: {
                this.current_.leftButton = true;
                break;
            }
            case 2: {
                this.current_.rightButton = true;
                break;
            }
        }
    }

    onMouseUp_(e) {
        this.onMouseMove_(e);

        switch (e.button) {
            case 0: {
                this.current_.leftButton = false;
                break;
            }
            case 2: {
                this.current_.rightButton = false;
                break;
            }
        }
    }

    onKeyDown_(e) {
        this.keys_[e.keyCode] = true;
    }

    onKeyUp_(e) {
        this.keys_[e.keyCode] = false;
    }

    key(keyCode) {
        return !!this.keys_[keyCode];
    }

    isReady() {
        return this.previous_ !== null;
    }

    update(_) {
        if (this.previous_ !== null) {
            this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
            this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

            this.previous_ = { ...this.current_ };
        }
    }
};


export default class FirstPersonCamera {
    constructor(camera, objects, container=document) {
        this.camera_ = camera;
        this.input_ = new InputController(container);
        this.rotation_ = new THREE.Quaternion();
        this.translation_ = new THREE.Vector3(0, 2, 0);
        this.phi_ = 0;
        this.phiSpeed_ = 6;
        this.theta_ = 0;
        this.thetaSpeed_ = 5;
        // this.headBobActive_ = false;
        // this.headBobTimer_ = 0;
        this.objects_ = objects;
    }

    update(timeElapsedS) {
        this.updateRotation_(timeElapsedS);
        this.updateCamera_(timeElapsedS);
        this.updateTranslation_(timeElapsedS);
        // this.updateHeadBob_(timeElapsedS);
        this.input_.update(timeElapsedS);
    }

    updateCamera_(_) {
        this.camera_.quaternion.copy(this.rotation_);
        this.camera_.position.copy(this.translation_);
        // this.camera_.position.y += Math.sin(this.headBobTimer_ * 10) * 1.5;

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.rotation_);

        const dir = forward.clone();

        forward.multiplyScalar(100);
        forward.add(this.translation_);

        let closest = forward;
        const result = new THREE.Vector3();
        const ray = new THREE.Ray(this.translation_, dir);
        // console.log("ray: ", ray, this.objects_)
        for (let i = 0; i < this.objects_.length; ++i) {
            const box = new THREE.Box3().setFromObject(this.objects_[i]); 
            if (ray.intersectBox(box, result)) {
                if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
                    closest = result.clone();
                }
            }
        }

        this.camera_.lookAt(closest);
    }

    updateHeadBob_(timeElapsedS) {
        if (this.headBobActive_) {
            const wavelength = Math.PI;
            const nextStep = 1 + Math.floor(((this.headBobTimer_ + 0.000001) * 10) / wavelength);
            const nextStepTime = nextStep * wavelength / 10;
            this.headBobTimer_ = Math.min(this.headBobTimer_ + timeElapsedS, nextStepTime);

            if (this.headBobTimer_ == nextStepTime) {
                this.headBobActive_ = false;
            }
        }
    }

    updateTranslation_(timeElapsedS) {
        const forwardVelocity = (this.input_.key(KEYS.w) ? 1 : 0) + (this.input_.key(KEYS.s) ? -1 : 0)
        const strafeVelocity = (this.input_.key(KEYS.a) ? 1 : 0) + (this.input_.key(KEYS.d) ? -1 : 0)

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        forward.multiplyScalar(forwardVelocity * timeElapsedS * 10);

        const left = new THREE.Vector3(-1, 0, 0);
        left.applyQuaternion(qx);
        left.multiplyScalar(strafeVelocity * timeElapsedS * 10);

        this.translation_.add(forward);
        this.translation_.add(left);

        // if (forwardVelocity != 0 || strafeVelocity != 0) {
        //     this.headBobActive_ = true;
        // }
    }

    updateRotation_(timeElapsedS) {
        const xh = this.input_.current_.mouseXDelta / window.innerWidth;
        const yh = this.input_.current_.mouseYDelta / window.innerHeight;

        this.phi_ += -xh * this.phiSpeed_;
        this.theta_ = clamp(this.theta_ + -yh * this.thetaSpeed_, -Math.PI / 3, Math.PI / 3);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi_);
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta_);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this.rotation_.copy(q);
    }
}