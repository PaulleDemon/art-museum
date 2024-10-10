import { Vector3, Object3D, Euler, Raycaster } from 'three';

const PI_2 = Math.PI / 2;



export default class SimpleFPControls {
  constructor(camera, model, container) {
    this.camera = camera;
	this.model = model;
    this.container = container;

    this._euler = new Euler(0, 0, 0, 'XYZ');

    this.movementSpeed = 50.0;
    this.lookSpeedX = 30.0;
    this.lookSpeedY = 30.0;

    this.pitch = new Object3D();
    this.yaw = new Object3D();
    this.yaw.add(this.pitch);
    this.pitch.add(this.camera);

    this.velocity = new Vector3();
    this.direction = new Vector3();

    // Raycaster for collision detection
    this.raycaster = new Raycaster();

    // Input state variables
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;

    // Event bindings
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);

    container.addEventListener('click', () => {
      this.container.requestPointerLock();
    });

    container.addEventListener('pointerlockchange', this.onPointerLockChange, false);
    container.addEventListener('mousemove', this.onMouseMove, false);
    container.addEventListener('keyup', this.onKeyUp, false);
    container.addEventListener('keydown', this.onKeyDown, false);
  }

  getObject() {
    return this.yaw;
}

  update(delta) {
    this.velocity.x -= this.velocity.x * 10.0 * delta;
    this.velocity.z -= this.velocity.z * 10.0 * delta;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
    this.direction.normalize(); // Ensure consistent movements in all directions

    // Calculate potential new position
    const newPosition = this.camera.position.clone();

    if (this.moveForward || this.moveBackward) {
      this.velocity.z -= this.direction.z * this.movementSpeed * delta;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x -= this.direction.x * this.movementSpeed * delta;
    }

    // Update position based on velocity
    newPosition.x += this.velocity.x * delta;
    newPosition.z += this.velocity.z * delta;

    // Check for collisions
    if (!this.checkCollision(newPosition)) {
      this.camera.position.copy(newPosition);
    }

    // Handle vertical movement (up/down)
    if (this.moveUp || this.moveDown) {
      const y_contrib = (Number(this.moveUp) - Number(this.moveDown)) / 25;
      this.camera.position.y += y_contrib;
    }
  }

  checkCollision(newPosition) {
    // Cast rays to check for collisions
    const rayDirection = new Vector3();
    const rayLength = 0.5; // Length of the ray for collision checking

	console.log("ray cater: ", this.raycaster, this.model.children, this.container)

    // Forward ray
    rayDirection.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
    this.raycaster.set(this.camera.position, rayDirection);
    const forwardIntersects = this.raycaster.intersectObjects(this.model, true);

    // Backward ray
    rayDirection.set(0, 0, 1).applyQuaternion(this.camera.quaternion);
    this.raycaster.set(this.camera.position, rayDirection);
    const backwardIntersects = this.raycaster.intersectObjects(this.model, true);

    // Left ray
    rayDirection.set(-1, 0, 0).applyQuaternion(this.camera.quaternion);
    this.raycaster.set(this.camera.position, rayDirection);
    const leftIntersects = this.raycaster.intersectObjects(this.model, true);

    // Right ray
    rayDirection.set(1, 0, 0).applyQuaternion(this.camera.quaternion);
    this.raycaster.set(this.camera.position, rayDirection);
    const rightIntersects = this.raycaster.intersectObjects(this.model, true);

    // Check for intersections
    const allIntersects = [
      ...forwardIntersects,
      ...backwardIntersects,
      ...leftIntersects,
      ...rightIntersects,
    ];

    for (let i = 0; i < allIntersects.length; i++) {
      if (allIntersects[i].distance < rayLength) {
        return true; // Collision detected
      }
    }

    return false; // No collisions
  }

  onMouseMove(event) {
	if (!this.enabled) return;

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

    this.yaw.rotation.y -= movementX * this.lookSpeed;
    this.pitch.rotation.x -= movementY * this.lookSpeed;
    this.pitch.rotation.x = Math.max(-PI_2, Math.min(PI_2, this.pitch.rotation.x));
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
        this.moveForward = true;
        break;
      case 'KeyS':
        this.moveBackward = true;
        break;
      case 'KeyA':
        this.moveLeft = true;
        break;
      case 'KeyD':
        this.moveRight = true;
        break;
      case 'KeyQ':
        this.moveUp = true;
        break;
      case 'KeyE':
        this.moveDown = true;
        break;
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
        this.moveForward = false;
        break;
      case 'KeyS':
        this.moveBackward = false;
        break;
      case 'KeyA':
        this.moveLeft = false;
        break;
      case 'KeyD':
        this.moveRight = false;
        break;
      case 'KeyQ':
        this.moveUp = false;
        break;
      case 'KeyE':
        this.moveDown = false;
        break;
    }
  }

  onPointerLockChange() {
	if (document.pointerLockElement === this.container) {
		this.enabled = true;
	  } else {
		this.enabled = false;
	  }
	}
}
