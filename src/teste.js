/* eslint-disable new-cap */
const moment = require('moment');

const handleDate = () => {
  const req = moment();
  const comp = new Date();
  if (req < comp || req !== comp) {
    console.log(true);
  } else {
    console.log(false);
  }
  console.log(req);
  console.log(comp);
};
handleDate();
