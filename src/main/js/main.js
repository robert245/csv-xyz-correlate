const xyzFile = process.env.XYZ_FILE || './src/test/resources/xyz.csv';
const xyzwFile = process.env.XYZW_FILE || './src/test/resources/xyzw.csv';
const outputFile = process.env.OUTPUT_FILE || './output.csv';

const ObjectsToCsv = require('objects-to-csv')
const WorkerPool = require('./worker_pool.js');
const neatCsv = require('neat-csv');
const fs = require('fs');
const os = require('os');

const readCSV = async (path) => {
    const data = fs.readFileSync(path);
    return neatCsv(data);
}

const sliceIntoMemoryBuffers = (xyzwArray) => {
    // We must use SharedArrayBuffer objects for nodejs to share the same memory within threads, which is what this is doing
    const [xArrayBuffer, yArrayBuffer, zArrayBuffer, wArrayBuffer] = [0,0,0,0].map(() =>
        new Int16Array(new SharedArrayBuffer(xyzwArray.length * Int16Array.BYTES_PER_ELEMENT)));

    xArrayBuffer.set(xyzwArray.map(xyzw => xyzw.x))
    yArrayBuffer.set(xyzwArray.map(xyzw => xyzw.y))
    zArrayBuffer.set(xyzwArray.map(xyzw => xyzw.z))
    wArrayBuffer.set(xyzwArray.map(xyzw => xyzw.w))
    return {xArrayBuffer, yArrayBuffer, zArrayBuffer, wArrayBuffer}
}

const runCorrelate = (pool, xyz, xyzwMemBuffers) => new Promise((resolve, reject) => {

    pool.runTask({
            xyz,
            xArrayBuffer: xyzwMemBuffers.xArrayBuffer,
            yArrayBuffer: xyzwMemBuffers.yArrayBuffer,
            zArrayBuffer: xyzwMemBuffers.zArrayBuffer,
            wArrayBuffer: xyzwMemBuffers.wArrayBuffer
        }, (err, result) => {
            resolve(result);
        }
    );
});

const writeResultToDisk = async (results, path) => {
    const csv = new ObjectsToCsv(results)
    await csv.toDisk(path, {})
};

// Main
(async () => {
    console.log('Reading CSV files');
    const [xyzArray, xyzwArray] = await Promise.all([readCSV(xyzFile), readCSV(xyzwFile)]);
    console.log('Finished reading CSV files');

    xyzwMemBuffers = sliceIntoMemoryBuffers(xyzwArray);
    console.log('Starting correlation');

    const result = [];
    const pool = new WorkerPool(os.cpus().length - 1, 'correlate.js');

    while(xyzArray.length > 0) {
        const startTime = new Date();
        const subset = xyzArray.splice(0, Math.min(500, xyzArray.length));
        const chunkResult = await Promise.all(subset.map(xyz => runCorrelate(pool, xyz, xyzwMemBuffers)));
        const endTime = new Date() - startTime;
        console.log(`Adding ${chunkResult.length} records to result in ${endTime / 1000} seconds`);
        result.push(...chunkResult);
    }

    console.log(`Done - writing result to ${outputFile}`);
    await writeResultToDisk(result, outputFile);
})();