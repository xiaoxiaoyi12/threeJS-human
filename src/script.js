import * as THREE from 'three';
import './style.css'
import Stats from 'stats.js';
import GLTFLoader from 'three-gltf-loader'

let scene, renderer, camera, stats, texture;
let model, skeleton, mixer, clock;

let canvas = document.createElement("canvas");
const canvasRadius = 150
canvas.width = canvasRadius * 2;
canvas.height = canvasRadius * 2;
let ctx = canvas.getContext('2d');
// 矩形区域填充背景
ctx.fillStyle = "#888888";
ctx.fillRect(0, 0, canvas.width, canvas.height);


let x = canvas.width / 2,
  y = canvas.height / 2;
function draw() {
  ctx.translate(x, y); //将画布原点移到中心  默认画布原点在左上角
  ctx.save();
  //画大圆盘
  ctx.beginPath();
  ctx.arc(0, 0, canvasRadius, 0, Math.PI * 2);
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = '8';
  ctx.stroke();
  ctx.restore();

  //画小时数
  ctx.save();
  let hourNum = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
  ctx.font = '15px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';//水平对齐方式
  ctx.textBaseline = 'middle';//垂直方向上水平居中
  hourNum.forEach((item, index) => {
    let rad = Math.PI * 2 / 12 * index;
    let x = Math.cos(rad) * canvasRadius * 0.83;
    let y = Math.sin(rad) * canvasRadius * 0.83;
    ctx.fillText(item, x, y);
  })

  //画小数点
  for (let i = 0; i < 60; i++) {
    let rad = Math.PI * 2 / 60 * i;
    let x = Math.cos(rad) * canvasRadius * 0.92,
      y = Math.sin(rad) * canvasRadius * 0.92;
    if (i % 5 == 0) {
      //小时对应的点
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'green'
      ctx.fill();
    }
    else {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
    }
  }
  ctx.restore();
}
function drawDot() {
  ctx.save();
  ctx.beginPath(0, 0);
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = 'red';
  ctx.fill();
  ctx.restore();
}
function drawHour(h, m) {
  ctx.save();
  ctx.beginPath(0, 0);
  let rad = Math.PI * 2 / 12 * (h + m / 60);
  ctx.rotate(rad);//旋转的角度必须写在画线之前
  ctx.moveTo(0, 15);
  ctx.lineTo(0, -canvasRadius * 0.5);
  ctx.strokeStyle = 'green';
  ctx.lineWidth = '3'
  ctx.stroke();
  ctx.restore();
}
function drawMinute(m) {
  ctx.save();
  ctx.beginPath(0, 0);
  let rad = Math.PI * 2 / 60 * m;
  ctx.rotate(rad);
  ctx.moveTo(0, 15);
  ctx.lineTo(0, -canvasRadius * 0.6);
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = '2'
  ctx.stroke();
  ctx.restore();
}
function drawSecond(s) {
  ctx.save();
  ctx.beginPath();
  let rad = Math.PI * 2 / 60 * s;
  ctx.rotate(rad);
  ctx.moveTo(0, 15);
  ctx.lineTo(0, -canvasRadius * 0.7);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = '1'
  ctx.stroke();
  ctx.restore();
}
let timer = () => {
  setInterval(() => {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let date = new Date();
    let h = date.getHours(),
      m = date.getMinutes(),
      s = date.getSeconds();
    draw();
    drawDot();
    drawHour(h, m);
    drawMinute(m);
    drawSecond(s);
    ctx.restore();
  }, 1000)
}




init();
function init() {

  const container = document.getElementById('container');
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.set(2, 2, - 4);
  camera.lookAt(0, 1, 0);

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
  scene.name = 'jump'
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(20, 0, 20);
  scene.add(hemiLight);

  const ambient = new THREE.AmbientLight(0x444444)
  scene.add(ambient)

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
  texture = new THREE.CanvasTexture(canvas)
  texture.rotation = Math.PI
  texture.center.set(0.5, 0.5);// 设置纹理的旋转中心 默认(0,0)为什么不行呢？ (0.5, 0.5)对应纹理的正中心
  const mesh2 = new THREE.Mesh(new THREE.CircleBufferGeometry(radius, 80 * radius), new THREE.MeshStandardMaterial({ map: texture }));
  mesh2.rotation.x = - Math.PI / 2;
  mesh2.receiveShadow = true;
  scene.add(mesh2);

  const axisHelper = new THREE.AxesHelper();
  // scene.add(axisHelper)

  const loader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();
  loader.load('/textures/glb/stacy.glb', function (gltf) {
    textureLoader.load('/textures/glb/stacy.jpg', (texture) => {
      console.log(gltf)
      model = gltf.scene;
      const stacy = model.getObjectByName('stacy')
      stacy.material.map = texture
      stacy.material.map.flipY = false;
      scene.add(model);

      model.traverse(function (object) {
        if (object.isMesh) object.castShadow = true;

      });
      skeleton = new THREE.SkeletonHelper(model);
      skeleton.visible = false;
      scene.add(skeleton);

      const animation = gltf.animations[1];
      // animation.duration = 1;
      mixer = new THREE.AnimationMixer(model);
      const times = [], values = [], scales = [], angles = [];
      // let date = new Date();
      // let h = date.getHours(),
      //   m = date.getMinutes(),
      //   s = date.getSeconds();

      for (let i = 0; i < 60; i++) {
        let rad = Math.PI * 2 / 60 * (i);
        // console.log(rad)
        times.push(i)
        values.push(radius * 0.7 * Math.sin(rad), 0, -radius * 0.7 * Math.cos(rad))
        scales.push(0.25, 0.25, 0.25)
        angles.push(Math.PI / 2 - rad)
      }
      console.log(values)
      const posTrack = new THREE.KeyframeTrack('model.position', times, values);
      const scaleTrack = new THREE.KeyframeTrack('model.scale', times, scales);
      const rotateTrack = new THREE.KeyframeTrack('model.rotation[y]', times, angles);
      const duration = 60;
      const duration1 = animation.duration;
      const clip = new THREE.AnimationClip("circle", duration, [posTrack, scaleTrack, rotateTrack]);
      const clipWalk = new THREE.AnimationClip("circle1", duration1, [...animation.tracks]);

      const AnimationAction = mixer.clipAction(clip);
      const AnimationAction1 = mixer.clipAction(clipWalk);
      // console.log(duration / 60)
      //通过操作Action设置播放方式
      // AnimationAction.timeScale = duration1 / duration;//默认1，可以调节播放速度
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
  stats.update();
  let mixerUpdateDelta = clock.getDelta();
  mixer.update(mixerUpdateDelta);
  timer()
  texture.needsUpdate = true;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
