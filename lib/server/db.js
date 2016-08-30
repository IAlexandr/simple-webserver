import Sequelize from 'sequelize';

const sequelize = new Sequelize('cameraserver', 'user', 'user21', {
  dialect: "postgres", // or 'sqlite', 'postgres', 'mariadb'
  port: 5432,
  logging: false,
});

const Session = sequelize.define('session', {
  startedAt: {
    type: Sequelize.DATE
  },
  stoppedAt: {
    type: Sequelize.DATE
  },
  mpdProps: {
    type: Sequelize.JSON
  },
  isWorking: {
    type: Sequelize.BOOLEAN
  },
});

const Segment = sequelize.define('segment', {
  duration: {
    type: Sequelize.INTEGER
  },
  chunkNumber: {
    type: Sequelize.STRING
  }
});
sequelize.Session = Session;
sequelize.Segment = Segment;
Session.hasMany(Segment, { as: 'Segments' });

export default sequelize;
