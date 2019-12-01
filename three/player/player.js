import { GUI } from '../dat.gui.module.js';

import { FirstPersonControls } from '../FirstPersonControls.js';
import * as THREE from "../three.module.js";

var camera, controls, scene, renderer, light;

var material1, material2, material3;

var analyser1, analyser2, analyser3;

var clock = new THREE.Clock();

var fileLoader = new THREE.FileLoader();
fileLoader.load( './scene.json', function ( text ) {

    const loader = new THREE.ObjectLoader();
    scene = loader.parse( JSON.parse(text) );

    init();
} );


function init() {

    // var overlay = document.getElementById( 'overlay' );
    // overlay.remove();

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 2, 0 );

    var listener = new THREE.AudioListener();
    camera.add( listener );

    // scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.0025 );

    light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 0, 0.5, 1 ).normalize();
    scene.add( light );

    var sphere = new THREE.SphereBufferGeometry( 20, 32, 16 );

    material1 = new THREE.MeshPhongMaterial( { color: 0xffaa00, flatShading: true, shininess: 0 } );
    material2 = new THREE.MeshPhongMaterial( { color: 0xff2200, flatShading: true, shininess: 0 } );
    material3 = new THREE.MeshPhongMaterial( { color: 0x6622aa, flatShading: true, shininess: 0 } );

    // sound spheres

    var audioLoader = new THREE.AudioLoader();

    var mesh1 = new THREE.Mesh( sphere, material1 );
    mesh1.position.set( - 250, 30, 0 );
    scene.add( mesh1 );

    var sound1 = new THREE.PositionalAudio( listener );
    audioLoader.load( 'sounds/358232_j_s_song.ogg', function ( buffer ) {

        sound1.setBuffer( buffer );
        sound1.setRefDistance( 20 );
        sound1.play();

    } );
    mesh1.add( sound1 );

    //

    var mesh2 = new THREE.Mesh( sphere, material2 );
    mesh2.position.set( 250, 30, 0 );
    scene.add( mesh2 );

    var sound2 = new THREE.PositionalAudio( listener );
    audioLoader.load( 'sounds/376737_Skullbeatz___Bad_Cat_Maste.ogg', function ( buffer ) {

        sound2.setBuffer( buffer );
        sound2.setRefDistance( 20 );
        sound2.play();

    } );
    mesh2.add( sound2 );

    //

    var mesh3 = new THREE.Mesh( sphere, material3 );
    mesh3.position.set( 0, 30, - 250 );
    scene.add( mesh3 );

    var sound3 = new THREE.PositionalAudio( listener );
    var oscillator = listener.context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime( 144, sound3.context.currentTime );
    oscillator.start( 0 );
    sound3.setNodeSource( oscillator );
    sound3.setRefDistance( 20 );
    sound3.setVolume( 0.5 );
    mesh3.add( sound3 );

    // analysers

    analyser1 = new THREE.AudioAnalyser( sound1, 32 );
    analyser2 = new THREE.AudioAnalyser( sound2, 32 );
    analyser3 = new THREE.AudioAnalyser( sound3, 32 );

    // global ambient audio

    var sound4 = new THREE.Audio( listener );
    audioLoader.load( 'sounds/Project_Utopia.ogg', function ( buffer ) {

        sound4.setBuffer( buffer );
        sound4.setLoop( true );
        sound4.setVolume( 0.5 );
        sound4.play();

    } );

    // ground

    var helper = new THREE.GridHelper( 1000, 10, 0x444444, 0x444444 );
    helper.position.y = 0.1;
    scene.add( helper );

    //

    var SoundControls = function () {

        this.master = listener.getMasterVolume();
        this.firstSphere = sound1.getVolume();
        this.secondSphere = sound2.getVolume();
        this.thirdSphere = sound3.getVolume();
        this.Ambient = sound4.getVolume();

    };

    var GeneratorControls = function () {

        this.frequency = oscillator.frequency.value;
        this.wavetype = oscillator.type;

    };

    var gui = new GUI();
    var soundControls = new SoundControls();
    var generatorControls = new GeneratorControls();
    var volumeFolder = gui.addFolder( 'sound volume' );
    var generatorFolder = gui.addFolder( 'sound generator' );

    volumeFolder.add( soundControls, 'master' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

        listener.setMasterVolume( soundControls.master );

    } );
    volumeFolder.add( soundControls, 'firstSphere' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

        sound1.setVolume( soundControls.firstSphere );

    } );
    volumeFolder.add( soundControls, 'secondSphere' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

        sound2.setVolume( soundControls.secondSphere );

    } );

    volumeFolder.add( soundControls, 'thirdSphere' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

        sound3.setVolume( soundControls.thirdSphere );

    } );
    volumeFolder.add( soundControls, 'Ambient' ).min( 0.0 ).max( 1.0 ).step( 0.01 ).onChange( function () {

        sound4.setVolume( soundControls.Ambient );

    } );
    volumeFolder.open();
    generatorFolder.add( generatorControls, 'frequency' ).min( 50.0 ).max( 5000.0 ).step( 1.0 ).onChange( function () {

        oscillator.frequency.setValueAtTime( generatorControls.frequency, listener.context.currentTime );

    } );
    generatorFolder.add( generatorControls, 'wavetype', [ 'sine', 'square', 'sawtooth', 'triangle' ] ).onChange( function () {

        oscillator.type = generatorControls.wavetype;

    } );

    generatorFolder.open();

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //

    controls = new FirstPersonControls( camera, renderer.domElement );

    controls.movementSpeed = 20;
    controls.lookSpeed = 0.5;
    controls.noFly = true;
    controls.lookVertical = false;

    //

    window.addEventListener( 'resize', onWindowResize, false );

    animate();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    controls.handleResize();

}

function animate() {

    requestAnimationFrame( animate );
    render();

}


function render() {

    var delta = clock.getDelta();

    controls.update( delta );

    material1.emissive.b = analyser1.getAverageFrequency() / 256;
    material2.emissive.b = analyser2.getAverageFrequency() / 256;
    material3.emissive.b = analyser3.getAverageFrequency() / 256;

    renderer.render( scene, camera );

}