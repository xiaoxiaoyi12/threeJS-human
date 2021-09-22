import * as THREE from 'three';
import Stats from 'stats.js';
import GLTFLoader from 'three-gltf-loader'

let scene, renderer, camera, stats;
let model, skeleton, mixer, clock;


init();

function init() {

  const container = document.getElementById('container');
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(2, 2, - 4);
  camera.lookAt(0, 1, 0);

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(20, 0, 20);
  scene.add(hemiLight);

//   const ambient = new THREE.AmbientLight(0x444444)
// scene.add(ambient)

  const dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(5, 10, -10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;  
  dirLight.shadow.mapSize.height = 1024; 
  dirLight.shadow.camera.top = 2;
  dirLight.shadow.camera.bottom = - 2;
  dirLight.shadow.camera.left = - 2;
  dirLight.shadow.camera.right = 2;
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 40;
  scene.add(dirLight);

  // scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

  // ground
  const radius = 1.2
  const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x999999, depthWrite: false }));
  mesh.rotation.x = - Math.PI / 2;
  mesh.receiveShadow = true;
  scene.add(mesh);
  const mesh2 = new THREE.Mesh(new THREE.CircleBufferGeometry(radius, 80 * radius), new THREE.MeshStandardMaterial({ color: 0xffff00, depthWrite: false }));
  mesh2.rotation.x = - Math.PI / 2;
  mesh2.receiveShadow = true;
  scene.add(mesh2);

  const loader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();
  // loader.load( 'models/gltf/Soldier.glb', function ( gltf ) {
  loader.load('/textures/glb/stacy.glb', function (gltf) {
    textureLoader.load('/textures/glb/stacy.jpg', (texture) => {
      model = gltf.scene;
      console.log(model)
      model.children[0].children[1].material.map = texture
      model.children[0].children[1].material.map.flipY=false;
      scene.add(model);

      model.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;

      });
      skeleton = new THREE.SkeletonHelper(model);
      skeleton.visible = false;
      scene.add(skeleton);

      const animation = gltf.animations[1];
      mixer = new THREE.AnimationMixer(model);
      const times = [], values = [], scales = [], angles = [];
      for (let i = 0; i < Math.PI * 2; i = i + Math.PI * 0.0001) {
        times.push(i)
        values.push(radius * 0.9 * Math.sin(i), 0, radius * 0.9 * Math.cos(i))
        scales.push(0.3, 0.3, 0.3)
        // angles.push(new THREE.Euler(i,0,i))
        angles.push(Math.PI / 2 + i)
      }
      const posTrack = new THREE.KeyframeTrack('model.position', times, values);
      const scaleTrack = new THREE.KeyframeTrack('model.scale', times, scales);
      const rotateTrack = new THREE.KeyframeTrack('model.rotation[y]', times, angles);
      const duration = Math.PI * 2;
      const duration1 = animation.duration;
      const clip = new THREE.AnimationClip("circle", duration, [posTrack, scaleTrack, rotateTrack]);
      // console.log(clip)
      const clipWalk = new THREE.AnimationClip("circle1", duration1, [...animation.tracks]);

      const AnimationAction = mixer.clipAction(clip);
      const AnimationAction1 = mixer.clipAction(clipWalk);

      //通过操作Action设置播放方式
      AnimationAction.timeScale = 0.5;//默认1，可以调节播放速度
      AnimationAction.play()
      AnimationAction1.play()
      animate();
    });
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener('resize', onWindowResize);
}


function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {

  // Render loop
  requestAnimationFrame(animate);

  let mixerUpdateDelta = clock.getDelta();

  mixer.update(mixerUpdateDelta);

  stats.update();

  renderer.render(scene, camera);

}
