//顶点着色器
var VSHADER_SOURCE_POINTS = 
    'attribute vec4 a_Position;\n' +
	'void main() {\n' +
    'gl_Position = a_Position;\n' + //设置坐标
    'gl_PointSize = 3.0;\n' +
    '}\n';
    
var VSHADER_SOURCE = 
    'attribute vec4 a_Position;\n' +
	'void main() {\n' +
	'gl_Position = a_Position;\n' + //设置坐标
	'}\n';

//片元着色器程序
var FSHADER_SOURCE = 
	'void main() {\n' + 
	'gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + //设置颜色
	'}\n';

var count = 0;
var points = [];
var id=0;
var N = 100;//点的个数
var pointsLength = N; // 有效点的长度（不包含扩展的）
var leaves = []; //triangle的数组

function triangle(options){//一个三角形的存储结构
    this.id = id++;
    this.index = options.index;
    this.left = options.left;
    this.middle = options.middle;
    this.right = options.right;
}

function initPoint(){
    //初始化点
    points = [];
    leaves = [];
    id = 0;
    count = 0;
    for(var i=0; i<N; i++){
        var pow_1 = Math.floor(Math.random()*2);
        var pow_2 = Math.floor(Math.random()*2);
        var x = Number(mul(Math.pow(-1,pow_1),Math.random()).toFixed(6));
        var y = Number(mul(Math.pow(-1,pow_2),Math.random()).toFixed(6));
        points.push({x:x, y:y});
    }
    console.log(points);
    //获取<canvas>元素
	var canvas = document.getElementById('webgl');

	//获取webgl绘图上下文
	var gl = getWebGLContext(canvas);
	if(!gl) {
		console.log('Fail!');
		return;
	}

	//初始化着色器
	if(!initShaders(gl, VSHADER_SOURCE_POINTS, FSHADER_SOURCE)) {
		console.log('fail shader');
		return;
	}

    //设置顶点位置
	var n = initBuffers_points(gl);
	if(n < 0){
		console.log("fail position");
		return;
    }
	//设置<canvas>的背景色
	gl.clearColor(0.0, 0.0, 0.0, 0.0);

	//清除<canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	//绘制三个点
	gl.drawArrays(gl.POINTS, 0, n);
	
}

function createRectangle(){
    points.push({x:0, y:20});
    points.push({x:-20, y:-20});
    points.push({x:20, y:-20});
}

function Disorder(){
    var arr = [];
    for(var i=0; i<pointsLength; i++){
        arr.push(i);
    }
    for (let i=arr.length-1; i>=0; i--) {
        let rIndex = Math.floor(Math.random()*(i+1));
        let temp = arr[rIndex];
        arr[rIndex] = arr[i];
        arr[i] = temp;
    }
    //console.log(arr);
    return arr;
}

function cuSide(point, point_1, point_2){
    var num_1 = mul(Number((point.x-point_1.x).toFixed(9)),Number((point_2.y-point_1.y).toFixed(9)));
    var num_2 = mul(Number((point.y-point_1.y).toFixed(9)),Number((point_2.x-point_1.x).toFixed(9)));
    return sub(num_1,num_2);
}

function isInTriangle(currentPoint, triangleIndex){
    //var cuPoint = points[currentPoint];
    var tePoint_1 = points[triangleIndex[0]];
    var tePoint_2 = points[triangleIndex[1]];
    var tePoint_3 = points[triangleIndex[2]];
    var num_1 = mul(cuSide(currentPoint,tePoint_1,tePoint_2),cuSide(tePoint_3,tePoint_1,tePoint_2));
    var num_2 = mul(cuSide(currentPoint,tePoint_2,tePoint_3),cuSide(tePoint_1,tePoint_2,tePoint_3));
    var num_3 = mul(cuSide(currentPoint,tePoint_1,tePoint_3),cuSide(tePoint_2,tePoint_1,tePoint_3));
    if(num_1>0 && num_2>0 && num_3>0){
        return 0;
    }else if(num_1 == 0){
        return 10;
    }else if(num_2 == 0){
        return 21;
    }else if(num_3 == 0){
        return 20;
    }else{
        return -1;
    }
}

