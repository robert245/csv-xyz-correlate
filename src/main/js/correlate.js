const { workerData, parentPort } = require('worker_threads')

parentPort.on('message', (task) => {
    const {xyz, xArrayBuffer, yArrayBuffer, zArrayBuffer, wArrayBuffer} = task;
    let min_distance = Number.MAX_VALUE;
    let w = null;

    for (let i = 0; i < xArrayBuffer.length; i++) {
        const xyzw = {
            x: xArrayBuffer[i],
            y: yArrayBuffer[i],
            z: zArrayBuffer[i],
            w: wArrayBuffer[i]
        }
        const this_distance = Math.sqrt((
            Math.pow(xyz.x - xyzw.x, 2) +
            Math.pow(xyz.y - xyzw.y, 2) +
            Math.pow(xyz.z - xyzw.z, 2))
        );
        if (this_distance < min_distance) {
            min_distance = this_distance;
            w = xyzw.w;
        }
    }
    parentPort.postMessage({x: xyz.x, y: xyz.y, z: xyz.z, w});
});