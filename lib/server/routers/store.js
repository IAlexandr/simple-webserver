import {Router} from 'express';
import dg from 'debug';
const debug = dg('cameraserver');
import store from './../store';
import manifestGenerator from './../manifest-generator';

const router = Router();

router.get('/:sessionId/manifest.mpd', (req, res) => {
  const sessionId = req.params.sessionId;
  // TODO generate
  manifestGenerator({sessionId}, (err, manifest) => {
    if (err) {
      return res.status(500).json({ errmessage: err.message });
    }
    res.set('Content-Type', 'text/xml');
    return res.send(manifest);
  });
});

router.get('/:sessionId/:key', (req, res) => {
  const key = req.params.key;
  store.exists({ key }, (err, isExists) => {
    if (err) {
      return res.status(500).json({ errmessage: err.message });
    }
    if (!isExists) {
      return res.status(404).json({ errmessage: 'Файл не найден.' });
    }
    const rs = store.createReadStream({ key });
    rs.pipe(res);
  });
});

export default {
  route: 'store',
  router
};
