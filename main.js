/* 
This script is controlling the main process and displaying native interfaces 
*/

const {
  app,
  BrowserWindow,
  screen
} = require('electron');

const createWindow = () => {
  const mainScreen = screen.getPrimaryDisplay();
  const dimensions = mainScreen.size;
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: dimensions.height,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
