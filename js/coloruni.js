(function() {

    //VAR

    var cubes, scene, camera, geometry, group, orbitControls, ray, stats, clock, webGLRenderer;
    var INTERSECTED, PICKED;
    var NCOLORS = 256;

    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    var params = {
        color: NCOLORS,
        ncube: 10,
        step: 25,
        mode: 1
    };

    var color = {
        actual: [0, 0, 0],
        picked: [0, 0, 0]
    };

    var colors = {
        rmin: 0,
        rmax: NCOLORS - 1,
        rncube: params.ncube,
        rstep: params.step,
        gmin: 0,
        gmax: NCOLORS - 1,
        gncube: params.ncube,
        gstep: params.step,
        bmin: 0,
        bmax: NCOLORS - 1,
        bncube: params.ncube,
        bstep: params.step
    };

    function setupGUI() {

        var gui = new dat.GUI({});

        gui.add(params, 'mode', [1, 2]).onChange(function(e) {

        });

        gui.add(params, 'ncube').min(5).max(50).step(1).listen().onChange(function(e) {

            colors.rncube = params.ncube;
            colors.gncube = params.ncube;
            colors.bncube = params.ncube;

            params.step = Math.floor(NCOLORS / params.ncube);

            adjustCubeColor();

        });

        gui.add(params, 'step').min(5).max(50).step(5).listen().onChange(function(e) {

            colors.rstep = params.step;
            colors.gstep = params.step;
            colors.bstep = params.step;

            params.ncube = Math.floor(NCOLORS / params.step);

            adjustStepColor();

        });

        var red = gui.addFolder('Red');

        red.add(colors, 'rmin').min(0).max(255).step(1).onChange(function(e) {
            adjustCubeColor();
        });
        red.add(colors, 'rmax').min(0).max(255).step(1).onChange(function(e) {
            adjustCubeColor();
        });
        red.add(colors, 'rncube').min(5).max(50).step(1).listen().onChange(function(e) {
            adjustCubeColor();
        });
        red.add(colors, 'rstep').min(1).max(127).step(1).listen().onChange(function(e) {
            adjustStepColor();
        });

        red.open();

        var green = gui.addFolder('Green');

        green.add(colors, 'gmin').min(0).max(255).step(1).onChange(function(e) {
            adjustCubeColor();
        });
        green.add(colors, 'gmax').min(0).max(255).step(1).onChange(function(e) {
            adjustCubeColor();
        });
        green.add(colors, 'gncube').min(5).max(50).step(1).listen().onChange(function(e) {
            adjustCubeColor();
        });
        green.add(colors, 'gstep').min(1).max(127).step(1).listen().onChange(function(e) {
            adjustStepColor();
        });

        green.open();

        var blue = gui.addFolder('Blue');

        blue.add(colors, 'bmin').min(0).max(255).step(1).onChange(function(e) {
            adjustCubeColor();
        });
        blue.add(colors, 'bmax').min(0).max(255).step(1).onChange(function(e) {
            adjustCubeColor();
        });
        blue.add(colors, 'bncube').min(5).max(50).step(1).listen().onChange(function(e) {
            adjustCubeColor();
        });
        blue.add(colors, 'bstep').min(1).max(127).step(1).listen().onChange(function(e) {
            adjustStepColor();
        });

        blue.open();

        gui.addColor(color, 'actual').listen().onChange(function(e) {});
        gui.addColor(color, 'picked').listen().onChange(function(e) {});

    }

    function emptycube() {
        scene.remove(group);
    }

    function reCenter() {

        cubes = new Array(colors.rncube);
        var center = new THREE.Vector3(colors.rncube - 1, colors.gncube - 1, colors.bncube - 1);
        camera.lookAt(center);
        orbitControls.center = center;

    }

    function adjustCubeColor() {

        emptycube();
        reCenter();

        colors.rstep = Math.floor((colors.rmax - colors.rmin) / colors.rncube);
        colors.gstep = Math.floor((colors.gmax - colors.gmin) / colors.gncube);
        colors.bstep = Math.floor((colors.bmax - colors.bmin) / colors.bncube);

        createMesh();

    }

    function adjustStepColor() {

        emptycube();
        reCenter();

        colors.rncube = Math.floor((colors.rmax - colors.rmin) / colors.rstep);
        colors.gncube = Math.floor((colors.gmax - colors.gmin) / colors.gstep);
        colors.bncube = Math.floor((colors.bmax - colors.bmin) / colors.bstep);

        createMesh();

    }

    function createMesh() {

        group = new THREE.Group();

        for (var i = 0; i < colors.rncube; i++) {
            cubes[i] = new Array(colors.gncube);
            for (var j = 0; j < colors.gncube; j++) {
                cubes[i][j] = new Array(colors.bncube);
                for (var k = 0; k < colors.bncube; k++) {

                    material = new THREE.MeshBasicMaterial({
                        color: "rgb(" + (i * colors.rstep + colors.rmin) + "," + (j * colors.gstep + colors.gmin) + "," + (k * colors.bstep + colors.bmin) + ")",
                        wireframe: false
                    });
                    cubes[i][j][k] = new THREE.Mesh(geometry, material);

                    if (params.mode == 1) {
                        cubes[i][j][k].position.set((i * 2), (j * 2), (k * 2));
                    } else {
                        var newpos = CIEcoord((i * colors.rstep + colors.rmin), (j * colors.gstep + colors.gmin), (k * colors.bstep + colors.bmin));
                        cubes[i][j][k].position.set(newpos.x, newpos.y, newpos.z);
                    }


                    group.add(cubes[i][j][k]);

                }
            }
        }

        scene.add(group);

    }

    function CIEcoord(R, G, B) {

        var result = {
            x: 0,
            y: 0,
            z: 0
        };
        result.x = R * 0.49 + G * 0.31 + B * 0.20;
        result.y = R * 0.17697 + G * 0.81240 + B * 0.02063;
        result.z = R * 0 + G * 0.01 + B * 0.99;

        //var c=0.17697;
        var c = 5;

        result.x /= c;
        result.y /= c;
        result.z /= c;

        return result;
    }

    function onMouseMove(event) {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function onMouseClick(event) {
        event.preventDefault();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(group.children);

        if (intersects.length > 0) {

            if (PICKED != intersects[0].object) {
                if (PICKED && PICKED.helper) {
                    scene.remove(PICKED.helper);
                }
                    PICKED = intersects[0].object;
                    scene.remove(PICKED.helper);
                    PICKED.helper = new THREE.BoxHelper(PICKED);
                    PICKED.helper.material.color.set(0xffffff);
                    scene.add(PICKED.helper);


            } else {

            }

            var c = intersects[0].object.material.color;
            color.picked = [c.r * 255, c.g * 255, c.b * 255];
        }

    }

    function render() {
        stats.update();

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);

        // calculate objects intersecting the picking ray
        var intersects = raycaster.intersectObjects(group.children);

        if (intersects.length > 0) {

            if (INTERSECTED != intersects[0].object) {

                if (INTERSECTED && INTERSECTED.helper) {
                    if (INTERSECTED != PICKED) {
                        scene.remove(INTERSECTED.helper);
                    } else {
                        scene.remove(INTERSECTED.helper);
                        INTERSECTED.helper = new THREE.BoxHelper(INTERSECTED);
                        INTERSECTED.helper.material.color.set(0xffffff);
                        scene.add(INTERSECTED.helper);
                    }
                }
                INTERSECTED = intersects[0].object;
                INTERSECTED.helper = new THREE.BoxHelper(INTERSECTED);
                INTERSECTED.helper.material.color.set(0x000000);
                scene.add(INTERSECTED.helper);


            } else {

            }

            var c = intersects[0].object.material.color;
            color.actual = [c.r * 255, c.g * 255, c.b * 255];
        }
        //sphere.rotation.y=step+=0.01;
        var delta = clock.getDelta();
        orbitControls.update(delta);

        // render using requestAnimationFrame
        requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);
    }

    function initStats() {

        stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.getElementById("Stats-output").appendChild(stats.domElement);

        //return stats;
    }

    // once everything is loaded, we run our Three.js stuff.
    function init() {

        //init

        cubes = new Array(colors.rncube);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        geometry = new THREE.BoxGeometry(1, 1, 1);

        initStats();

        // create a render and set the size
        webGLRenderer = new THREE.WebGLRenderer({
            antialias: true
        });
        webGLRenderer.setClearColor(new THREE.Color("#ffffff"));
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        webGLRenderer.shadowMap.enabled = false;

        camera.position.x = 0;
        camera.position.y = 150;
        camera.position.z = 0;

        orbitControls = new THREE.OrbitControls(camera, webGLRenderer.domElement);
        orbitControls.autoRotate = false;

        clock = new THREE.Clock();

        var ambiLight = new THREE.AmbientLight(0x111111);
        scene.add(ambiLight);
        var spotLight = new THREE.DirectionalLight(0xffffff);
        spotLight.position.set(-20, 30, 40);
        spotLight.intensity = 1.5;
        scene.add(spotLight);

        document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);

        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('click', onMouseClick, false);

        createMesh();
        reCenter();

    }

    setupGUI();
    init();
    render();

})();
