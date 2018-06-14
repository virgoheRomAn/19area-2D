const electron = require('electron')
const ipc = require('electron').ipcMain;
const app = electron.app
let fs = require('fs');
let path = require('path');
let url = require('url');
let join = path.join;
let dialog = require('electron').dialog;
let child_process = require("child_process");
let ipcMain = require('electron').ipcMain;

//监听3D回到2D，启动服务
let child = child_process.fork(__dirname + "/port.js");
child.on("message", function (message) {
  mainWindow.webContents.send("get3Dmessage", true);
});

const BrowserWindow = electron.BrowserWindow;
let mainWindow


function createWindow() {
  var electronScreen = electron.screen;
  var size = electronScreen.getPrimaryDisplay().workAreaSize;
  let memberUI = "UI/myLogo.ico";
  if (!fs.existsSync(memberUI)) {
    memberUI = "./19.ico";
  }
  mainWindow = new BrowserWindow({ width: size.width, height: size.height, icon: memberUI });
  //打包用
  // mainWindow.loadURL(url.format({
  //   pathname: path.join(__dirname, 'dist/index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))
  //开发用
  mainWindow.loadURL(url.format({
    pathname: 'localhost:8081/',
    protocol: 'http:',
    width: 1024,
    slashes: true,

  }))
  //打开调试模式
  mainWindow.webContents.openDevTools();

  ipcMain.on('synchronous-message', function (event, arg) {
    mainWindow.webContents.send('asynchronous-reply', true);
  });

  //关闭2D窗口
  mainWindow.on('close', function (e) {
    e.preventDefault();
    ipcMain.once('asynchronous-message', function (event, arg) {
      if (arg == false) {
        !!mainWindow && mainWindow.destroy();
        return;
      } else {
        !!mainWindow && mainWindow.destroy();
        return;
      }
    });
    mainWindow.webContents.send('aisChanged', 666);

  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.op
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});

ipc.on('quit', function () {
  app.quit();
});
