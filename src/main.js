#!/usr/bin/env node
"use strict"

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
      process .stderr .write (message)
      process .stderr .write ("\n")
      process .exit (1)
   })

   await window .loadFile (path .join (__dirname, "window.html"))

   window .webContents .send ("convert", process .argv)
})
