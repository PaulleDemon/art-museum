import * as THREE from 'three';

import { Capsule } from "three/examples/jsm/math/Capsule.js";
import { Octree } from "three/examples/jsm/math/Octree.js";


const GRAVITY = 30;


export default class FirstPersonPlayer{

    constructor(camera, scene, container=document){

        this.camera = camera
        this.scene = scene
        this.container = container || document

        this.worldOctree = new Octree();


        this.playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35); // helps collision detection
        this.playerVelocity = new THREE.Vector3();
        this.playerDirection = new THREE.Vector3();


        this.playerOnFloor = false;
        this.mousePress = false;
        // this.mouseTime = 0;

        this.keyStates = {};

        this.container.addEventListener('keydown', (event) => {

            this.keyStates[event.code] = true;
        
        });
        
        this.container.addEventListener('keyup', (event) => {
        
            this.keyStates[event.code] = false;
        })

        this.container.addEventListener('mousedown', () => {

            this.mousePress = true
            // document.body.requestPointerLock();
        
            // console.log("Pointer lock element", document.pointerLockElement)
        
            // if (document.pointerLockElement !== container)
            //     container.requestPointerLock();
        
        });

        this.container.addEventListener("mouseup", () => {
            this.mousePress = false;
        })

        this.container.addEventListener('mousemove', (event) => {

            if (document.pointerLockElement === this.container) {
        
                // this.camera.rotation.y -= event.movementX / 500;
                // this.camera.rotation.x -= event.movementY / 500;
        
            }

            if (this.mousePress){
                this.camera.rotation.y -= event.movementX / 500;
                this.camera.rotation.x -= event.movementY / 500;
            }
        });

        this.playerCollisions = this.playerCollisions.bind(this)
        
        this.update = this.update.bind(this)
        this.updatePlayer = this.updatePlayer.bind(this)

        this.loadOctaTree = this.loadOctaTree.bind(this)

    }

    loadOctaTree(scene){
        this.worldOctree.fromGraphNode(scene)
    }

    playerCollisions() {

        const result = this.worldOctree.capsuleIntersect(this.playerCollider);
    
        this.playerOnFloor = false;
    
        if (result) {
    
            this.playerOnFloor = result.normal.y > 0;
    
            if (!this.playerOnFloor) {
    
                this.playerVelocity.addScaledVector(result.normal, - result.normal.dot(this.playerVelocity));
    
            }
    
            if (result.depth >= 1e-10) {
    
                this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
    
            }
    
        }
    
    }

    updatePlayer(deltaTime) {

        let damping = Math.exp(- 4 * deltaTime) - 1;
    
        if (!this.playerOnFloor) {
    
            this.playerVelocity.y -= GRAVITY * deltaTime;
    
            // small air resistance
            damping *= 0.1;
    
        }
    
        this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    
        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
        this.playerCollider.translate(deltaPosition);
    
        this.playerCollisions();
    
        this.camera.position.copy(this.playerCollider.end);
    
    }
    

    update(deltaTime){
        this.updatePlayer(deltaTime)
        this.updateControls(deltaTime)
        this.teleportPlayerIfOob()
    }


    getForwardVector() {

        this.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
    
        return this.playerDirection;
    
    }
    
    getSideVector() {
    
        this.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        this.playerDirection.cross(this.camera.up);
    
        return this.playerDirection;
    
    }
    
    updateControls(deltaTime) {
    
        // gives a bit of air control
        const speedDelta = deltaTime * (this.playerOnFloor ? 25 : 8);
    
    
        if (this.keyStates['KeyW']) {
    
            this.playerVelocity.add(this.getForwardVector().multiplyScalar(speedDelta));
    
        }
    
        if (this.keyStates['KeyS']) {
    
            this.playerVelocity.add(this.getForwardVector().multiplyScalar(- speedDelta));
    
        }
    
        if (this.keyStates['KeyA']) {
    
            this.playerVelocity.add(this.getSideVector().multiplyScalar(- speedDelta));
    
        }
    
        if (this.keyStates['KeyD']) {
    
            this.playerVelocity.add(this.getSideVector().multiplyScalar(speedDelta));
    
        }
    
        if (this.playerOnFloor) {
    
            if (this.keyStates['Space']) {
    
                this.playerVelocity.y = 15;
    
            }
    
        }
    
    }

    teleportPlayerIfOob() {

        if (this.camera.position.y <= - 25) {
    
            this.playerCollider.start.set(0, 0.35, 0);
            this.playerCollider.end.set(0, 1, 0);
            this.playerCollider.radius = 0.35;
            this.camera.position.copy(this.playerCollider.end);
            this.camera.rotation.set(0, 0, 0);
    
        }
    
    }
    
}