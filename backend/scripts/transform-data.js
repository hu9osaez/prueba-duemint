import stream from 'stream';

export default class TransformData extends stream.Transform {
  constructor(options = {}) {
    super({ ...options, objectMode: true });
    this.requests = [];
  }

  _transform(chunk, encoding, callback) {
    console.info(chunk.toString());
    if (this.requests.length < 200) {
      return callback();
    }

    this.processRequests(callback);
  }

  _flush(callback) {
    this.processRequests(callback);
  }

  processRequests(callback) {
    return Promise.all(this.requests)
      .then((responses) => {
        this.requests = [];

        this.push(
          responses.reduce((accumulator, currentValue) => {
            return accumulator + JSON.stringify(currentValue);
          }, ''),
        );
        callback();
      })
      .catch(callback);
  }
};