function findTriangle(currentPoint, root){
    var locationTriangle_1 = [];
    var locationTriangle_2 = [];
    var locationTriangle_3 = [];
    if(root.left==null && root.middle==null && root.right==null){
        var a = [];
        a.push(root);
        return a;
    }
    if(root.left != null && isInTriangle(currentPoint, root.left.index) >= 0){
        locationTriangle_1 = findTriangle(currentPoint, root.left);
    }
    if(root.middle != null && isInTriangle(currentPoint, root.middle.index) >= 0){
        locationTriangle_2 = findTriangle(currentPoint, root.middle);
    }
    if(root.right != null && isInTriangle(currentPoint, root.right.index) >= 0){
        locationTriangle_3 = findTriangle(currentPoint, root.right);
    }
    var locationTriangle = [];
    for(let i=0; i<locationTriangle_1.length; i++){
        locationTriangle.push(locationTriangle_1[i]);
    }
    for(let i=0; i<locationTriangle_2.length; i++){
        locationTriangle.push(locationTriangle_2[i]);
    }
    for(let i=0; i<locationTriangle_3.length; i++){
        locationTriangle.push(locationTriangle_3[i]);
    }
    return locationTriangle;
}

function cuCircle(point_1, point_2, point_3, x, y){
    //求三角形的外接圆
    if(point_1.y != point_2.y){
        var k_1 = -1/((point_1.y-point_2.y)/(point_1.x-point_2.x));
        var b_1 = (point_1.y+point_2.y)/2 - k_1 * ((point_1.x+point_2.x)/2);
    }else{
        var k_1 = -1/((point_1.y-point_3.y)/(point_1.x-point_3.x));
        var b_1 = (point_1.y+point_3.y)/2 - k_1 * ((point_1.x+point_3.x)/2);
    }
    if(point_2.y != point_3.y){
        var k_2 = -1/((point_2.y-point_3.y)/(point_2.x-point_3.x));
        var b_2 = (point_2.y+point_3.y)/2 - k_2 * ((point_2.x+point_3.x)/2);
    }else{
        var k_2 = -1/((point_1.y-point_3.y)/(point_1.x-point_3.x));
        var b_2 = (point_1.y+point_3.y)/2 - k_2 * ((point_1.x+point_3.x)/2);
    }
    var centerCircle_x = (b_2-b_1) / (k_1-k_2);
    var centerCircle_y = k_1 * centerCircle_x + b_1;
    var r = Math.sqrt(Math.pow((point_1.x-centerCircle_x),2) + Math.pow((point_1.y-centerCircle_y),2));
    return((x-centerCircle_x)*(x-centerCircle_x) + (y-centerCircle_y)*(y-centerCircle_y) - r*r);
    //小于0在圆内，大于0在圆外，等于0在圆上
}

