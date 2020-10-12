import * as THREE from 'three';

let camera, scene, renderer, geometrySphere,
    mouseDownMouseX, mouseDownMouseY, mouseDownLon, mouseDownLat,
    lon = 0, lat = 0, phi = 0, theta = 0;

var mouse, raycaster, arrowGroup;

export function moveCam({ x, y, z }) {
    camera.target = new THREE.Vector3(x, y, z);
}

export function posCam(img) {
    // const texture = new THREE.TextureLoader().load(img);
    // const material = new THREE.MeshBasicMaterial({map: texture});
    // scene.add( new THREE.Mesh(geometry, material));
    console.log(scene.children)
}

function initArrow() {
    let arrowGeometry = new THREE.Geometry();

    arrowGeometry.vertices.push(
        new THREE.Vector3(0, -3, -7),
        new THREE.Vector3(-1, -3, -4),
        new THREE.Vector3(1, -3, -4)
    );

    arrowGeometry.faces.push(new THREE.Face3(0, 1, 2));

    arrowGeometry.computeBoundingSphere();
    let material = new THREE.MeshBasicMaterial({ color: 'red', thickness: 10 });
    let mesh = new THREE.Mesh(arrowGeometry, material);

    arrowGroup = new THREE.Group();
    arrowGroup.add(mesh);
    scene.add(arrowGroup);
}

function initSpheres(textures) {
    textures.forEach(({src,coords})=>{
        geometrySphere = new THREE.SphereBufferGeometry(10, 60, 40);
    
        geometrySphere.scale(-1, 1, 1);
    
        // наложить картинку
        const img = process.env.PUBLIC_URL + `/textures/${src}`
        var texture = new THREE.TextureLoader().load(img);
        var material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometrySphere, material);
        scene.add(mesh);
        const {x,y,z} = coords;
        mesh.position.set(x*20, y*20, z*20);
    })

}

export function init(textures) {
    // объявить камеру
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);
    // сцена
    scene = new THREE.Scene();

    initSpheres(textures)
    initArrow()

    renderer = new THREE.WebGLRenderer({ antialias: true });
    // убрать размытие
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
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
        var res = intersects.filter(function (res) {
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
    render();
}

function render() {
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

