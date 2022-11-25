class Random {
  constructor(tokenData) {
    this.tokenData = tokenData;
    this.useA = false;
    let sfc32 = function (uint128Hex) {
      let a = parseInt(uint128Hex.substr(0, 8), 16);
      let b = parseInt(uint128Hex.substr(8, 8), 16);
      let c = parseInt(uint128Hex.substr(16, 8), 16);
      let d = parseInt(uint128Hex.substr(24, 8), 16);
      return function () {
        a |= 0; b |= 0; c |= 0; d |= 0;
        let t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
      };
    };
    // seed prngA with first half of tokenData.hash
    this.prngA = new sfc32(this.tokenData.hash.substr(2, 32));
    // seed prngB with second half of tokenData.hash
    this.prngB = new sfc32(this.tokenData.hash.substr(34, 32));
    for (let i = 0; i < 1e6; i += 2) {
      this.prngA();
      this.prngB();
    }
  }
  // random number between 0 (inclusive) and 1 (exclusive)
  random_dec() {
    this.useA = !this.useA;
    return this.useA ? this.prngA() : this.prngB();
  }
  // random number between a (inclusive) and b (exclusive)
  random_num(a, b) {
    return a + (b - a) * this.random_dec();
  }
  // random integer between a (inclusive) and b (inclusive)
  // requires a < b for proper probability distribution
  random_int(a, b) {
    return Math.floor(this.random_num(a, b + 1));
  }
  // random boolean with p as percent liklihood of true
  random_bool(p) {
    return this.random_dec() < p;
  }
  // random value in an array of items
  random_choice(list) {
    return list[this.random_int(0, list.length - 1)];
  }
}

export const genTokenData = (projectNum) => {
  let data = {};
  let hash = "0x";
  for (var i = 0; i < 64; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  data.hash = hash;
  data.tokenId = (projectNum * 1000000 + Math.floor(Math.random() * 1000)).toString();
  return data;
}

// // shuffle an array - mattedesl (https://github.com/mattdesl/tiny-artblocks/blob/main/src/util/random.js)
// const shuffleArray = (arr) => {
//   var rand;
//   var tmp;
//   var len = arr.length;
//   var ret = [...arr];
//   while (len) {
//     rand = ~~(R.random_dec() * len--);
//     tmp = ret[len];
//     ret[len] = ret[rand];
//     ret[rand] = tmp;
//   }
//   return ret;
// };

// const drawBrushLine = (x1,y1,x2,y2, inc, size, variance) => {
//   const stepsBetweenPoints = inc;
//   const xIncrement = (x2 - x1) / stepsBetweenPoints;
//   const yIncrement = (y2 - y1) / stepsBetweenPoints;

  
//   let currentX = x1;
//   let currentY = y1;

//   const minRadius = size*0.4*variance;
//   const maxRadius = size*0.4;

//   for (let i = 0; i < stepsBetweenPoints; i++) {
//     // const rad = (abs(noise(currentX*0.005, currentY*0.005)) + minRadius) * maxRadius;
//     // circle(currentX,currentY, rad);
//     randomCirclesAroundPoints(currentX, currentY, size, R.random_num(size*variance,size*2));
//     currentX += xIncrement;
//     currentY += yIncrement;
//   }
// }

// const randomCirclesAroundPoints = (centerX, centerY, thickness, density) => {
//   for(let i = 0; i < density; i++) {
//     const rndRadius = random(0, thickness);
//     const rndDegrees = random(0, 360);
//     const x = centerX + rndRadius * cos(rndDegrees);
//     const y = centerY + rndRadius * sin(rndDegrees);
//     const pointRadius = random(thickness*0.05, thickness*0.2);
//     circle(x,y,pointRadius);
//   }
// }

// const drawBrushArc = (cx, cy, d, stroke, density, start = 0, stop = 360) => {
//   for (let i = start; i < stop; i++) {
//     let currentX = sin(i)*d/2;
//     let currentY = cos(i)*d/2;
//     randomCirclesAroundPoints(currentX+cx,currentY+cy,stroke,density)
//   }
// }

export default Random