function legalizeEdge(newPointIndex, firstPointIndex, secondPointIndex, root){
    //console.log("对新加入的点：",newPointIndex,"进行合法边检测：", firstPointIndex, secondPointIndex);
    var arr = [pointsLength, pointsLength+1, pointsLength+2];
    if(arr.includes(firstPointIndex) && arr.includes(secondPointIndex)){
        //若该边是边界边
        //console.log("因为边界合法……");
        return;
    }
    //将边合法化
    var newPoint, firstPoint, secondPoint, thirdPoint;
    var thirdPointIndex;
    firstPoint = points[firstPointIndex];
    secondPoint = points[secondPointIndex];
    newPoint = points[newPointIndex];
    var fakePoint = {x:div(Number((firstPoint.x+secondPoint.x).toFixed(9)),2), y:div(Number((firstPoint.y+secondPoint.y).toFixed(9)),2)};
    //console.log(firstPoint,secondPoint,"自己创造的线的点进入", fakePoint);
    var triangles = findTriangle(fakePoint, root);
    //console.log(triangles);
    //backRoot(root);
    var one=-1, two=-1;
    for(let j=0; j<triangles.length; j++){
        var index = triangles[j].index;
        if(index.includes(firstPointIndex) && index.includes(secondPointIndex) && index.includes(newPointIndex)){
            one = j;
        }
        if(index.includes(firstPointIndex) && index.includes(secondPointIndex) && !index.includes(newPointIndex)){
            two = j;
            for(var i=0; i<triangles[j].index.length; i++){
                if(triangles[j].index[i] != firstPointIndex && triangles[j].index[i] != secondPointIndex){
                    thirdPointIndex = triangles[j].index[i];
                    thirdPoint = points[thirdPointIndex];
                }
            }
        }
    }
    //console.log("第三个点的下标",thirdPointIndex);
    if(cuCircle(firstPoint, secondPoint, newPoint, thirdPoint.x, thirdPoint.y) <= 0){
        //不是合法边
        //console.log("边不合法……连接点：",newPointIndex, thirdPointIndex);
        option_1 = {index:[newPointIndex, thirdPointIndex, firstPointIndex], left:null, middle:null, right:null};
        option_2 = {index:[newPointIndex, thirdPointIndex, secondPointIndex], left:null, middle:null, right:null};
        var triangle_1 = new triangle(option_1);
        var triangle_2 = new triangle(option_2);
        // console.log(one,two);
        // console.log(triangles[one], triangles[two]);
        triangles[one].left = triangle_1;
        triangles[one].right = triangle_2;
        triangles[two].left = triangle_1;
        triangles[two].right = triangle_2;
        leaves.push(triangle_1);
        leaves.push(triangle_2);
        leaves.remove(triangles[one]);
        leaves.remove(triangles[two]);
        legalizeEdge(newPointIndex, firstPointIndex, thirdPointIndex, root);
        legalizeEdge(newPointIndex, secondPointIndex, thirdPointIndex, root);
    }else{
        //console.log("因为外接圆合法……");
        return;
    }
    
}

function deleteBorder(){
    console.log("进入");
    var finalIndex = [];
    var ins = [pointsLength, pointsLength+1, pointsLength+2];
    for(var i=0; i<leaves.length; i++){
        if(!ins.includes(leaves[i].index[0]) && !ins.includes(leaves[i].index[1]) && !ins.includes(leaves[i].index[2])){
            finalIndex.push(leaves[i].index[0]);
            finalIndex.push(leaves[i].index[1]);
            finalIndex.push(leaves[i].index[2]);
        }
    }
    return finalIndex;
}


