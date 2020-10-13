import * as THREE from 'three';
import textures from '../data';

let camera, scene, renderer, geometrySphere,
    mouseDownMouseX, mouseDownMouseY, mouseDownLon, mouseDownLat,
    lon = 0, lat = 0, phi = 0, theta = 0;

var mouse, raycaster, arrowGroup;

export function posCam() {
    // camera.target = new THREE.Vector3(1000, 1000, 1000);
    // camera.lookAt( camera.target );
    camera.position.set( 30, 100, 60 );
}

function matrixRotateForCoord({x,y,z},angle) {

    const cs = Math.cos(angle);
    const sn = Math.sin(angle); 
    const coef = 2;
    return {
        x: (x * cs - z * sn)*coef,
        y: y,
        z: (x * sn + z * cs)*coef
    }
}

function initArrows(siblings,coords) {
    arrowGroup = new THREE.Group();
    siblings.forEach(sibling=>{
        let arrowGeometry = new THREE.Geometry();

        const {x,y,z} = (textures.filter(({id})=>sibling===id)[0].coords);
        const coef = 4;
        const vec = {
            x: (x - coords.x),
            y: (y - coords.y),
            z: (z - coords.z)
        }
        const len_vec = Math.sqrt(vec.x**2+vec.y**2+vec.z**2);
        const unit_vec = {
            x: vec.x/len_vec,
            y: vec.y/len_vec,
            z: vec.z/len_vec
        }

        const p1 = matrixRotateForCoord(unit_vec,45)
        const p2 = matrixRotateForCoord(unit_vec,-45)

        arrowGeometry.vertices.push(
            new THREE.Vector3(p1.x, -3, p1.z),
            new THREE.Vector3(unit_vec.x*coef, -3, unit_vec.z*coef),
            new THREE.Vector3(p2.x, -3, p2.z)
        );

        arrowGeometry.faces.push(new THREE.Face3(0, 1, 2));

        arrowGeometry.computeBoundingSphere();
        let material = new THREE.LineBasicMaterial({ color: 'red', linewidth: 10 });
        let mesh = new THREE.Mesh(arrowGeometry, material);
        
        mesh.scale.x = .8;
       // mesh.scale.y = .8;

        arrowGroup.add(mesh);
    });

    scene.add(arrowGroup);
}

function initSphere(src) {
    geometrySphere = new THREE.SphereBufferGeometry(10, 60, 40);

    geometrySphere.scale(-1, 1, 1);

    // наложить картинку
    const img = process.env.PUBLIC_URL + `/textures/${src}`
    var texture = new THREE.TextureLoader().load(img);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometrySphere, material);

    scene.add(mesh);
}

export function init({id,src,siblings,coords}) {
    // объявить камеру
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);
    // объявить сцену
    scene = new THREE.Scene();

    initSphere(src)
    initArrows(siblings,coords)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    // убрать размытие
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.querySelector('.wrapper').innerHTML='';
    document.querySelector('.wrapper').appendChild(renderer.domElement);

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    const windowEvenets = [
        { action: 'mousedown', evt: onPointerStart },
        { action: 'mousemove', evt: onPointerMove },
        { action: 'mouseup', evt: onPointerUp },
        { action: 'wheel', evt: onDocumentMouseWheel },
        { action: 'resize', evt: onWindowResize }
    ]
    windowEvenets.forEach(({ action, evt }) => {
        document.addEventListener(action, evt);
    })
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerStart(event) {
    var clientX = event.clientX || event.touches[0].clientX;
    var clientY = event.clientY || event.touches[0].clientY;
    mouseDownMouseX = clientX;
    mouseDownMouseY = clientY;
    mouseDownLon = lon;
    mouseDownLat = lat;

    const intersects = getIntersects(event.layerX, event.layerY);
    if (intersects.length > 0) {
        const res = intersects.filter(function (res) {
            return res && res.object
        })[0];
        if (res && res.object) {
            console.log(res.object)
            console.log(scene.children)
        }
    }
}

function onPointerMove(event) {
    if (!mouseDownMouseX) return;
    var clientX = event.clientX;
    var clientY = event.clientY;
    lon = (mouseDownMouseX - clientX) * camera.fov / 600 + mouseDownLon;
    lat = (clientY - mouseDownMouseY) * camera.fov / 600 + mouseDownLat;

}

function getIntersects(x, y) {
    x = (x / window.innerWidth) * 2 - 1;
    y = - (y / window.innerHeight) * 2 + 1;

    mouse.set(x, y, 0.5);
    raycaster.setFromCamera(mouse, camera);

    return raycaster.intersectObject(arrowGroup, true);
}

function onPointerUp() {
    mouseDownMouseX = null;
}

function onDocumentMouseWheel(event) {
    var fov = camera.fov + event.deltaY * 0.05;
    camera.fov = THREE.Math.clamp(fov, 10, 75);
    camera.updateProjectionMatrix();
}

export function animate() {
    requestAnimationFrame(animate);
    update();
}

function update() {
    const delta = 500;

	lat = Math.max( - 85, Math.min( 85, lat ) );
    phi = THREE.MathUtils.degToRad( 90 - lat );
    theta = THREE.MathUtils.degToRad( lon );

    camera.target.x = delta * Math.sin( phi ) * Math.cos( theta );
    camera.target.y = delta * Math.cos( phi );
    camera.target.z = delta * Math.sin( phi ) * Math.sin( theta );
    camera.lookAt( camera.target );

    renderer.render(scene, camera);
}

