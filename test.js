function test(){
    var currentPoint = {x:-2.46572697,y:7.89084437};
    var tePoint_1 = {x:-1.43510914,y:8.86677114};
    var tePoint_2 = {x:-3.4963448,y:6.9149176};
    var tePoint_3 = {x:0,y:100};
    var tePoint_4 = {x:-100, y:0};
    console.log(isInTriangle(currentPoint,tePoint_1,tePoint_2,tePoint_4));
    console.log(isInTriangle(currentPoint,tePoint_1,tePoint_4,tePoint_3));

}

function cuSide(point, point_1, point_2){
    var num_1 = mul(Number((point.x-point_1.x).toFixed(9)),Number((point_2.y-point_1.y).toFixed(9)));
    var num_2 = mul(Number((point.y-point_1.y).toFixed(9)),Number((point_2.x-point_1.x).toFixed(9)));
    return sub(num_1,num_2);
}
function isInTriangle(currentPoint,tePoint_1,tePoint_2,tePoint_3){
    //var cuPoint = points[currentPoint];
    var num_1 = mul(cuSide(currentPoint,tePoint_1,tePoint_2),cuSide(tePoint_3,tePoint_1,tePoint_2));
    var num_2 = mul(cuSide(currentPoint,tePoint_2,tePoint_3),cuSide(tePoint_1,tePoint_2,tePoint_3));
    var num_3 = mul(cuSide(currentPoint,tePoint_1,tePoint_3),cuSide(tePoint_2,tePoint_1,tePoint_3));
    if(num_1>=0 && num_2>=0 && num_3>=0){
        return true;
    }else{
        return false;
    }
}

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