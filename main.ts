import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win, serve;
const title = 'Pomodoro Cycle';
const args  = process.argv.slice(1);
const trayicon  = path.join(__dirname, '/tray.png')
serve = args.some(val => val === '--serve');

function initMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'View',
      submenu: [{ role: 'about' }, { role: 'reload' }]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'hide' },
        { role: 'quit' },
        { type: 'separator' },
        { label: title, accelerator: 'Cmd+O', click: () => win.show() }
      ]
    },
    {
      role: 'help',
      submenu: [
        { role: 'toggleDevTools' },
        {
          label: 'Learn More',
          click() {
            require('electron').shell.openExternal('https://electron.atom.io');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function initTray()
{
  const tray = new Tray(trayicon);
  const trayMenu = Menu.buildFromTemplate([
    { role: 'reload' },
    { type: 'separator' },
    {
      role: 'window',
      submenu: [
        { label: 'Show', click: () => win.show() },
        { role: 'minimize' },
        { role: 'hide' },
        { role: 'quit' },
      ]
    },
    { type: 'separator' },
    { role: 'about' },
  ])
  tray.setContextMenu(trayMenu);
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    x: 5,
    y: 15,
    width: 300,
    height: 400,
    resizable: false,
    fullscreen: false,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    },
    show: false
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4201');
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, 'dist/index.html'),
        protocol: 'file:',
        slashes: true
      })
    );
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  app.on('activate', function() {
    win.show();
  });

  // Just hide window if was pressed close button in the top panel
  if (process.platform === 'darwin') {
    let forceQuit = false;
    app.on('before-quit', () => {
      forceQuit = true;
    });
    win.on('close', event => {
      if (!forceQuit) {
        event.preventDefault();
        // app.hide();
        win.hide();
      }
    });
  }
  initMenu();
  initTray();
}

try {
  app.setName(title);
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  ipcMain.on('show-window', () => {
    win.show();
  });
} catch (e) {
  // Catch Error
  // throw e;
}
