function _3dgraph(){

    function count_nodes(){
        var nodes = [];
        for (var i in bonds){
            nodes.push(bonds[i][0])
            nodes.push(bonds[i][1])
        }
        return Math.max.apply(null, nodes) + 1;
    }

    var Q = 1000000, K = 0.1, F = 1, L = 100;
    var camera, scene, renderer;
    var material, damesh;
    var meshes = [];
    var NODES = count_nodes();
    var nodes = [];
    var lines = [];
    var t = 0;


    function randomNode(){
        return new THREE.Vector3(-1000 + Math.random() * 2000, -500 + Math.random() * 1000, -500 + Math.random() * 1000)
    }

    function init() {

        var rh = document.getElementById('renderHere');
        var w = rh.scrollWidth;
        var h = rh.scrollHeight;

        camera = new THREE.PerspectiveCamera( 75, w/h, 1, 10000 );
        console.log('created camera')
        camera.position.z = 1000;

        scene = new THREE.Scene();

        var node_material = new THREE.MeshNormalMaterial( { color: 0xff0000, wireframe: false } );
        var line_material = new THREE.LineBasicMaterial({color: 0x0000ff});
        damesh = new THREE.Mesh(new THREE.Geometry());
        scene.add( damesh );
        for(var i=0; i<NODES; i++){
            var geometry = new THREE.SphereGeometry()
            node = randomNode();
            nodes.push(node);
            var mesh = new THREE.Mesh( geometry, node_material );
            mesh.position = node;
            damesh.add( mesh );
            meshes.push(mesh)
        }
        for(var i=0; i < bonds.length; i++){
            var bond = bonds[i];
            n1 = nodes[bond[0]];
            n2 = nodes[bond[1]];
            var geometry = new THREE.Geometry();
            geometry.vertices.push(n1);
            geometry.vertices.push(n2);
            var line = new THREE.Line(geometry, line_material);
            lines.push(line);
            damesh.add(line);
        }

        renderer = new THREE.CanvasRenderer();
        renderer.setSize( w,h );

        if(rh.glcanvas){
            rh.removeChild(rh.glcanvas);
        }
        rh.appendChild( renderer.domElement );
        rh.glcanvas = renderer.domElement;

        return {camera: camera}
    }

    function calculateRepulsion(forces){
        for(var i=0; i<NODES; i++){
            for(var j=i+1; j<NODES; j++){
                var n1 = nodes[i];
                var n2 = nodes[j];
                var v = {
                    x: n2.x - n1.x,
                    y: n2.y - n1.y,
                    z: n2.z - n1.z
                }
                var d2 = v.x*v.x + v.y*v.y + v.z*v.z
                var d = Math.sqrt(d2)
                var repulsion = Q / d2
                var v1 = {
                    x: v.x/d,
                    y: v.y/d,
                    z: v.z/d
                }
                var f2 = {
                    x: v1.x * repulsion,
                    y: v1.y * repulsion,
                    z: v1.z * repulsion
                }
                var f1 = {
                    x: -f2.x,
                    y: -f2.y,
                    z: -f2.z,
                }
                forces[i].x += f1.x;
                forces[i].y += f1.y;
                forces[i].z += f1.z;
                forces[j].x += f2.x;
                forces[j].y += f2.y;
                forces[j].z += f2.z;
            }
        }
    }

    function calculateAttraction(forces){
        for(var i=0; i<bonds.length; i++){
            var bond = bonds[i];
            var I = bond[0];
            var J = bond[1]
            var n1 = nodes[I];
            var n2 = nodes[J];
            var v = {
                x: n2.x - n1.x,
                y: n2.y - n1.y,
                z: n2.z - n1.z
            }
            var d2 = v.x*v.x + v.y*v.y + v.z*v.z
            var d = Math.sqrt(d2)
            var v1 = {
                x: v.x/d,
                y: v.y/d,
                z: v.z/d
            }
            var delta = d - L;
            var attraction = K * delta;
            var f1 = {
                x: v1.x * attraction,
                y: v1.y * attraction,
                z: v1.z * attraction
            }
            var f2 = {
                x : -f1.x,
                y : -f1.y,
                z : -f1.z
            }
            forces[I].x += f1.x;
            forces[I].y += f1.y;
            forces[I].z += f1.z;
            forces[J].x += f2.x;
            forces[J].y += f2.y;
            forces[J].z += f2.z;
        }
    }

    function calculateForces(){
        var forces = []
        for(var i=0; i<NODES; i++){
            forces.push({
                x:0, y:0, z:0
            });
        }
        calculateRepulsion(forces)
        calculateAttraction(forces)
        return forces;
        
    }

    function animate() {

        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( animate );
        for(var i=0; i<NODES; i++){
            meshes[i].rotation.x += 0.01;
            meshes[i].rotation.y += 0.01;
            meshes[i].rotation.z += 0.01;
        }
        damesh.rotation.x += 0.003;
        damesh.rotation.y += 0.003;
        damesh.rotation.z += 0.003;

        
        var forces = calculateForces();
        for(var i=0; i<NODES; i++){
            var node = nodes[i];
            var force = forces[i];
            node.x += F * force.x
            node.y += F * force.y
            node.z += F * force.z
        }
        
        renderer.render( scene, camera );

    }

    var tmp = init();
    animate();

    return tmp;
}

