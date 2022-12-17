"use strict"

window .addEventListener ("DOMContentLoaded", () =>
{
   const
      X3D      = require ("x_ite"),
      electron = require ("electron"),
      yargs    = require ("yargs"),
      path     = require ("path"),
      fs       = require ("fs")

   electron .ipcRenderer .on ("convert", async (event, args) =>
   {
      try
      {
         const argv = yargs (args) .command ("x3d-tidy", "X3D converter and beautifier")
         .option ("input",
         {
            alias: "i",
            description: "Input filename",
            type: "string"
         })
         .option ("output",
         {
            alias: "o",
            description: "Output filename",
            type: "string"
         })
         .help ()
         .alias ("help", "h") .argv;

         const
            Browser = X3D .createBrowser () .browser,
            input   = path .resolve (process .cwd (), argv .input)

         await Browser .loadURL (new X3D .MFString (input))

         if (argv .output)
         {
            const output = path .resolve (process .cwd (), argv .output)

            fs .writeFileSync (output, getContents (Browser .currentScene, path .extname (output)))
         }
         else
         {
            process .stdout .write (getContents (Browser .currentScene, path .extname (input)))
         }

         electron .ipcRenderer .send ("ready")
      }
      catch (error)
      {
         electron .ipcRenderer .send ("error", error .message || error)
      }
   })
})

function getContents (scene, type)
{
   const zlib = require ("zlib")

   switch (type)
   {
      case ".x3d":
      default:
         return scene .toXMLString ()
      case ".x3dz":
         return zlib .gzipSync (scene .toXMLString ())
      case ".x3dv":
         return scene .toVRMLString ()
      case ".x3dvz":
         return zlib .gzipSync (scene .toVRMLString ())
      case ".x3dj":
         return scene .toJSONString ()
      case ".x3djz":
         return zlib .gzipSync (scene .toJSONString ())
   }
}
