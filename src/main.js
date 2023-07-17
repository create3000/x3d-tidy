"use strict"

const
   electron = require ("electron"),
   path     = require ("path")

process .env .ELECTRON_DISABLE_SECURITY_WARNINGS = "true"
// process .env .ELECTRON_ENABLE_LOGGING            = 1

if (process .platform === "darwin")
{
   electron .app .setActivationPolicy ("accessory")
   electron .app .dock .hide ()
}

electron .app .whenReady () .then (async () =>
{
   const window = new electron .BrowserWindow ({
      show: false,
      skipTaskbar: true,
      webPreferences: {
         offscreen: true,
         preload: path .join (__dirname, "window.js"),
         nodeIntegration: true,
         contextIsolation: false,
      },
   })

   electron .ipcMain .on ("ready", () => electron .app .quit ())

   electron .ipcMain .on ("log", (event, message = "") =>
   {
      process .stderr .write (message)
      process .stderr .write ("\n")
   })

   electron .ipcMain .on ("error", (event, message = "") =>
   {
      process .stderr .write (message)
      process .stderr .write ("\n")
   })

   electron .ipcMain .on ("exit", (event, code = 0) =>
   {
      process .exit (code)
   })

   await window .loadFile (path .join (__dirname, "window.html"))

   window .webContents .send ("convert", process .argv)
})
