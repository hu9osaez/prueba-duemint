import fs from 'fs';
import tmpdir from '@stdlib/os-tmpdir';
import csvToJSON from 'csvtojson';

import TransformData from './transform-data.js';

const fileName = 'invoices.csv';
const transformDataPipe = new TransformData();

(async (dataCount) => {
  // let count = 0;
  // const csvReadableStream = new CsvReadableStream();
  const fsReaderStream = fs.createReadStream(`${tmpdir()}/${fileName}`, {
    encoding: 'utf8',
  });

  fsReaderStream
    .pipe(csvToJSON())
    .on('error', (error) => {
      console.error(error);
    })
    .on('header', (headers) => {
      console.info(headers);
    })
    .pipe(transformDataPipe);
})();
