const _ = require("lodash");

const bytes = function(a, b) {
  let string = "";
  if (a === undefined || isNaN(a) || a === null) {
    return (string = "No File Estimate");
  } else {
    if (0 == a) return "0 Bytes";
    var c = 1024,
      d = b || 2,
      e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      f = Math.floor(Math.log(a) / Math.log(c));
    return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
  }
};

const calculatePercent = function(use, total) {
  let percent = (use / total) * 100;
  return Math.round(percent);
};
const generateTime = function(seconds) {
  let string = "";
  if (seconds === undefined || isNaN(seconds) || seconds === null) {
    string = "Done";
  } else {
    let days = Math.floor(seconds / (3600 * 24));

    seconds -= days * 3600 * 24;
    let hrs = Math.floor(seconds / 3600);

    seconds -= hrs * 3600;
    let mnts = Math.floor(seconds / 60);

    seconds -= mnts * 60;
    seconds = Math.floor(seconds);

    string =
      days +
      " Days, " +
      hrs +
      " Hrs, " +
      mnts +
      " Mins, " +
      seconds +
      " Seconds";
    if (mnts == 0) {
      if (string.includes("0 Mins")) {
        string = string.replace(" 0 Mins,", "");
      }
    }
    if (hrs == 0) {
      if (string.includes("0 Hrs")) {
        string = string.replace(" 0 Hrs,", "");
      }
    }
    if (days == 0) {
      if (string.includes("0 Days")) {
        string = string.replace("0 Days,", "");
      }
    }
    if (mnts == 0 && hrs == 0 && days == 0 && seconds == 0) {
      string = string.replace("0 Seconds", "Done");
    }
  }
  return string;
};
const historyTotals = function(history){
  let historyFileNames = []
  let historyPrinterNames = []
  let historySpools = []
  let paths = [];

  history.forEach(hist => {
    historyPrinterNames.push(hist.printer.replace(/ /g, "_"));
    if(typeof hist.file !== 'undefined'){
      historyFileNames.push(hist.file.name.replace(".gcode", ""));
      let path = hist.file.path.substring(0, hist.file.path.lastIndexOf("/"))
      if(path != ''){
        paths.push(path);
      }
    }
    //console.log(hist.spools)


    // if(hist.printHistory.filamentSelection != null && typeof hist.printHistory.filamentSelection !== 'undefined' && typeof hist.printHistory.filamentSelection.spools !== 'undefined'){
    //   historySpools.push(
    //       hist.printHistory.filamentSelection.spools.profile.material.replace(/ /g, "_")
    //   );
    // }

  })
  return {
    pathList: paths.filter(function (item, i, ar) {
      return ar.indexOf(item) === i;
    }),
    fileNames: historyFileNames.filter(function (item, i, ar) {
      return ar.indexOf(item) === i;
    }),
    printerNames: historyPrinterNames.filter(function (item, i, ar) {
      return ar.indexOf(item) === i;
    }),
    spools: historySpools.filter(function (item, i, ar) {
      return ar.indexOf(item) === i;
    }),

  };

}


module.exports = {
  generateBytes: bytes,
  generateTime: generateTime,
  calculatePercent: calculatePercent,
  historyTotals: historyTotals,

};