function delaunayTriangulation(){
    //构造delaunay三角剖分
    var finalIndex = [];
    if(pointsLength == 3){
        finalIndex = [0,1,2];
    }else{
        createRectangle();
        console.log(points);
        let option1 = {index:[pointsLength,pointsLength+1,pointsLength+2],left:null,middle:null,right:null};
        let root = new triangle(option1);
        leaves.push(root);
        //将[0,pointsLength)乱序
        var arr = Disorder();
        console.log(arr);
        for(let i=0; i<pointsLength; i++){
            let currentPointIndex = arr[i];//加入第currentPoint个点
            var currentPoint = points[currentPointIndex];
            console.log(count++,"当前点进入：",currentPointIndex);
            var locationTriangle = findTriangle(currentPoint, root);
            //console.log(locationTriangle);
            //backRoot(root);
            if(locationTriangle.length == 1){
            //在三角形内
                //console.log("在内部……");
                let NT_1 = new triangle({index:[currentPointIndex, locationTriangle[0].index[0],locationTriangle[0].index[1]],left:null,middle:null,right:null});
                let NT_2 = new triangle({index:[currentPointIndex, locationTriangle[0].index[1],locationTriangle[0].index[2]],left:null,middle:null,right:null});
                let NT_3 = new triangle({index:[currentPointIndex, locationTriangle[0].index[2],locationTriangle[0].index[0]],left:null,middle:null,right:null});
                locationTriangle[0].left = NT_1;
                locationTriangle[0].middle = NT_2;
                locationTriangle[0].right = NT_3;
                leaves.push(NT_1);
                leaves.push(NT_2);
                leaves.push(NT_3);
                leaves.remove(locationTriangle[0]);
                legalizeEdge(currentPointIndex, locationTriangle[0].index[0], locationTriangle[0].index[1], root);
                legalizeEdge(currentPointIndex, locationTriangle[0].index[1], locationTriangle[0].index[2], root);
                legalizeEdge(currentPointIndex, locationTriangle[0].index[2], locationTriangle[0].index[0], root);
            }else if(locationTriangle.length ==2){
                //在交线上
                //console.log("在交线上……");
                //console.log(root);
                var indexLine = isInTriangle(currentPoint, locationTriangle[0].index);
                var pointIndex_1 = locationTriangle[0].index[parseInt(indexLine/10)];
                var pointIndex_2 = locationTriangle[0].index[indexLine - parseInt(indexLine/10)*10];
                var pointIndex_3;//locationTriangle[0]的第三个顶点
                var pointIndex_4;//locationTriangle[1]的第三个顶点
                for(var j=0; j<3; j++){
                    if(locationTriangle[0].index[j]!=pointIndex_1 && locationTriangle[0].index[j]!=pointIndex_2){
                        pointIndex_3 = locationTriangle[0].index[j];
                    }
                    if(locationTriangle[1].index[j]!=pointIndex_1 && locationTriangle[1].index[j]!=pointIndex_2){
                        pointIndex_4 = locationTriangle[1].index[j];
                    }
                }
                //console.log("交线的两个点是前两个，后两个是对角了",pointIndex_1,pointIndex_2,pointIndex_3,pointIndex_4);
                let NT_1 = new triangle({index:[currentPointIndex, pointIndex_1, pointIndex_3], left:null,middle:null,right:null});
                let NT_2 = new triangle({index:[currentPointIndex, pointIndex_2, pointIndex_3],left:null,middle:null,right:null});
                let NT_3 = new triangle({index:[currentPointIndex, pointIndex_1, pointIndex_4],left:null,middle:null,right:null});
                let NT_4 = new triangle({index:[currentPointIndex, pointIndex_2, pointIndex_4],left:null,middle:null,right:null});
                locationTriangle[0].left = NT_1;
                locationTriangle[0].right = NT_2;
                locationTriangle[1].left = NT_3;
                locationTriangle[1].right = NT_4;
                leaves.push(NT_1);
                leaves.push(NT_2);
                leaves.push(NT_3);
                leaves.push(NT_4);
                leaves.remove(locationTriangle[0]);
                leaves.remove(locationTriangle[1]);
                legalizeEdge(currentPointIndex, pointIndex_1, pointIndex_3, root);
                legalizeEdge(currentPointIndex, pointIndex_2, pointIndex_3, root);
                legalizeEdge(currentPointIndex, pointIndex_1, pointIndex_4, root);
                legalizeEdge(currentPointIndex, pointIndex_2, pointIndex_4, root);
            }
        }//for
        var finalIndex = deleteBorder();
    }
    console.log("最终的点的index值",finalIndex);
    console.log("产生的所有三角形数量:",id);

   //获取<canvas>元素
	var canvas = document.getElementById('webgl');

	//获取webgl绘图上下文
	var gl = getWebGLContext(canvas);
	if(!gl) {
		console.log('Fail!');
		return;
	}

	//初始化着色器
	if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('fail shader');
		return;
	}

    //设置顶点位置
	var n = initBuffers(gl, finalIndex);
	if(n < 0){
		console.log("fail position");
		return;
    }
    
	//设置<canvas>的背景色
	gl.clearColor(0.0, 0.0, 0.0, 0.0);

	//清除<canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	//绘制三个点
	gl.drawArrays(gl.LINES, 0, n);
}

