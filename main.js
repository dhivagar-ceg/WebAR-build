import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const start = async () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./target.mind",
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // Load central logo
  const loader = new THREE.TextureLoader();
  const logoTexture = await loader.loadAsync("./target-image.png");

  const logoPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.6),
    new THREE.MeshBasicMaterial({ map: logoTexture, transparent: true })
  );
  anchor.group.add(logoPlane);

  // Load GLB 3D model
  const gltfLoader = new GLTFLoader();
  gltfLoader.load("./avatar.glb", (gltf) => {
    const model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
    model.position.set(0, 0.6, 0);  // Above logo
    anchor.group.add(model);
  });

  // Videos and screen positions
  const videoFiles = ["video1.mp4", "video2.mp4", "video3.mp4", "video4.mp4"];
  const positions = [
    [-1.2, 0.7, 0],   // Top-left
    [1.2, 0.7, 0],    // Top-right
    [-1.2, -0.7, 0],  // Bottom-left
    [1.2, -0.7, 0]    // Bottom-right
  ];

  const videoPlanes = [];

  for (let i = 0; i < videoFiles.length; i++) {
    const video = document.createElement("video");
    video.src = videoFiles[i];
    video.crossOrigin = "anonymous";
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    const texture = new THREE.VideoTexture(video);
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.6),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    );

    plane.position.set(...positions[i]);
    plane.visible = true;
    anchor.group.add(plane);

    videoPlanes.push({ plane, video });
  }

  // Play videos one-by-one in a loop
  let currentIndex = 0;
  const playNextVideo = () => {
    videoPlanes.forEach(({ video }) => {
      video.pause();
      video.currentTime = 0;
    });

    const { video } = videoPlanes[currentIndex];
    video.play();
    video.onended = () => {
      currentIndex = (currentIndex + 1) % videoPlanes.length;
      playNextVideo();
    };
  };

  anchor.onTargetFound = () => {
    playNextVideo();
  };

  await mindarThree.start();
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
};

start();
