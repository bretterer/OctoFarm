import Client from "./lib/octofarm.js";
import UI from "./lib/functions/ui.js";
import Calc from "./lib/functions/calc.js";
import OctoFarmclient from "./lib/octofarm.js";
import Script from "./lib/modules/scriptCheck.js";
// Add listeners to settings
document.getElementById("saveServerSettings").addEventListener("click", (e) => {
  // Validate Printer Form, then Add
  ServerSettings.update();
});
document.getElementById("saveSettings").addEventListener("click", (e) => {
  // Validate Printer Form, then Add
  ClientSettings.update();
});

let oldServerSettings = {};

const optionsMemory = {
  title: {
    text: "Memory",
    align: "center",
    margin: 1,
    offsetX: 0,
    offsetY: 0,
    floating: false,
    style: {
      fontSize: "14px",
      fontWeight: "bold",
      fontFamily: undefined,
      color: "#fff",
    },
  },
  chart: {
    type: "donut",
    height: "200px",
    animations: {
      enabled: false,
    },
    background: "#303030",
  },
  theme: {
    mode: "dark",
  },
  plotOptions: {
    pie: {
      expandOnClick: true,
      dataLabels: {
        offset: 10,
        minAngleToShowLabel: 15,
      },
    },
  },
  stroke: {
    show: false,
  },
  tooltip: {
    y: {
      formatter(val) {
        return Calc.bytes(val);
      },
    },
  },
  noData: {
    text: "Loading...",
  },
  dataLabels: {
    enabled: false,
  },
  series: [],
  labels: ["Other", "OctoFarm", "Free"],
  colors: ["#f39c12", "#3498db", "#00bc8c"],
  legend: {
    show: true,
    showForSingleSeries: false,
    showForNullSeries: true,
    showForZeroSeries: true,
    position: "bottom",
    horizontalAlign: "center",
    floating: false,
    fontSize: "11px",
    fontFamily: "Helvetica, Arial",
    fontWeight: 400,
    formatter: undefined,
    inverseOrder: false,
    width: undefined,
    height: undefined,
    tooltipHoverFormatter: undefined,
    offsetX: -25,
    offsetY: 0,
    labels: {
      colors: undefined,
      useSeriesColors: false,
    },
    markers: {
      width: 9,
      height: 9,
      strokeWidth: 0,
      strokeColor: "#fff",
      fillColors: undefined,
      radius: 1,
      customHTML: undefined,
      onClick: undefined,
      offsetX: 0,
      offsetY: 0,
    },
    itemMargin: {
      horizontal: 1,
      vertical: 0,
    },
    onItemClick: {
      toggleDataSeries: false,
    },
    onItemHover: {
      highlightDataSeries: false,
    },
  },
};
const optionsCPU = {
  title: {
    text: "CPU",
    align: "center",
    margin: 1,
    offsetX: 0,
    offsetY: 0,
    floating: false,
    style: {
      fontSize: "14px",
      fontWeight: "bold",
      fontFamily: undefined,
      color: "#fff",
    },
  },
  chart: {
    type: "donut",
    height: "200px",
    animations: {
      enabled: true,
    },
    background: "#303030",
  },
  theme: {
    mode: "dark",
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      dataLabels: {
        offset: 10,
        minAngleToShowLabel: 15,
      },
    },
  },
  stroke: {
    show: false,
  },
  tooltip: {
    y: {
      formatter(val) {
        return `${Math.round(val * 10) / 10}%`;
      },
    },
  },
  noData: {
    text: "Loading...",
  },
  dataLabels: {
    enabled: false,
  },
  series: [],
  labels: ["System", "OctoFarm", "User", "Free"],
  colors: ["#f39c12", "#3498db", "#375a7f", "#00bc8c"],
  legend: {
    show: true,
    showForSingleSeries: false,
    showForNullSeries: true,
    showForZeroSeries: true,
    position: "bottom",
    horizontalAlign: "center",
    floating: false,
    fontSize: "11px",
    fontFamily: "Helvetica, Arial",
    fontWeight: 400,
    formatter: undefined,
    inverseOrder: false,
    width: undefined,
    height: undefined,
    tooltipHoverFormatter: undefined,
    offsetX: -25,
    offsetY: 0,
    labels: {
      colors: undefined,
      useSeriesColors: false,
    },
    markers: {
      width: 9,
      height: 9,
      strokeWidth: 0,
      strokeColor: "#fff",
      fillColors: undefined,
      radius: 1,
      customHTML: undefined,
      onClick: undefined,
      offsetX: 0,
      offsetY: 0,
    },
    itemMargin: {
      horizontal: 1,
      vertical: 0,
    },
    onItemClick: {
      toggleDataSeries: false,
    },
    onItemHover: {
      highlightDataSeries: false,
    },
  },
};
const systemChartCPU = new ApexCharts(
  document.querySelector("#systemChartCPU"),
  optionsCPU
);
systemChartCPU.render();
const systemChartMemory = new ApexCharts(
  document.querySelector("#systemChartMemory"),
  optionsMemory
);
systemChartMemory.render();
setInterval(async function updateStatus() {
  let systemInfo = await Client.get("settings/sysInfo");
  systemInfo = await systemInfo.json();
  if (
    Object.keys(systemInfo).length === 0 &&
    systemInfo.constructor === Object
  ) {
  } else {
    document.getElementById("systemUpdate").innerHTML = Calc.generateTime(
      systemInfo.sysUptime.uptime
    );

    document.getElementById("processUpdate").innerHTML = Calc.generateTime(
      systemInfo.processUptime
    );
    // labels: ['System', 'OctoFarm', 'User', 'Free'],
    const cpuLoad = systemInfo.cpuLoad.currentload_system;
    const octoLoad = systemInfo.sysProcess.pcpu;
    const userLoad = systemInfo.cpuLoad.currentload_user;
    const remain = cpuLoad + octoLoad + userLoad;
    systemChartCPU.updateSeries([cpuLoad, octoLoad, userLoad, 100 - remain]);

    const otherRAM = systemInfo.memoryInfo.total - systemInfo.memoryInfo.free;
    const octoRAM =
      (systemInfo.memoryInfo.total / 100) * systemInfo.sysProcess.pmem;
    const freeRAM = systemInfo.memoryInfo.free;

    systemChartMemory.updateSeries([otherRAM, octoRAM, freeRAM]);
  }
}, 5000);

