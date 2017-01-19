import aws from 'aws-sdk';
import s3blobs from 's3-blob-store';

const client = new aws.S3({
  accessKeyId: 'EZUUI5PIJTWF9FTDEZKI',
  secretAccessKey: '1ngdj33zx9IuaTMlf2FFYcbC1DzRci3JSryx17Cj',
  endpoint: new aws.Endpoint('http://10.157.212.12'),
});

const store = s3blobs({
  client: client,
  bucket: 'DASH'
});

export default store;
