#!/usr/bin/env node
const
   electron = require ("electron"),
   fs       = require ("fs"),
   path     = require ("path")

electron .app .whenReady () .then (() =>
{
   const window = new electron .BrowserWindow ({ show: false, webPreferences: { offscreen: true } })

   window .loadURL ("https://github.com")
   window .webContents .on ("paint", (event, dirty, image) =>
   {
      fs .writeFileSync ("ex.png", image .toPNG ())
      console .log (`The screenshot has been successfully saved to ${path .join (process .cwd (), "ex.png")}`)
      electron .app .quit ()
   })

   window .webContents .setFrameRate (60)
})
