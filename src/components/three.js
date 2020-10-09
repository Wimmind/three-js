import * as THREE from 'three';

let camera, scene, renderer, geometrySphere,
    mouseDownMouseX, mouseDownMouseY, mouseDownLon, mouseDownLat,
    lon = 0, lat = 0, phi = 0, theta = 0;

export function moveCam({ x, y, z }) {
    camera.target = new THREE.Vector3(x, y, z);
}

export function posCam(img) {
    // const texture = new THREE.TextureLoader().load(img);
    // const material = new THREE.MeshBasicMaterial({map: texture});
    // scene.add( new THREE.Mesh(geometry, material));
    console.log(geometrySphere)
}

function initArrow() {
    let arrowGeometry = new THREE.Geometry();

    arrowGeometry.vertices.push(
        new THREE.Vector3(0, 0.5, -3),
        new THREE.Vector3(-0.5, -0.5, -3),
        new THREE.Vector3(0.5, -0.5, -3)
    );

    arrowGeometry.faces.push(new THREE.Face3(0, 1, 2));

    arrowGeometry.computeBoundingSphere();
    let material = new THREE.MeshBasicMaterial({ color: 'red' });
    let mesh = new THREE.Mesh(arrowGeometry, material);
    scene.add(mesh)
}

export function init(img) {
    // объявить камеру
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);

    geometrySphere = new THREE.SphereBufferGeometry(50, 60, 40);
    // -1 выворачивает сферу наизнанку и текстура накладывается изнутри а не снаружи
    geometrySphere.scale(-1, 1, 1);


    // наложить картинку
    var texture = new THREE.TextureLoader().load(img);
    var material = new THREE.MeshBasicMaterial({ map: texture });

    // сцена
    scene = new THREE.Scene();
    scene.add(new THREE.Mesh(geometrySphere, material));

    initArrow()

    const canvas = document.querySelector('#canvas');
    renderer = new THREE.WebGLRenderer({ canvas });

    // убрать размытие
    renderer.setPixelRatio(window.devicePixelRatio);


    document.addEventListener('mousedown', onPointerStart);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('wheel', onDocumentMouseWheel);
    document.addEventListener('resize', onWindowResize,);
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
}

function onPointerMove(event) {
    if (!mouseDownMouseX) return;
    var clientX = event.clientX;
    var clientY = event.clientY;
    lon = (mouseDownMouseX - clientX) * camera.fov / 600 + mouseDownLon;
    lat = (clientY - mouseDownMouseY) * camera.fov / 600 + mouseDownLat;
}

function onPointerUp() {
    mouseDownMouseX = null;
}


// колесико мыши 
function onDocumentMouseWheel(event) {
    var fov = camera.fov + event.deltaY * 0.05;
    camera.fov = THREE.Math.clamp(fov, 10, 75);
    camera.updateProjectionMatrix();
}

export function animate() {
    requestAnimationFrame(animate);
    const delta = 0.001;
    // азимут поворота камеры в градусах, вращаем камеру 
    lon = Math.max(-360, Math.min(360, lon));
    // угол места в градусах ограничиваем от -85 до 85
    lat = Math.max(-85, Math.min(85, lat));
    // пересчитываем в радианы
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    camera.target.x = delta * Math.sin(phi) * Math.cos(theta);
    camera.target.y = delta * Math.cos(phi);
    camera.target.z = delta * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);
    renderer.render(scene, camera);
}

