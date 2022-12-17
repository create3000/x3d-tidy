#!/usr/bin/env node
const
   electron = require ("electron"),
   path     = require ("path")

process .env .ELECTRON_DISABLE_SECURITY_WARNINGS = "true"

electron .app .whenReady () .then (async () =>
{
   const window = new electron .BrowserWindow ({
      show: false,
      webPreferences: {
         offscreen: true,
         preload: path .join (__dirname, "window.js"),
         nodeIntegration: true,
         contextIsolation: false,
      },
   })

   electron .ipcMain .on ("ready", () => electron .app .quit ())

   electron .ipcMain .on ("error", (event, message) =>
   {
      console .log (message)
      electron .app .quit ()
   })

   await window .loadFile (path .join (__dirname, "window.html"))

   window .webContents .send ("convert", process .argv)
})
