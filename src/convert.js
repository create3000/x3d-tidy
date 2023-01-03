"use strict"

const
   X3D      = require ("x_ite"),
   infer    = require ("./infer"),
   metadata = require ("./metadata"),
   electron = require ("electron"),
   yargs    = require ("yargs"),
   path     = require ("path"),
   fs       = require ("fs"),
   zlib     = require ("zlib")

process .exit = (status) => electron .ipcRenderer .send (status ? "error" : "ready", "")

electron .ipcRenderer .on ("convert", async (event, argv) => main (argv))

async function main (argv)
{
   try
   {
      await convert (argv)

      electron .ipcRenderer .send ("ready")
   }
   catch (error)
   {
      electron .ipcRenderer .send ("error", error .message || error)
   }
}

async function convert (argv)
{
   console .log   = (s = "") => process .stdout .write (s + "\n")
   console .warn  = (s = "") => process .stdout .write (s + "\n")
   console .error = (s = "") => process .stderr .write (s + "\n")

   const args = yargs (argv)
   .scriptName ("x3d-tidy")
   .usage ("$0 args")
   .command ("x3d-tidy", "X3D converter, beautifier and minimizer")
   .fail ((msg, error, yargs) =>
   {
      process .stderr .write (msg)
      process .exit (1)
   })
   .option ("input",
   {
      type: "string",
      alias: "i",
      description: "Set input filename.",
      demandOption: true,
   })
   .option ("output",
   {
      type: "string",
      alias: "o",
      description: "Set output filename.",
   })
   .option ("style",
   {
      type: "string",
      alias: "s",
      description: "Set output style.",
      choices: ["CLEAN", "SMALL", "COMPACT", "TIDY"],
   })
   .option ("infer",
   {
      type: "boolean",
      alias: "f",
      description: "Infer profile and components from used nodes.",
   })
   .option ("metadata",
   {
      type: "boolean",
      alias: "m",
      description: "If set, remove metadata.",
   })
   .help ()
   .alias ("help", "h") .argv;

   console .log   = Function .prototype
   console .warn  = Function .prototype
   console .error = Function .prototype

   const
      Browser = X3D .createBrowser () .browser,
      input   = path .resolve (process .cwd (), args .input)

   Browser .endUpdate ()

   await Browser .loadURL (new X3D .MFString (input))

   if (args .infer)
      infer (Browser .currentScene)

   if (args .metadata)
      metadata (Browser .currentScene)

   const options =
   {
      scene: Browser .currentScene,
      style: args .style,
   }

   if (args .output)
   {
      const output = path .resolve (process .cwd (), args .output)

      if (path .extname (output))
         fs .writeFileSync (output, getContents ({ ...options, type: path .extname (output) }))
      else
         process .stdout .write (getContents ({ ...options, type: path .basename (output) }))
   }
   else
   {
      process .stdout .write (getContents ({ ...options, type: path .extname (input) }))
   }
}

function getContents ({ scene, type, style })
{
   switch (type)
   {
      default:
      case ".x3d":
         return scene .toXMLString ({ style: style || "TIDY" })
      case ".x3dz":
         return zlib .gzipSync (scene .toXMLString ({ style: style || "CLEAN" }))
      case ".x3dv":
         return scene .toVRMLString ({ style: style || "TIDY" })
      case ".x3dvz":
         return zlib .gzipSync (scene .toVRMLString ({ style: style || "CLEAN" }))
      case ".x3dj":
         return scene .toJSONString ({ style: style || "TIDY" })
      case ".x3djz":
         return zlib .gzipSync (scene .toJSONString ({ style: style || "CLEAN" }))
   }
}
