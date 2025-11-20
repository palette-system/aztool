
const cluster = require('cluster');
const cpus = require('os').cpus().length;

console.log(cpus);



if (cluster.isPrimary) {

  console.log(`Master ${process.pid} has started`);

  for (let i=0 ; i<cpus ; i++) {
    console.log(`Worker [${i}] fork`);
    cluster.fork();
  }

} else {

  console.log(`Worker has [${cluster.worker.id}] ${process.pid} started`);
}