class ClientSettings {
  static init() {
    Client.get("settings/client/get")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        // localStorage.setItem("clientSettings", JSON.stringify(res));
        if (res.settings.backgroundURL != null) {
          document.getElementById("clientBackground").value =
            res.settings.backgroundURL;

          document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${res.settings.backgroundURL})`;
        }
        document.getElementById("panelCurrentOpOn").checked =
          res.panelView.currentOp;
        document.getElementById("panelHideOffline").checked =
          res.panelView.hideOff;
        document.getElementById("panelHideClosed").checked =
          res.panelView.hideClosed;
        document.getElementById("panelExtraInfoOn").checked =
          res.panelView.extraInfo;

        document.getElementById("cameraCurrentOpOn").checked =
          res.cameraView.currentOp;
        document.getElementById("selectCameraGrid").value =
          res.cameraView.cameraRows;
        document.getElementById("cameraHideClosed").checked =
          res.cameraView.hideClosed;
        document.getElementById("cameraExtraInfoOn").checked =
          res.cameraView.extraInfo;

        document.getElementById("listCurrentOpOn").checked =
          res.listView.currentOp;
        document.getElementById("listHideOffline").checked =
          res.listView.hideOff;
        document.getElementById("listHideClosed").checked =
          res.listView.hideClosed;
        document.getElementById("listExtraInfoOn").checked =
          res.listView.extraInfo;
      });
  }

  static async update() {
    const bg = document.getElementById("clientBackground").value;
    let bgVal = null;
    if (bg != null && bg != "") {
      bgVal = bg;
    }
    const opts = {
      settings: {
        backgroundURL: bgVal,
      },
      panelView: {
        currentOp: document.getElementById("panelCurrentOpOn").checked,
        hideOff: document.getElementById("panelHideOffline").checked,
        hideClosed: document.getElementById("panelHideClosed").checked,
        extraInfo: document.getElementById("panelExtraInfoOn").checked,
      },
      listView: {
        currentOp: document.getElementById("listCurrentOpOn").checked,
        hideOff: document.getElementById("listHideOffline").checked,
        hideClosed: document.getElementById("listHideClosed").checked,
        extraInfo: document.getElementById("listExtraInfoOn").checked,
      },
      cameraView: {
        currentOp: document.getElementById("cameraCurrentOpOn").checked,
        cameraRows: document.getElementById("selectCameraGrid").value,
        hideClosed: document.getElementById("cameraHideClosed").checked,
        extraInfo: document.getElementById("cameraExtraInfoOn").checked,
      },
    };
    await Client.post("settings/client/update", opts);
    localStorage.setItem("clientSettings", JSON.stringify(opts));
    UI.createAlert("success", "Client settings updated", 3000, "clicked");
  }

  static get() {
    // return JSON.parse(localStorage.getItem("clientSettings"));
  }
}
class ServerSettings {
  static async init() {
    Client.get("settings/server/get")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        oldServerSettings = res;
        document.getElementById("webSocketThrottle").value =
          res.onlinePolling.seconds;
        document.getElementById("serverPortNo").value = res.server.port;
        document.getElementById("requireLogin").checked =
          res.server.loginRequired;
        document.getElementById("requireRegistration").checked =
          res.server.registration;

        document.getElementById("webSocketRetry").value =
          res.timeout.webSocketRetry / 1000;
        document.getElementById("APITimeout").value =
          res.timeout.apiTimeout / 1000;
        document.getElementById("APIRetryTimeout").value =
          res.timeout.apiRetryCutoff / 1000;
        document.getElementById("APIRetry").value = res.timeout.apiRetry / 1000;
        if (typeof res.filament !== "undefined") {
          document.getElementById("checkFilament").checked =
            res.filament.filamentCheck;
        }

        if (!res.filamentManager) {
          const filManager = document.getElementById("filamentManagerSyncBtn");
          filManager.addEventListener("click", async (event) => {
            filManager.innerHTML =
              '<i class="fas fa-sync fa-spin"></i> <br> Syncing <br> Please Wait...';
            let post = await OctoFarmclient.post(
              "filament/filamentManagerSync",
              { activate: true }
            );
            post = await post.json();
            if (post.status) {
              filManager.innerHTML =
                '<i class="fas fa-sync"></i> <br> Sync Filament Manager';
              filManager.disabled = true;
              UI.createAlert(
                "success",
                "Filament Manager Plugin successfully synced",
                3000
              );
            } else {
              filManager.innerHTML =
                '<i class="fas fa-sync"></i> <br> Sync Filament Manager';
              filManager.disabled = false;
              UI.createAlert(
                "error",
                "Something went wrong, please check the filament manager logs.",
                3000
              );
            }
          });
        } else if (res.filamentManager) {
          const filManager = document.getElementById("resync-FilamentManager");
          filManager.addEventListener("click", async (event) => {
            filManager.disabled = true;
            filManager.innerHTML =
              '<i class="fas fa-sync fa-spin"></i> <br> Syncing... <br> Please Wait...';
            let post = await OctoFarmclient.post(
              "filament/filamentManagerReSync"
            );
            post = await post.json();
            if (post.status) {
              filManager.innerHTML =
                '<i class="fas fa-sync"></i> <br> Re-Sync Database';
              filManager.disabled = false;
            } else {
              filManager.innerHTML =
                '<i class="fas fa-sync"></i> <br> Re-Sync Database';
              filManager.disabled = false;
            }
          });
          const disableFilManager = document.getElementById(
            "disable-FilamentManager"
          );
          disableFilManager.addEventListener("click", async (event) => {
            let post = await OctoFarmclient.post(
              "filament/disableFilamentPlugin",
              { activate: true }
            );
            post = await post.json();
          });
        }
      });
    let logList = await Client.get("settings/server/get/logs");
    logList = await logList.json();
    const logTable = document.getElementById("serverLogs");
    logList.forEach((logs) => {
      logTable.insertAdjacentHTML(
        "beforeend",
        `
            <tr>
                <td>${logs.name}</td>
                <td>${new Date(logs.modified).toString().substring(0, 21)}</td>
                <td>${Calc.bytes(logs.size)}</td>
                <td><button id="${
                  logs.name
                }" type="button" class="btn btn-sm btn-primary"><i class="fas fa-download"></i></button></td>
            </tr>
        `
      );
      document
        .getElementById(logs.name)
        .addEventListener("click", async (event) => {
          const body = {
            logName: logs.name,
          };
          window.open(`/settings/server/download/logs/${logs.name}`);
        });
    });
  }

  static update() {
    let reboot = false;
    const onlinePoll = document.getElementById("webSocketThrottle").value;
    const onlinePolling = {
      seconds: onlinePoll,
    };
    const server = {
      port: parseInt(document.getElementById("serverPortNo").value),
      loginRequired: document.getElementById("requireLogin").checked,
      registration: document.getElementById("requireRegistration").checked,
    };
    const timeout = {
      webSocketRetry: document.getElementById("webSocketRetry").value * 1000,
      apiTimeout: document.getElementById("APITimeout").value * 1000,
      apiRetryCutoff: document.getElementById("APIRetryTimeout").value * 1000,
      apiRetry: document.getElementById("APIRetry").value * 1000,
    };
    const filament = {
      filamentCheck: document.getElementById("checkFilament").checked,
    };
    if (
      oldServerSettings.server.port !== server.port ||
      oldServerSettings.server.loginRequired !== server.loginRequired ||
      oldServerSettings.server.registration !== server.registration ||
      oldServerSettings.timeout.webSocketRetry !== timeout.webSocketRetry ||
      oldServerSettings.timeout.apiTimeout !== timeout.apiTimeout ||
      oldServerSettings.timeout.apiRetryCutoff !== timeout.apiRetryCutoff ||
      oldServerSettings.timeout.apiRetry !== timeout.apiRetry
    ) {
      reboot = true;
    }
    Client.post("settings/server/update", {
      onlinePolling,
      server,
      timeout,
      filament,
    })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (reboot) {
          bootbox.confirm({
            message:
              "Your settings changes require a restart, would you like to do this now?",
            buttons: {
              cancel: {
                label: '<i class="fa fa-times"></i> Cancel',
              },
              confirm: {
                label: '<i class="fa fa-check"></i> Confirm',
              },
            },
            callback(result) {
              if (result) {
                OctoFarmclient.get("settings/server/restart");
                UI.createAlert(
                  "warning",
                  "Performing a server restart, please wait for it to come back online.",
                  6000,
                  "Clicked"
                );
              }
            },
          });
        }
      });
  }
}

// Initialise Settings
ServerSettings.init();
ClientSettings.init();
Script.get();
