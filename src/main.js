"use strict"

const
   electron = require ("electron"),
   path     = require ("path"),
   colors   = require ("colors")

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

   electron .ipcMain .on ("log", (event, messages) =>
   {
      console .log (... messages)
   })

   electron .ipcMain .on ("warn", (event, messages) =>
   {
      console .warn (... messages .map (string => colors .yellow (string)))
   })

   electron .ipcMain .on ("error", (event, messages) =>
   {
      console .error (... messages .map (string => colors .red (string)))
   })

   electron .ipcMain .on ("exit", (event, code = 0) =>
   {
      electron .app .exit (code)
   })

   await window .loadFile (path .join (__dirname, "window.html"))

   window .webContents .send ("main", process .argv)
})
