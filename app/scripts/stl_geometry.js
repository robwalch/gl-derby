(function(THREE) {
	'use strict';

	var STLGeometry = THREE.STLGeometry = function(stl, xAdjust, yAdjust) {
		THREE.Geometry.call(this);

		var stlParsed;
		if (stl instanceof window.ArrayBuffer) {
			stlParsed = parseBinary(stl);
		} else {
			stlParsed = parseString(stl);
		}

		xAdjust = xAdjust||0;
		yAdjust = yAdjust||0;

		var vertices  = stlParsed[0];
		var faces     = stlParsed[1];

		var i;
		for (i=0; i<vertices.length; i++) {
			var vector = vertices[i];
			vector.x += xAdjust;
			vector.y += yAdjust;
			this.vertices.push( vector );
		}

		for (i=0; i<faces.length; i++) {
			this.faces.push( faces[i] );
		}

		console.log('STLGeometry vertices:', vertices.length, 'faces:', faces.length);
	};

	STLGeometry.prototype = new THREE.Geometry();
	STLGeometry.prototype.constructor = STLGeometry;

	Array.prototype.indexOfVector3 = function(vector, indexstart) {
		for (var i=indexstart||0, len=this.length; i<len; i++) {
			if (this[i].x === vector.x && this[i].y === vector.y && this[i].z === vector.z) {
				return i;
			}
		}
		return -1;
	};

	// FIXME: optimize!
	function parseString(stlData) {
		// build stl's vertex and face arrays

		var vertexes  = [];
		var faces     = [];

		// console.log(stlData);

		// strip out extraneous stuff
		stlData = stlData.replace(/\n/g, ' ');
		stlData = stlData.replace(/solid\s(\w+)?/, '');
		stlData = stlData.replace(/facet normal /g,'');
		stlData = stlData.replace(/outer loop/g,'');
		stlData = stlData.replace(/vertex /g,'');
		stlData = stlData.replace(/endloop/g,'');
		stlData = stlData.replace(/endfacet/g,'');
		stlData = stlData.replace(/endsolid\s(\w+)?/, '');
		stlData = stlData.replace(/\s+/g, ' ');
		stlData = stlData.replace(/^\s+/, '');

		// console.log(stlData);

		var blockStart = 0;
		var points = stlData.split(' ');
		var i;

		for (i=0; i<points.length/12-1; i++) {
			var normal = new THREE.Vector3(
				parseFloat(points[blockStart]),
				parseFloat(points[blockStart+1]),
				parseFloat(points[blockStart+2])
			);
			// console.log(normal);
			var faceVertexes = [];
			var vectorIndex;
			for (var x=0; x<3; x++) {
				var vertex = new THREE.Vector3(
					parseFloat(points[blockStart+x*3+3]),
					parseFloat(points[blockStart+x*3+4]),
					parseFloat(points[blockStart+x*3+5])
				);
				// vectorIndex = vertexes.indexOfVector3(vertex);
				// if (vectorIndex === -1) {
				vectorIndex = vertexes.length;
				vertexes.push(vertex);
				// }
				faceVertexes[x] = vectorIndex;
			}

			var face = new THREE.Face3(
				faceVertexes[0],
				faceVertexes[1],
				faceVertexes[2],
				normal
			);
			faces.push(face);

			blockStart = blockStart + 12;
		}

		return [vertexes, faces];
	}

	function parseBinary(stlData) {
		var vertexes  = [];
		var faces     = [];

		// The stl binary is read into a DataView for processing
	    var dv = new DataView(stlData, 80); // 80 == unused header
	    var isLittleEndian = true;

	    // Read a 32 bit unsigned integer
	    var triangles = dv.getUint32(0, isLittleEndian);

	    var offset = 4;
	    for (var i = 0; i < triangles; i++) {
	        // Get the normal for this triangle by reading 3 32 but floats
	        var normal = new THREE.Vector3(
	            dv.getFloat32(offset, isLittleEndian),
	            dv.getFloat32(offset+4, isLittleEndian),
	            dv.getFloat32(offset+8, isLittleEndian)
	        );
	        offset += 12;

	        // Get all 3 vertices for this triangle, each represented
	        // by 3 32 bit floats.
	        for (var j = 0; j < 3; j++) {
	            vertexes.push(
	                new THREE.Vector3(
	                    dv.getFloat32(offset, isLittleEndian),
	                    dv.getFloat32(offset+4, isLittleEndian),
	                    dv.getFloat32(offset+8, isLittleEndian)
	                )
	            );
	            offset += 12;
	        }

	        // there's also a Uint16 "attribute byte count" that we
	        // don't need, it should always be zero.
	        offset += 2;

	        // Create a new face for from the vertices and the normal             
	        faces.push(new THREE.Face3(i*3, i*3+1, i*3+2, normal));
	    }

	    return [vertexes, faces];
	}

})(window.THREE);

