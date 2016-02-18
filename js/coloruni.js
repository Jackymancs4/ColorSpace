// once everything is loaded, we run our Three.js stuff.
function init() {

    //VAR

    var cube, geometry, material;

    //GUI

    var gui = new dat.GUI({
        height : 5 * 32 - 1
    });

    var params = {
        color: 256,
        ncube: 10,
        step: 25,
        mode: 1
    };

    var colors = {
        rmin: 0,
        rmax: 360,
        rncube: params.ncube,
        rstep: params.step,
        gmin: 0,
        gmax: 100,
        gncube: params.ncube,
        gstep: params.step,
        bmin: 0,
        bmax: 100,
        bncube: params.ncube,
        bstep: params.step
    }

    //INIT

    gui.add(params, 'ncube').min(5).max(50).step(1).listen().onChange(function (e) {

        colors.rncube=params.ncube;
        colors.gncube=params.ncube;
        colors.bncube=params.ncube;

        params.step=Math.floor(256/params.ncube);

        adjustCubeColor();

    });

    gui.add(params, 'step').min(1).max(127).step(5).listen().onChange(function (e) {

        colors.rstep=params.step;
        colors.gstep=params.step;
        colors.bstep=params.step;

        params.ncube=Math.floor(256/params.step);

        adjustStepColor();

    });

    gui.add(params, 'mode', [1, 2]).onChange(function (e) {

    });

    var red = gui.addFolder('Red');

    red.add(colors, 'rmin').min(0).max(360).step(1).onChange(function (e) {
        adjustCubeColor();
    });
    red.add(colors, 'rmax').min(0).max(360).step(1).onChange(function (e) {
        adjustCubeColor();
    });
    red.add(colors, 'rncube').min(5).max(50).step(1).listen().onChange(function (e) {
        adjustCubeColor();
    });
    red.add(colors, 'rstep').min(1).max(127).step(1).listen().onChange(function (e) {
        adjustStepColor();
    });

    red.open();

    var green = gui.addFolder('Green');

    green.add(colors, 'gmin').min(0).max(100).step(1).onChange(function (e) {
        adjustCubeColor();
    });
    green.add(colors, 'gmax').min(0).max(100).step(1).onChange(function (e) {
        adjustCubeColor();
    });
    green.add(colors, 'gncube').min(5).max(50).step(1).listen().onChange(function (e) {
        adjustCubeColor();
    });
    green.add(colors, 'gstep').min(1).max(127).step(1).listen().onChange(function (e) {
        adjustStepColor();
    });

    green.open();

    var blue = gui.addFolder('Blue');

    blue.add(colors, 'bmin').min(0).max(100).step(1).onChange(function (e) {
        adjustCubeColor();
    });
    blue.add(colors, 'bmax').min(0).max(100).step(1).onChange(function (e) {
        adjustCubeColor();
    });
    blue.add(colors, 'bncube').min(5).max(50).step(1).listen().onChange(function (e) {
        adjustCubeColor();
    });
    blue.add(colors, 'bstep').min(1).max(127).step(1).listen().onChange(function (e) {
        adjustStepColor();
    });

    blue.open();

    var stats = initStats();
    var cubes = new Array(colors.rncube);
    var scene = new THREE.Scene();
    var center = new THREE.Vector3(colors.rncube, colors.gncube, colors.bncube);

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // create a render and set the size
    var webGLRenderer = new THREE.WebGLRenderer();
    webGLRenderer.setClearColor(new THREE.Color(0xffffff, 1.0));
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.shadowMapEnabled = false;

    createMesh();

    camera.position.x = 0;
    camera.position.y = 150;
    camera.position.z = 0;
    camera.lookAt(center);

    var orbitControls = new THREE.OrbitControls(camera, webGLRenderer.domElement);
    orbitControls.autoRotate = false;
    var clock = new THREE.Clock();

    orbitControls.center = center;

    var ambiLight = new THREE.AmbientLight(0x111111);
    scene.add(ambiLight);
    var spotLight = new THREE.DirectionalLight(0xffffff);
    spotLight.position.set(-20, 30, 40);
    spotLight.intensity = 1.5;
    scene.add(spotLight);

    document.getElementById("WebGL-output").appendChild(webGLRenderer.domElement);

    render();

    function emptycube () {

        for(var i = 0; i < cubes.length; i++) {
            for(var j = 0; j < cubes[i].length; j++) {
                for(var k = 0; k < cubes[i][j].length; k++) {
                    scene.remove(cubes[i][j][k]);
                    
                }
            }
        }

    }

    function reCenter() {
       
        cubes = new Array(colors.rncube);
        center = new THREE.Vector3(colors.rncube, colors.gncube, colors.bncube);
        camera.lookAt(center);
        orbitControls.center = center;

    }

    function adjustCubeColor() {
        
        emptycube();
        reCenter();

        colors.rstep=Math.floor((colors.rmax-colors.rmin)/colors.rncube);
        colors.gstep=Math.floor((colors.gmax-colors.gmin)/colors.gncube);
        colors.bstep=Math.floor((colors.bmax-colors.bmin)/colors.bncube);

        createMesh();

    }

    function adjustStepColor() {
        
        emptycube();
        reCenter();

        colors.rncube=Math.floor((colors.rmax-colors.rmin)/colors.rstep);
        colors.gncube=Math.floor((colors.gmax-colors.gmin)/colors.gstep);
        colors.bncube=Math.floor((colors.bmax-colors.bmin)/colors.bstep);

        createMesh();

    }

    function createMesh(geom) {

        geometry = new THREE.BoxGeometry( 1, 1, 1 );

        for(var i = 0; i < colors.rncube; i++) {
            cubes[i] = new Array(colors.gncube);
            for(var j = 0; j < colors.gncube; j++) {
                cubes[i][j] = new Array(colors.bncube);
                for(var k = 0; k < colors.bncube; k++) {



                    material = new THREE.MeshBasicMaterial( {color: new THREE.Color().setHSL((i*colors.rstep+colors.rmin)/360, (j*colors.gstep+colors.gmin)/100, (k*colors.bstep+colors.bmin)/100)} );
                    
                    //console.log((i*colors.rstep+colors.rmin)/360+"-"+(j*colors.gstep+colors.gmin)/100+"-"+(k*colors.bstep+colors.bmin)/100);

                    cubes[i][j][k] = new THREE.Mesh( geometry, material );

                    if(params.mode==1) {
                        cubes[i][j][k].position.set((i*2),(j*2),(k*2));
                    } else {
                        var newpos = CIEcoord((i*colors.rstep+colors.rmin), (j*colors.gstep+colors.gmin), (k*colors.bstep+colors.bmin));
                        cubes[i][j][k].position.set(newpos.x,newpos.y,newpos.z);
                    }


                    scene.add(cubes[i][j][k]);

                }
            }
        }
    }

    function CIEcoord(R, G, B) {

        var result={x: 0, y: 0, z:0};
        result.x=R*0.49+G*0.31+B*0.20;
        result.y=R*0.17697+G*0.81240+B*0.02063;
        result.z=R*0+G*0.01+B*0.99;
        
        //var c=0.17697;
        var c=5;

        result.x/=c;
        result.y/=c;
        result.z/=c;

        return result;
    }

    function render() {
        stats.update();

        //sphere.rotation.y=step+=0.01;
        var delta = clock.getDelta();
        orbitControls.update(delta);

        // render using requestAnimationFrame
        requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);
    }

    function initStats() {

        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        document.getElementById("Stats-output").appendChild(stats.domElement);

        return stats;
    }
}