function initBuffers(gl, finalIndex){
    var verticesMid = [];
    for(var i=0; i<finalIndex.length; i+=3){
        verticesMid.push(points[finalIndex[i]].x);
        verticesMid.push(points[finalIndex[i]].y);
        verticesMid.push(points[finalIndex[i+1]].x);
        verticesMid.push(points[finalIndex[i+1]].y);
        verticesMid.push(points[finalIndex[i+1]].x);
        verticesMid.push(points[finalIndex[i+1]].y);
        verticesMid.push(points[finalIndex[i+2]].x);
        verticesMid.push(points[finalIndex[i+2]].y);
        verticesMid.push(points[finalIndex[i+2]].x);
        verticesMid.push(points[finalIndex[i+2]].y);
        verticesMid.push(points[finalIndex[i]].x);
        verticesMid.push(points[finalIndex[i]].y);
    }
    var vertices = new Float32Array(verticesMid);
    var n = vertices.length / 2;


    // 创建缓冲区对象
	var vertexBuffer = gl.createBuffer();
	if(!vertexBuffer){
		console.log('Fail!');
		return -1;
	}

	//将缓冲区对象绑定到目标
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	//向缓冲区对象中写入数据
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0){
		console.log('fail huoqu weizhi');
		return;
	}

	// 将缓冲区对象分配给a_Position变量
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	//连接a_Position变量与分配给它的缓冲区对象
	gl.enableVertexAttribArray(a_Position);

	return n;
}

function initBuffers_points(gl){
    var verticesMid = [];
    for(var i=0; i<N; i++){
        verticesMid.push(points[i].x);
        verticesMid.push(points[i].y);
    }
    var vertices = new Float32Array(verticesMid);
    var n = N;

    // 创建缓冲区对象
	var vertexBuffer = gl.createBuffer();
	if(!vertexBuffer){
		console.log('Fail!');
		return -1;
	}

	//将缓冲区对象绑定到目标
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

	//向缓冲区对象中写入数据
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if(a_Position < 0){
		console.log('fail huoqu weizhi');
		return;
	}

	// 将缓冲区对象分配给a_Position变量
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	//连接a_Position变量与分配给它的缓冲区对象
	gl.enableVertexAttribArray(a_Position);

	return n;
}

// 加法
function add(arg1, arg2) {
    var r1, r2, m, c;
    try {
      r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
      r2 = 0;
    }
    c = Math.abs(r1 - r2);
    m = Math.pow(10, Math.max(r1, r2));
    if (c > 0) {
      var cm = Math.pow(10, c);
      if (r1 > r2) {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", "")) * cm;
      } else {
        arg1 = Number(arg1.toString().replace(".", "")) * cm;
        arg2 = Number(arg2.toString().replace(".", ""));
      }
    } else {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m;
  };
   
// 减法
  function sub(arg1, arg2) {
    var r1, r2, m, n;
    try {
      r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return Number(((arg1 * m - arg2 * m) / m).toFixed(n));
  };
   
//乘法
  function mul(arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length;
    }
    catch (e) {
    }
    try {
      m += s2.split(".")[1].length;
    }
    catch (e) {
    }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
  };
   
//除法
  function div(arg1, arg2) {
    var t1 = 0, t2 = 0;
    var r1, r2;
    try {
      t1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
    }
    try {
      t2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
    }
    with (Math) {
      r1 = Number(arg1.toString().replace(".", ""));
      r2 = Number(arg2.toString().replace(".", ""));
      return (r1 / r2) * pow(10, t2 - t1);
    }
  };

  Array.prototype.indexOf = function(triangle) { 
    for (var i = 0; i < this.length; i++) { 
        if (this[i].id == triangle.id) return i; 
    } 
    return -1; 
};

Array.prototype.remove = function(triangle) { 
    var index = this.indexOf(triangle); 
    if (index > -1) { 
        this.splice(index, 1); 
    } 
};
