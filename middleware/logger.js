const { format, compareAsc } = require("date-fns");
const { v4: uuidv4 } = require("uuid");

const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");

const logEvents = async (mess, logFileName) => {
  console.log("logEcent");
  const dateTime = format(new Date(), "Pp");
  const logItem = `${dateTime}\t${uuidv4()}\t${mess}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromise.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromise.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

const logger = (req, res, next) => {
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}\n`, "reqLog.log");
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logEvents, logger };
