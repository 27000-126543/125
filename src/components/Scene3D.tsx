import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useStore } from '@/store/useStore';

const Scene3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number>(0);
  const objectsRef = useRef<Record<string, THREE.Group>>({});

  const drillingModules = useStore((state) => state.drillingModules);
  const pipelines = useStore((state) => state.pipelines);
  const isDrillActive = useStore((state) => state.isDrillActive);
  const evacuationPaths = useStore((state) => state.evacuationPaths);
  const fireboatPaths = useStore((state) => state.fireboatPaths);
  const selectedModuleId = useStore((state) => state.selectedModuleId);
  const selectModule = useStore((state) => state.selectModule);
  const unauthorizedAccess = useStore((state) => state.unauthorizedAccess);

  const createDrillingRig = (id: string, position: THREE.Vector3, index: number) => {
    const group = new THREE.Group();
    group.name = id;
    group.position.copy(position);

    const baseGeometry = new THREE.BoxGeometry(6, 0.5, 6);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.25;
    group.add(base);

    const legGeometry = new THREE.CylinderGeometry(0.3, 0.4, 8, 8);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
    const legPositions = [[-2.5, 4, -2.5], [2.5, 4, -2.5], [-2.5, 4, 2.5], [2.5, 4, 2.5]];
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(pos[0], pos[1], pos[2]);
      group.add(leg);
    });

    const platformGeometry = new THREE.BoxGeometry(7, 0.3, 7);
    const platformMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = 8;
    group.add(platform);

    const derrickGeometry = new THREE.BoxGeometry(1, 6, 1);
    const derrickMaterial = new THREE.MeshPhongMaterial({ color: 0x5d6d7e });
    const derrick = new THREE.Mesh(derrickGeometry, derrickMaterial);
    derrick.position.set(0, 11, 0);
    group.add(derrick);

    const topDriveGeometry = new THREE.BoxGeometry(1.5, 0.8, 1.5);
    const topDriveMaterial = new THREE.MeshPhongMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.3 });
    const topDrive = new THREE.Mesh(topDriveGeometry, topDriveMaterial);
    topDrive.position.set(0, 8.5, 0);
    topDrive.name = 'topDrive';
    group.add(topDrive);

    const pipeGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
    const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    const drillPipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    drillPipe.position.set(0, 6, 0);
    drillPipe.name = 'drillPipe';
    group.add(drillPipe);

    const bopGeometry = new THREE.BoxGeometry(1.2, 1, 1.2);
    const bopMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
    const bop = new THREE.Mesh(bopGeometry, bopMaterial);
    bop.position.set(0, 8.2, 0);
    bop.name = 'bop';
    group.add(bop);

    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 256;
    labelCanvas.height = 64;
    const labelCtx = labelCanvas.getContext('2d')!;
    labelCtx.fillStyle = 'rgba(10, 22, 40, 0.9)';
    labelCtx.fillRect(0, 0, 256, 64);
    labelCtx.strokeStyle = '#00d4ff';
    labelCtx.lineWidth = 2;
    labelCtx.strokeRect(0, 0, 256, 64);
    labelCtx.fillStyle = '#00d4ff';
    labelCtx.font = 'bold 24px Arial';
    labelCtx.textAlign = 'center';
    labelCtx.fillText(`钻井模块 ${index + 1}#`, 128, 40);

    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });
    const label = new THREE.Sprite(labelMaterial);
    label.position.set(0, 15, 0);
    label.scale.set(6, 1.5, 1);
    group.add(label);

    const clickArea = new THREE.Mesh(
      new THREE.BoxGeometry(8, 16, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    clickArea.position.y = 8;
    clickArea.name = 'clickArea';
    group.add(clickArea);

    return group;
  };

  const createLivingQuarters = () => {
    const group = new THREE.Group();
    group.name = 'livingQuarters';
    group.position.set(-15, 0, -10);

    const buildingGeometry = new THREE.BoxGeometry(10, 6, 8);
    const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 3;
    group.add(building);

    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.5 });
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 2; j++) {
        const windowGeometry = new THREE.BoxGeometry(1, 1, 0.1);
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(-3 + i * 3, 1.5 + j * 2.5, 4.1);
        group.add(windowMesh);
      }
    }

    const helipadGeometry = new THREE.CylinderGeometry(4, 4, 0.2, 32);
    const helipadMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    const helipad = new THREE.Mesh(helipadGeometry, helipadMaterial);
    helipad.position.set(12, 0.1, -10);
    helipad.name = 'helipad';
    group.add(helipad);

    const hGeometry = new THREE.BoxGeometry(0.3, 0.25, 2);
    const hMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const h1 = new THREE.Mesh(hGeometry, hMaterial);
    h1.position.set(12, 0.25, -10);
    group.add(h1);
    const h2 = new THREE.Mesh(new THREE.BoxGeometry(2, 0.25, 0.3), hMaterial);
    h2.position.set(12, 0.25, -10);
    group.add(h2);

    if (unauthorizedAccess) {
      const alarmGeometry = new THREE.RingGeometry(4, 4.5, 32);
      const alarmMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const alarm = new THREE.Mesh(alarmGeometry, alarmMaterial);
      alarm.rotation.x = -Math.PI / 2;
      alarm.position.set(12, 0.3, -10);
      alarm.name = 'helipadAlarm';
      group.add(alarm);
    }

    return group;
  };

  const createProcessingModule = () => {
    const group = new THREE.Group();
    group.name = 'processingModule';
    group.position.set(15, 0, 10);

    const separatorGeometry = new THREE.CylinderGeometry(1.5, 1.5, 5, 16);
    const separatorMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
    
    for (let i = 0; i < 3; i++) {
      const separator = new THREE.Mesh(separatorGeometry, separatorMaterial);
      separator.position.set(-4 + i * 4, 2.5, 0);
      separator.name = `separator-${i + 1}`;
      group.add(separator);

      const topGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16);
      const topMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c });
      const top = new THREE.Mesh(topGeometry, topMaterial);
      top.position.set(-4 + i * 4, 5.25, 0);
      group.add(top);

      const levelGeometry = new THREE.BoxGeometry(0.3, 3, 0.1);
      const levelMaterial = new THREE.MeshPhongMaterial({ color: 0x2ecc71, emissive: 0x2ecc71, emissiveIntensity: 0.3 });
      const level = new THREE.Mesh(levelGeometry, levelMaterial);
      level.position.set(-4 + i * 4, 2, 1.6);
      level.name = `level-${i + 1}`;
      group.add(level);
    }

    const pipeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 10, 8);
    const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0x7f8c8d });
    const pipe1 = new THREE.Mesh(pipeGeometry, pipeMaterial);
    pipe1.rotation.z = Math.PI / 2;
    pipe1.position.set(0, 6, 0);
    group.add(pipe1);

    return group;
  };

  const createFlareStack = () => {
    const group = new THREE.Group();
    group.name = 'flareStack';
    group.position.set(25, 0, -5);

    const towerGeometry = new THREE.CylinderGeometry(0.5, 0.8, 12, 8);
    const towerMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    const tower = new THREE.Mesh(towerGeometry, towerMaterial);
    tower.position.y = 6;
    group.add(tower);

    const pipeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 10, 8);
    const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
    const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
    pipe.position.set(0, 11, 0);
    group.add(pipe);

    const fireGeometry = new THREE.ConeGeometry(1, 3, 8);
    const fireMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.8, transparent: true, opacity: 0.9 });
    const fire = new THREE.Mesh(fireGeometry, fireMaterial);
    fire.position.set(0, 17, 0);
    fire.name = 'flareFire';
    group.add(fire);

    const light = new THREE.PointLight(0xff6600, 2, 20);
    light.position.set(0, 17, 0);
    group.add(light);

    return group;
  };

  const createSubseaPipeline = () => {
    const group = new THREE.Group();
    group.name = 'subseaPipeline';
    group.position.set(0, -5, 20);

    const pipelineData = pipelines[0];
    if (pipelineData) {
      const pipeGeometry = new THREE.CylinderGeometry(0.5, 0.5, 25, 16);
      const pipeMaterial = new THREE.MeshPhongMaterial({ color: 0x34495e });
      const pipe = new THREE.Mesh(pipeGeometry, pipeMaterial);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(12.5, 0, 0);
      group.add(pipe);

      pipelineData.points.forEach((point, index) => {
        const monitorGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const color = point.leakDetected ? 0xff0000 : point.status === 'danger' ? 0xff6600 : 0x00ff88;
        const monitorMaterial = new THREE.MeshPhongMaterial({ 
          color, 
          emissive: color, 
          emissiveIntensity: point.leakDetected ? 0.8 : 0.3 
        });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(index, 0.5, 0);
        monitor.name = `monitor-${index}`;
        group.add(monitor);

        if (point.leakDetected) {
          const ringGeometry = new THREE.RingGeometry(0.8, 1.2, 32);
          const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
          const ring = new THREE.Mesh(ringGeometry, ringMaterial);
          ring.position.set(index, 0.5, 0);
          ring.name = `leakRing-${index}`;
          group.add(ring);
        }
      });

      const valveGeometry = new THREE.BoxGeometry(1, 1, 1);
      const upstreamValveMaterial = new THREE.MeshPhongMaterial({ 
        color: pipelineData.valveUpstream === 'closed' ? 0xff0000 : 0x00ff00,
        emissive: pipelineData.valveUpstream === 'closed' ? 0xff0000 : 0x00ff00,
        emissiveIntensity: 0.5
      });
      const upstreamValve = new THREE.Mesh(valveGeometry, upstreamValveMaterial);
      upstreamValve.position.set(-1, 0, 0);
      upstreamValve.name = 'upstreamValve';
      group.add(upstreamValve);

      const downstreamValveMaterial = new THREE.MeshPhongMaterial({ 
        color: pipelineData.valveDownstream === 'closed' ? 0xff0000 : 0x00ff00,
        emissive: pipelineData.valveDownstream === 'closed' ? 0xff0000 : 0x00ff00,
        emissiveIntensity: 0.5
      });
      const downstreamValve = new THREE.Mesh(valveGeometry, downstreamValveMaterial);
      downstreamValve.position.set(26, 0, 0);
      downstreamValve.name = 'downstreamValve';
      group.add(downstreamValve);
    }

    return group;
  };

  const createEmergencyCenter = () => {
    const group = new THREE.Group();
    group.name = 'emergencyCenter';
    group.position.set(-20, 0, 15);

    const buildingGeometry = new THREE.BoxGeometry(8, 4, 6);
    const buildingMaterial = new THREE.MeshPhongMaterial({ color: 0x8e44ad });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = 2;
    group.add(building);

    const screenGeometry = new THREE.BoxGeometry(5, 2.5, 0.2);
    const screenMaterial = new THREE.MeshPhongMaterial({ color: 0x00d4ff, emissive: 0x00d4ff, emissiveIntensity: 0.5 });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(0, 2.5, 3.1);
    group.add(screen);

    const antennaGeometry = new THREE.ConeGeometry(0.5, 2, 8);
    const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x2c3e50 });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0, 5, 0);
    group.add(antenna);

    if (isDrillActive) {
      const alarmGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const alarmMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 });
      const alarm = new THREE.Mesh(alarmGeometry, alarmMaterial);
      alarm.position.set(3, 4.5, 0);
      alarm.name = 'emergencyAlarm';
      group.add(alarm);
    }

    return group;
  };

  const createSupplyShip = () => {
    const group = new THREE.Group();
    group.name = 'supplyShip';
    group.position.set(-25, 0, -15);

    const hullGeometry = new THREE.BoxGeometry(8, 1.5, 3);
    const hullMaterial = new THREE.MeshPhongMaterial({ color: 0xe67e22 });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.y = 0.75;
    group.add(hull);

    const bridgeGeometry = new THREE.BoxGeometry(3, 2, 2.5);
    const bridgeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridge.position.set(-2, 2.5, 0);
    group.add(bridge);

    const craneGeometry = new THREE.BoxGeometry(0.5, 4, 0.5);
    const craneMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
    const crane = new THREE.Mesh(craneGeometry, craneMaterial);
    crane.position.set(2, 3, 0);
    group.add(crane);

    return group;
  };

  const createFireboat = (startPos: [number, number, number], endPos: [number, number, number], index: number) => {
    const group = new THREE.Group();
    group.name = `fireboat-${index}`;
    group.position.set(startPos[0], startPos[1], startPos[2]);

    const hullGeometry = new THREE.BoxGeometry(6, 1.2, 2.5);
    const hullMaterial = new THREE.MeshPhongMaterial({ color: 0xe74c3c });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.y = 0.6;
    group.add(hull);

    const cabinGeometry = new THREE.BoxGeometry(2.5, 1.8, 2);
    const cabinMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
    cabin.position.set(-1.5, 2, 0);
    group.add(cabin);

    const cannonGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const cannonMaterial = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
    const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);
    cannon.rotation.z = -Math.PI / 4;
    cannon.position.set(1.5, 2, 0);
    group.add(cannon);

    const waterGeometry = new THREE.CylinderGeometry(0.15, 0.15, 3, 8);
    const waterMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db, transparent: true, opacity: 0.7 });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.z = -Math.PI / 4;
    water.position.set(2.5, 3, 0);
    water.name = 'waterSpray';
    group.add(water);

    const light = new THREE.PointLight(0x0066ff, 1, 10);
    light.position.set(0, 3, 0);
    group.add(light);

    const arrowGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x0066ff, transparent: true, opacity: 0.8 });
    const direction = new THREE.Vector3(endPos[0] - startPos[0], endPos[1] - startPos[1], endPos[2] - startPos[2]).normalize();
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.copy(group.position).add(direction.clone().multiplyScalar(3));
    arrow.lookAt(new THREE.Vector3(endPos[0], endPos[1], endPos[2]));
    arrow.rotateX(Math.PI / 2);
    arrow.name = 'fireboatArrow';
    group.add(arrow);

    return group;
  };

  const createEvacuationArrow = (start: [number, number, number], end: [number, number, number], index: number) => {
    const group = new THREE.Group();
    group.name = `evacArrow-${index}`;

    const direction = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]);
    const length = direction.length();
    direction.normalize();

    const lineGeometry = new THREE.CylinderGeometry(0.2, 0.2, length, 8);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.8 });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.position.set(
      (start[0] + end[0]) / 2,
      (start[1] + end[1]) / 2 + 2,
      (start[2] + end[2]) / 2
    );
    line.lookAt(new THREE.Vector3(end[0], end[1] + 2, end[2]));
    line.rotateX(Math.PI / 2);
    group.add(line);

    const arrowGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    const arrowMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.9 });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(end[0], end[1] + 2, end[2]);
    arrow.lookAt(new THREE.Vector3(end[0], end[1] + 2, end[2]));
    arrow.rotateX(-Math.PI / 2);
    group.add(arrow);

    return group;
  };

  const createOcean = () => {
    const oceanGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const oceanMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a5f7a,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.5;
    ocean.name = 'ocean';
    return ocean;
  };

  const createSky = () => {
    const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
    const skyMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a1628,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    return sky;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1628);
    scene.fog = new THREE.Fog(0x0a1628, 50, 150);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(40, 30, 40);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 0.5, 50);
    pointLight1.position.set(0, 20, 0);
    scene.add(pointLight1);

    scene.add(createSky());
    scene.add(createOcean());

    const rigPositions = [
      new THREE.Vector3(-8, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(8, 0, 0),
      new THREE.Vector3(0, 0, -8),
    ];

    drillingModules.forEach((module, index) => {
      const rig = createDrillingRig(module.id, rigPositions[index], index);
      scene.add(rig);
      objectsRef.current[module.id] = rig;
    });

    const livingQuarters = createLivingQuarters();
    scene.add(livingQuarters);
    objectsRef.current['livingQuarters'] = livingQuarters;

    const processingModule = createProcessingModule();
    scene.add(processingModule);
    objectsRef.current['processingModule'] = processingModule;

    const flareStack = createFlareStack();
    scene.add(flareStack);
    objectsRef.current['flareStack'] = flareStack;

    const subseaPipeline = createSubseaPipeline();
    scene.add(subseaPipeline);
    objectsRef.current['subseaPipeline'] = subseaPipeline;

    const emergencyCenter = createEmergencyCenter();
    scene.add(emergencyCenter);
    objectsRef.current['emergencyCenter'] = emergencyCenter;

    const supplyShip = createSupplyShip();
    scene.add(supplyShip);
    objectsRef.current['supplyShip'] = supplyShip;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const intersect of intersects) {
        if (intersect.object.name === 'clickArea') {
          const rigGroup = intersect.object.parent as THREE.Group;
          if (rigGroup?.name?.startsWith('drill-')) {
            selectModule(selectedModuleId === rigGroup.name ? null : rigGroup.name);
            break;
          }
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      const ocean = scene.getObjectByName('ocean') as THREE.Mesh;
      if (ocean && ocean.geometry instanceof THREE.PlaneGeometry) {
        const positions = ocean.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = Math.sin(x * 0.1 + time) * 0.2 + Math.cos(y * 0.1 + time) * 0.2;
          positions.setZ(i, z);
        }
        positions.needsUpdate = true;
        ocean.geometry.computeVertexNormals();
      }

      const flareFire = scene.getObjectByName('flareFire') as THREE.Mesh;
      if (flareFire) {
        flareFire.scale.setScalar(1 + Math.sin(time * 5) * 0.1);
        const light = flareFire.parent?.children.find(c => c instanceof THREE.PointLight) as THREE.PointLight;
        if (light) {
          light.intensity = 1.5 + Math.sin(time * 5) * 0.5;
        }
      }

      Object.values(objectsRef.current).forEach(group => {
        if (group.name.startsWith('drill-')) {
          const drillPipe = group.getObjectByName('drillPipe');
          const topDrive = group.getObjectByName('topDrive');
          if (drillPipe) {
            drillPipe.rotation.y += 0.05;
          }
          if (topDrive) {
            (topDrive as THREE.Mesh).position.y = 8.5 + Math.sin(time * 2) * 0.2;
          }
        }
      });

      Object.values(objectsRef.current).forEach(group => {
        if (group.name.startsWith('fireboat-')) {
          const waterSpray = group.getObjectByName('waterSpray');
          if (waterSpray) {
            waterSpray.scale.y = 1 + Math.sin(time * 8) * 0.3;
          }
          const arrow = group.getObjectByName('fireboatArrow');
          if (arrow) {
            arrow.position.y += Math.sin(time * 3) * 0.2;
          }
        }
      });

      scene.traverse((obj) => {
        if (obj.name.startsWith('evacArrow-')) {
          obj.children.forEach(child => {
            if (child instanceof THREE.Mesh) {
              child.material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
            }
          });
        }
      });

      Object.values(objectsRef.current).forEach(group => {
        if (group.name.startsWith('drill-')) {
          const moduleId = group.name;
          const moduleData = drillingModules.find(m => m.id === moduleId);
          const clickArea = group.getObjectByName('clickArea') as THREE.Mesh;
          const bop = group.getObjectByName('bop') as THREE.Mesh;
          
          if (moduleData && clickArea) {
            if (moduleData.kickWarning) {
              clickArea.material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.3 + Math.sin(time * 5) * 0.2 });
            } else if (selectedModuleId === moduleId) {
              clickArea.material = new THREE.MeshBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.3 });
            } else {
              clickArea.material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
            }
          }

          if (bop && moduleData) {
            const bopMaterial = bop.material as THREE.MeshPhongMaterial;
            if (moduleData.bopStatus === 'closed') {
              bopMaterial.color.setHex(0x00ff00);
              bopMaterial.emissive.setHex(0x00ff00);
            } else if (moduleData.bopStatus === 'closing') {
              bopMaterial.color.setHex(0xffaa00);
              bopMaterial.emissive.setHex(0xffaa00);
            } else {
              bopMaterial.color.setHex(0xff6b6b);
              bopMaterial.emissive.setHex(0x000000);
            }
          }
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    Object.keys(objectsRef.current).forEach(key => {
      if (key.startsWith('drill-') || key === 'subseaPipeline' || key === 'emergencyCenter' || key === 'livingQuarters' || key.startsWith('fireboat-') || key.startsWith('evacArrow-')) {
        const obj = objectsRef.current[key];
        if (obj && obj.parent) {
          scene.remove(obj);
          delete objectsRef.current[key];
        }
      }
    });

    const rigPositions = [
      new THREE.Vector3(-8, 0, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(8, 0, 0),
      new THREE.Vector3(0, 0, -8),
    ];

    drillingModules.forEach((module, index) => {
      const rig = createDrillingRig(module.id, rigPositions[index], index);
      scene.add(rig);
      objectsRef.current[module.id] = rig;
    });

    const subseaPipeline = createSubseaPipeline();
    scene.add(subseaPipeline);
    objectsRef.current['subseaPipeline'] = subseaPipeline;

    const emergencyCenter = createEmergencyCenter();
    scene.add(emergencyCenter);
    objectsRef.current['emergencyCenter'] = emergencyCenter;

    const livingQuarters = createLivingQuarters();
    scene.add(livingQuarters);
    objectsRef.current['livingQuarters'] = livingQuarters;

    if (isDrillActive) {
      evacuationPaths.forEach((path, index) => {
        const arrow = createEvacuationArrow(path.start, path.end, index);
        scene.add(arrow);
        objectsRef.current[`evacArrow-${index}`] = arrow;
      });

      fireboatPaths.forEach((path, index) => {
        const boat = createFireboat(path.start, path.end, index);
        scene.add(boat);
        objectsRef.current[`fireboat-${index}`] = boat;
      });
    }
  }, [drillingModules, pipelines, isDrillActive, evacuationPaths, fireboatPaths, selectedModuleId, unauthorizedAccess]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ cursor: 'grab' }}
    />
  );
};

export default Scene3D;
