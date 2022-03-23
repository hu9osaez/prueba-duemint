import download from 'download';
import fs from 'fs';
import tmpdir from '@stdlib/os-tmpdir';
import logUpdate from 'log-update';
import util from 'util';
import stream from 'stream';
import CsvReadableStream from 'csv-reader';

const fileName = 'invoices.csv';
const dataURL = `https://duemint.s3.amazonaws.com/uploads/files/${fileName}`;

const pipeline = util.promisify(stream.pipeline);

(async () => {
  const downloadStream = download(dataURL);
  const fsWriterStream = fs.createWriteStream(`${tmpdir()}/${fileName}`);
  const csvReadableStream = new CsvReadableStream();

  downloadStream.on('downloadProgress', ({ percent }) => {
    const percentage = Math.round(percent * 100);
    logUpdate(`Progreso de descarga: (${percentage}%)`);
  });

  pipeline(downloadStream, fsWriterStream)
    .then(() => {
      console.log(`File downloaded to ${tmpdir()}/${fileName}`);
      const fsReaderStream = fs.createReadStream(`${tmpdir()}/${fileName}`, {
        encoding: 'utf8',
      });

      fsReaderStream
        .pipe(csvReadableStream)
        .on('error', (error) => {
          console.error(error);
        })
        .on('header', (headers) => {
          console.info(headers);
        });
    })
    .catch((error) => console.error(`Something went wrong. ${error.message}`));
})();
