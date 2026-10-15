/* Three.js powered, image-free globe for the welcome screen. */
(() => {
  const locations = [
    { name: 'LONDON', lat: 51.5072, lon: -0.1276, color: 0x83b5ff },
    { name: 'ABU DHABI', lat: 24.4539, lon: 54.3773, color: 0x65efd0, focus: true },
    { name: 'MUMBAI', lat: 19.076, lon: 72.8777, color: 0x80f1d4 },
    { name: 'SINGAPORE', lat: 1.3521, lon: 103.8198, color: 0xc6a5ff }
  ];

  const continentShapes = [
    [[-168, 69], [-151, 71], [-138, 68], [-132, 58], [-124, 51], [-128, 45], [-123, 39], [-117, 32], [-108, 28], [-105, 23], [-97, 18], [-91, 15], [-87, 11], [-82, 9], [-77, 18], [-80, 25], [-81, 31], [-75, 36], [-69, 44], [-60, 48], [-58, 54], [-66, 60], [-81, 62], [-91, 69], [-107, 73], [-124, 75], [-143, 72], [-158, 73]],
    [[-53, 59], [-45, 61], [-38, 70], [-43, 80], [-54, 83], [-63, 78], [-61, 68]],
    [[-81, 12], [-72, 10], [-64, 5], [-51, 1], [-42, -5], [-35, -10], [-40, -22], [-49, -29], [-53, -39], [-65, -54], [-72, -51], [-75, -39], [-73, -27], [-78, -13], [-81, -2]],
    [[-11, 36], [-9, 43], [-3, 48], [4, 51], [7, 57], [17, 61], [22, 69], [34, 71], [42, 63], [39, 55], [48, 49], [42, 42], [34, 36], [26, 39], [19, 35], [10, 37], [2, 36]],
    [[30, 41], [40, 48], [47, 56], [59, 63], [76, 70], [96, 74], [117, 71], [137, 67], [157, 62], [177, 57], [169, 49], [153, 45], [142, 40], [135, 34], [126, 31], [122, 24], [113, 21], [109, 14], [100, 10], [91, 12], [82, 7], [77, 19], [69, 24], [60, 25], [55, 33], [46, 37], [39, 35]],
    [[-17, 35], [-5, 37], [8, 36], [18, 32], [30, 31], [35, 22], [43, 12], [50, 11], [45, -3], [40, -15], [33, -25], [29, -34], [19, -35], [13, -27], [11, -16], [7, -7], [2, 5], [-7, 5], [-14, 15], [-17, 24]],
    [[68, 25], [73, 34], [80, 31], [88, 27], [92, 22], [87, 16], [82, 8], [77, 6], [73, 14], [70, 20]],
    [[95, 20], [104, 22], [111, 18], [119, 13], [121, 6], [115, 1], [108, 4], [103, 9], [98, 11]],
    [[113, -11], [123, -10], [133, -12], [143, -16], [153, -27], [150, -38], [139, -43], [128, -39], [116, -31], [113, -21]],
    [[130, 31], [135, 35], [141, 42], [145, 44], [143, 37], [138, 33]],
    [[47, -13], [50, -17], [49, -24], [46, -26], [44, -19]]
  ];

  function createMapTexture(THREE, renderer) {
    const map = document.createElement('canvas');
    map.width = 2048;
    map.height = 1024;
    const context = map.getContext('2d');
    const ocean = context.createLinearGradient(0, 0, 0, map.height);
    ocean.addColorStop(0, '#102941');
    ocean.addColorStop(.48, '#0b3449');
    ocean.addColorStop(1, '#10253c');
    context.fillStyle = ocean;
    context.fillRect(0, 0, map.width, map.height);

    const xForLongitude = (longitude) => ((((90 + longitude) % 360) + 360) % 360) / 360 * map.width;
    context.lineWidth = 1;
    context.strokeStyle = 'rgba(135, 219, 230, .15)';
    for (let latitude = -75; latitude <= 75; latitude += 15) {
      const y = (90 - latitude) / 180 * map.height;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(map.width, y);
      context.stroke();
    }
    for (let longitude = -180; longitude <= 180; longitude += 15) {
      const x = xForLongitude(longitude);
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, map.height);
      context.stroke();
    }

    const landFill = context.createLinearGradient(0, 170, 0, 820);
    landFill.addColorStop(0, '#4bb5a8');
    landFill.addColorStop(.52, '#287f86');
    landFill.addColorStop(1, '#235f78');
    const stipple = document.createElement('canvas');
    stipple.width = 14;
    stipple.height = 14;
    const stippleContext = stipple.getContext('2d');
    stippleContext.fillStyle = 'rgba(190, 255, 230, .24)';
    stippleContext.beginPath();
    stippleContext.arc(3, 3, 1, 0, Math.PI * 2);
    stippleContext.fill();
    const stipplePattern = context.createPattern(stipple, 'repeat');

    continentShapes.forEach((shape) => {
      context.beginPath();
      shape.forEach(([longitude, latitude], index) => {
        const x = xForLongitude(longitude);
        const y = (90 - latitude) / 180 * map.height;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.closePath();
      context.fillStyle = landFill;
      context.fill();
      context.save();
      context.clip();
      context.fillStyle = stipplePattern;
      context.fillRect(0, 0, map.width, map.height);
      context.restore();
      context.strokeStyle = 'rgba(164, 247, 225, .8)';
      context.lineWidth = 2.2;
      context.stroke();
    });

    const texture = new THREE.CanvasTexture(map);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  }

  function createLocationLabel(THREE, text, color) {
    const label = document.createElement('canvas');
    label.width = 384;
    label.height = 88;
    const context = label.getContext('2d');
    const radius = 20;
    context.beginPath();
    context.roundRect(3, 3, 378, 82, radius);
    context.fillStyle = 'rgba(5, 18, 31, .88)';
    context.fill();
    context.strokeStyle = color;
    context.globalAlpha = .62;
    context.lineWidth = 3;
    context.stroke();
    context.globalAlpha = 1;
    context.fillStyle = '#f2fffc';
    context.font = '600 31px IBM Plex Mono, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`${text}  ·  UAE`, 192, 45);

    const texture = new THREE.CanvasTexture(label);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true, depthWrite: false }));
    sprite.scale.set(.49, .113, 1);
    return sprite;
  }

  function locationVector(THREE, location, radius = 1.006) {
    const latitude = location.lat * Math.PI / 180;
    const longitude = location.lon * Math.PI / 180;
    const latitudeRadius = Math.cos(latitude) * radius;
    return new THREE.Vector3(
      latitudeRadius * Math.sin(longitude),
      Math.sin(latitude) * radius,
      latitudeRadius * Math.cos(longitude)
    );
  }

  function makeArc(THREE, start, end) {
    const first = locationVector(THREE, start).normalize();
    const last = locationVector(THREE, end).normalize();
    const positions = [];
    const steps = 72;
    for (let index = 0; index <= steps; index += 1) {
      const progress = index / steps;
      const point = first.clone().slerp(last, progress).multiplyScalar(1 + Math.sin(Math.PI * progress) * .2);
      positions.push(point.x, point.y, point.z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeLineDistances();
    const material = new THREE.LineDashedMaterial({ color: 0x65efd0, dashSize: .028, gapSize: .022, transparent: true, opacity: .84, depthWrite: false });
    const pointAt = (progress) => first.clone().slerp(last, progress).multiplyScalar(1 + Math.sin(Math.PI * progress) * .2);
    return {
      line: new THREE.Line(geometry, material),
      first,
      last,
      pointAt,
      packet: new THREE.Mesh(new THREE.ConeGeometry(.026, .09, 12), new THREE.MeshBasicMaterial({ color: start.color, transparent: true, depthWrite: false }))
    };
  }

  window.createIntroGlobe = (intro, gsap) => {
    const THREE = window.THREE;
    const canvas = intro?.querySelector('.three-globe');
    const container = intro?.querySelector('.intro-globe');
    if (!THREE || !gsap || !canvas || !container || !intro.isConnected) return null;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (_) {
      return null;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, .1, 40);
    camera.position.set(0, 0, 3.05);
    const world = new THREE.Group();
    scene.add(world);
    scene.add(new THREE.AmbientLight(0x8ab4c9, 1.15));

    const keyLight = new THREE.DirectionalLight(0xb4ffe8, 2.35);
    keyLight.position.set(-3, 3, 5);
    scene.add(keyLight);
    const blueLight = new THREE.DirectionalLight(0x729cff, .9);
    blueLight.position.set(4, -1, -3);
    scene.add(blueLight);

    const mapTexture = createMapTexture(THREE, renderer);
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 112, 80),
      new THREE.MeshPhongMaterial({ map: mapTexture, color: 0xd8f3ee, emissive: 0x103441, emissiveIntensity: .38, specular: 0x8bfff0, shininess: 32 })
    );
    world.add(globe);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.055, 72, 56),
      new THREE.ShaderMaterial({
        vertexShader: 'varying vec3 vNormal; varying vec3 vView; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=normalize(-p.xyz); gl_Position=projectionMatrix*p; }',
        fragmentShader: 'varying vec3 vNormal; varying vec3 vView; void main(){ float rim=pow(1.0-max(dot(normalize(vNormal),normalize(vView)),0.0),2.15); gl_FragColor=vec4(0.19,0.82,0.94,rim*0.72); }',
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    );
    world.add(atmosphere);

    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x9fe9ef, transparent: true, opacity: .18, depthWrite: false });
    const makeGridLine = (coordinatePoints) => {
      const points = coordinatePoints.map(([latitude, longitude]) => locationVector(THREE, { lat: latitude, lon: longitude }, 1.008));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      world.add(new THREE.Line(geometry, gridMaterial));
    };
    for (const latitude of [-60, -30, 0, 30, 60]) {
      const ring = [];
      for (let longitude = -180; longitude <= 180; longitude += 4) ring.push([latitude, longitude]);
      makeGridLine(ring);
    }
    for (let longitude = -165; longitude < 180; longitude += 15) {
      const meridian = [];
      for (let latitude = -88; latitude <= 88; latitude += 4) meridian.push([latitude, longitude]);
      makeGridLine(meridian);
    }

    const routeSources = [locations[0], locations[2], locations[3]];
    const routes = routeSources.map((source) => makeArc(THREE, source, locations[1]));
    routes.forEach((route) => world.add(route.line, route.packet));

    let focusRing;
    locations.forEach((location) => {
      const point = locationVector(THREE, location, 1.014);
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(location.focus ? .026 : .019, 18, 14),
        new THREE.MeshBasicMaterial({ color: location.color })
      );
      marker.position.copy(point);
      world.add(marker);
      if (location.focus) {
        const normal = point.clone().normalize();
        focusRing = new THREE.Mesh(
          new THREE.RingGeometry(.037, .043, 52),
          new THREE.MeshBasicMaterial({ color: location.color, transparent: true, opacity: .75, side: THREE.DoubleSide, depthWrite: false })
        );
        focusRing.position.copy(normal.clone().multiplyScalar(1.018));
        focusRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        world.add(focusRing);

        const label = createLocationLabel(THREE, location.name, '#65efd0');
        const labelPosition = point.clone().add(new THREE.Vector3(.03, .12, 0)).normalize().multiplyScalar(1.19);
        label.position.copy(labelPosition);
        world.add(label);
      }
    });

    const starsGeometry = new THREE.BufferGeometry();
    const stars = [];
    for (let index = 0; index < 260; index += 1) {
      const direction = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
      direction.multiplyScalar(3.8 + Math.random() * 3.8);
      stars.push(direction.x, direction.y, direction.z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(stars, 3));
    const starField = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xb5f4f0, size: .018, transparent: true, opacity: .62, depthWrite: false }));
    scene.add(starField);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const resize = () => {
      if (disposed) return;
      const bounds = container.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
    };
    let disposed = false;
    let resizeObserver;
    let routeTimeline;
    const dispose = () => {
      if (disposed) return;
      disposed = true;
      routeTimeline?.kill();
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', resize);
      resizeObserver?.disconnect();
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) object.material.forEach((material) => { material.map?.dispose(); material.dispose(); });
        else if (object.material) { object.material.map?.dispose(); object.material.dispose(); }
      });
      gridMaterial.dispose();
      renderer.dispose();
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
    }
    intro.addEventListener('intro:dispose', dispose, { once: true });

    const focusDirection = locationVector(THREE, locations[1]).normalize();
    const faceFocus = new THREE.Quaternion().setFromUnitVectors(focusDirection, new THREE.Vector3(0, 0, 1));
    let zoomStarted = false;
    const routeStates = routes.map(() => ({ progress: 0 }));
    const updateRouteArrow = (route, routeState) => {
      const progress = routeState.progress;
      route.packet.position.copy(route.pointAt(progress));
      const before = route.pointAt(Math.max(0, progress - .002));
      const after = route.pointAt(Math.min(1, progress + .002));
      const direction = after.sub(before).normalize();
      route.packet.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    };
    const updateRouteArrows = () => routes.forEach((route, index) => updateRouteArrow(route, routeStates[index]));
    updateRouteArrows();
    world.quaternion.copy(faceFocus);
    intro.classList.add('webgl-ready');
    renderer.setAnimationLoop((timestamp) => {
      if (disposed) return;
      const seconds = timestamp * .001;
      updateRouteArrows();
      if (focusRing) {
        const pulse = (seconds % 1.9) / 1.9;
        focusRing.scale.setScalar(.7 + pulse * 1.7);
        focusRing.material.opacity = (1 - pulse) * .72;
      }
      renderer.render(scene, camera);
    });

    const zoomToFocus = (event) => {
      if (disposed || zoomStarted) return;
      zoomStarted = true;
      routeTimeline?.kill();
      if (!event.detail?.focusSettled) {
        routeStates.forEach((state) => { state.progress = 1; });
        updateRouteArrows();
      }
      gsap.to(camera.position, {
        z: 1.38,
        duration: event.detail?.focusSettled ? 1.7 : 1.05,
        ease: 'power2.inOut',
        overwrite: true
      });
    };
    intro.addEventListener('intro:zoom', zoomToFocus, { once: true });

    routeTimeline = gsap.timeline();
    routes.forEach((route, index) => {
      routeTimeline.to(routeStates[index], {
        progress: 1,
        duration: 1.18,
        ease: 'power2.inOut',
        onUpdate: () => updateRouteArrow(route, routeStates[index])
      }, 0);
    });
    routeTimeline.call(() => {
      intro.classList.add('globe-focused');
      intro.dispatchEvent(new Event('intro:focus-ready'));
    });
    return { dispose };
  };
})();
