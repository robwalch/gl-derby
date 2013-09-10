(function(THREE, requestAnimationFrame) {
	'use strict';

	var renderer	= new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	var updateFcts	= [];
	var scene	= new THREE.Scene();
	var camera	= new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000 );
	camera.position.x = 500;
	camera.up.set( 0, 0, 1 );

	//////////////////////////////////////////////////////////////////////////////////
	//		add an object and make it move					//
	//////////////////////////////////////////////////////////////////////////////////	
	// var geometry	= new THREE.CubeGeometry( 1, 1, 1);
	// var material	= new THREE.MeshNormalMaterial();
	// var mesh	= new THREE.Mesh( geometry, material );
	// scene.add( mesh );

	// updateFcts.push(function(delta, now) {
		// mesh.rotation.x += 1 * delta;
		// mesh.rotation.y += 2 * delta;		
	// });
	function loadStl(url, x, y, r) {
		var xhr = new XMLHttpRequest();
		xhr.overrideMimeType('text/plain; charset=x-user-defined');
		xhr.responseType = 'arraybuffer';
		xhr.onreadystatechange = function(e) {
			if (e.target.readyState === 4) {
				var buffer = e.target.response || e.target.mozResponseArrayBuffer || e.target.responseText;
				console.log('loaded', url, buffer);
				stlBufferToScene(buffer, x, y, r);
			}
		};
		xhr.open('GET', url);
		xhr.send();
	}

	var staringY = 240;
	function stlBufferToScene(buffer, x, y, r) {
		var geometry = new THREE.STLGeometry(buffer, x, y);
		var material = new THREE.MeshNormalMaterial();
		// var material = new THREE.MeshLambertMaterial({
	 //        overdraw: true,
	 //        color: 0xaa0000,
	 //        shading: THREE.FlatShading
	 //    });
		var mesh = new THREE.Mesh( geometry, material );
		// mesh.position.x = Math.random() * 400 - 200;
		mesh.position.y = staringY;
		mesh.rotation.z += r || 0;
		staringY -= 120;
		scene.add( mesh );
		console.log('parsed and added', geometry, mesh);
		updateFcts.push(function(delta) {//, now) {
			mesh.rotation.z += delta * 0.5;
		});
	}

	loadStl('images/3derby_test_car.stl');
	loadStl('images/universal_joint_derby_car.stl');
	loadStl('images/teambelle-3derby_car.stl', 0, 50);
	loadStl('images/pla_derby_spiney_shell_prototype.stl', 0, 0, 180);
	loadStl('images/koopa_troopa.stl', 0, 0, 180);

	//////////////////////////////////////////////////////////////////////////////////
	//		Camera Controls							//
	//////////////////////////////////////////////////////////////////////////////////
	var mouse	= {x : 0, y : 0};
	document.addEventListener('mousemove', function(event) {
		mouse.x	= (event.clientX / window.innerWidth ) - 0.5;
		mouse.y	= (event.clientY / window.innerHeight) - 0.5;
	}, false);
	updateFcts.push(function(delta) {//, now) {
		camera.position.z += (mouse.y*500 - camera.position.z) * (delta*3);
		camera.position.y += (mouse.x*500 - camera.position.y) * (delta*3);
		camera.lookAt( scene.position );
	});

	//////////////////////////////////////////////////////////////////////////////////
	//		render the scene						//
	//////////////////////////////////////////////////////////////////////////////////
	updateFcts.push(function() {
		renderer.render( scene, camera );
	});

	//////////////////////////////////////////////////////////////////////////////////
	//		loop runner							//
	//////////////////////////////////////////////////////////////////////////////////
	var lastTimeMsec = null;
	requestAnimationFrame(function animate(nowMsec) {
		// keep looping
		requestAnimationFrame( animate );
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60;
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec);
		lastTimeMsec	= nowMsec;
		// call each update function
		updateFcts.forEach(function(updateFn) {
			updateFn(deltaMsec/1000, nowMsec/1000);
		});
	});

})(window.THREE, window.requestAnimationFrame);
