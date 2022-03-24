import cliProgress from 'cli-progress';
import download from 'download';
import fs from 'fs';
import tmpdir from '@stdlib/os-tmpdir';
import util from 'util';
import stream from 'stream';

const fileName = 'invoices.csv';
const dataURL = `https://duemint.s3.amazonaws.com/uploads/files/${fileName}`;

const pipeline = util.promisify(stream.pipeline);

(async () => {
  console.info('Descargando datos de facturas y guardandolos en MongoDB');

  const downloadBar = new cliProgress.SingleBar({
    format: '> Progreso de descarga: {bar} | {percentage}%',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true,
  });
  downloadBar.start(100, 0);

  const downloadStream = download(dataURL);
  const fsWriterStream = fs.createWriteStream(`${tmpdir()}/${fileName}`);

  downloadStream.on('downloadProgress', ({ percent }) => {
    const percentage = Math.round(percent * 100);
    downloadBar.update(percentage);
  });

  pipeline(downloadStream, fsWriterStream)
    .then(() => {
      downloadBar.stop();
      console.log(`> Archivo descargado en: ${tmpdir()}/${fileName}`);
    })
    .catch((error) => console.error(`Something went wrong. ${error.message}`));
})();
