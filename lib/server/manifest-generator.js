import moment from 'moment';
import xml from 'xml';
import db from './db';
const declaration = { declaration: { encoding: 'UTF-8' } };

function prepMpdAttrs (mpdProps, mediaPresentationDuration) {
  const {
    minBufferTime,
    minimumUpdatePeriod,
    suggestedPresentationDelay,
    availabilityStartTime
  } = mpdProps;
  let publishTime = mpdProps.publishTime;

  let _attr = {
    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
    'xmlns': 'urn:mpeg:dash:schema:mpd:2011',
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'xsi:schemaLocation': 'urn:mpeg:DASH:schema:MPD:2011 http://standards.iso.org/ittf/PubliclyAvailableStandards/MPEG-DASH_schema_files/DASH-MPD.xsd',
    'profiles': 'urn:mpeg:dash:profile:isoff-live:2011',
    'type': 'dynamic',
    minBufferTime
  };

  if (!mediaPresentationDuration) {
    const date = new Date();
    publishTime = moment().utc().format('YYYY:MM:DDTHH:mm:ss');
    _attr = Object.assign(_attr, {
      minimumUpdatePeriod,
      suggestedPresentationDelay,
      availabilityStartTime,
      publishTime,
    });
  } else {
    _attr = Object.assign(_attr, {
      type: 'static',
      mediaPresentationDuration,
    });
  }

  return { _attr }
}

function prepSegmentTimeline (sessionId, callback) {
    db.Segment.sum('duration', { where: { sessionId } })
      .then(durationSum => {
        db.Segment.count({ where: { sessionId } })
          .then((segmentCount) => {
            const averageDuration = durationSum / segmentCount;
            const firstSegmentDuration = parseInt(averageDuration);
            const repeat = segmentCount - 1;
            const lastSegmentDuration = durationSum - firstSegmentDuration - parseInt(averageDuration) * repeat;
            const testSum = firstSegmentDuration + lastSegmentDuration + parseInt(averageDuration) * repeat;
            const segmentTimeline = [];
            segmentTimeline.push({
              S: [{
                _attr: {
                  t: 0,
                  d: firstSegmentDuration
                }
              }]
            });
            segmentTimeline.push({
              S: [{
                _attr: {
                  r: repeat,
                  d: parseInt(averageDuration)
                }
              }]
            });
            if (lastSegmentDuration > 0) {
              segmentTimeline.push({
                S: [{
                  _attr: {
                    d: lastSegmentDuration
                  }
                }]
              });
            }
            return callback(null, segmentTimeline);
          });
  });

}

function prepMpd ({ mpdAttr, mpdProps, SegmentTimeline, sessionId }) {
  return [
    {
      MPD: [
        mpdAttr,
        {
          ProgramInformation: [
            {
              'Title': 'Media Presentation'
            }
          ]
        },
        {
          Period: [
            {
              _attr: {
                'start': 'PT0.0S'
              }
            },
            {
              AdaptationSet: [
                {
                  _attr: {
                    contentType: "video",
                    segmentAlignment: "true",
                    bitstreamSwitching: "true",
                    frameRate: '25/1'
                  }
                },
                {
                  Representation: [
                    {
                      _attr: Object.assign(mpdProps.Representation, {frameRate: '25/1'})
                    },
                    {
                      SegmentTemplate: [
                        {
                          _attr: {
                            timescale: mpdProps.SegmentTemplate.timescale,
                            initialization: sessionId + '_init-stream$RepresentationID$.m4s',
                            media: sessionId + '_$Number%05d$.m4s',
                            startNumber: '1'
                          }
                        },
                        {
                          SegmentTimeline
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ];
}

export default function ({ sessionId, query = {} }, callback) {
  db.Session.findById(sessionId)
    .then((session) => {
      const live = !Object.keys(query).length > 0;
      let mpdAttr;
      const mpdProps = session.get('mpdProps');
      if (live) {
        mpdAttr = prepMpdAttrs(mpdProps);
        prepSegmentTimeline(sessionId, (err, SegmentTimeline) => {
          return callback(null, xml(prepMpd({ mpdAttr, mpdProps, SegmentTimeline, sessionId }), declaration));
        })
      } else {
        // TODO
        db.Segment.findAll({ where: { sessionId } })
          .then((segments) => {

          });
      }

    })
    .catch(callback);
}
