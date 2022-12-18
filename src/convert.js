const
   X3D      = require ("x_ite"),
   electron = require ("electron"),
   yargs    = require ("yargs"),
   path     = require ("path"),
   fs       = require ("fs"),
   zlib     = require ("zlib")

process .exit  = (status) => electron .ipcRenderer .send (status ? "error" : "ready", "")
console .log   = (s = "") => process .stdout .write (s + "\n")
console .error = (s = "") => process .stderr .write (s + "\n")

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
   const args = yargs (argv) .command ("x3d-tidy", "X3D converter and beautifier")
   .fail ((msg, error, yargs) =>
   {
      process .stderr .write (msg)
      process .exit (1)
   })
   .option ("input",
   {
      alias: "i",
      description: "Input filename",
      type: "string",
      demandOption: true,
   })
   .option ("output",
   {
      alias: "o",
      description: "Output filename",
      type: "string",
   })
   .help ()
   .alias ("help", "h") .argv;

   const
      Browser = X3D .createBrowser () .browser,
      input   = path .resolve (process .cwd (), args .input)

   Browser .endUpdate ()

   await Browser .loadURL (new X3D .MFString (input))

   if (args .output)
   {
      const output = path .resolve (process .cwd (), args .output)

      if (path .extname (output))
         fs .writeFileSync (output, getContents (Browser .currentScene, path .extname (output)))
      else
         process .stdout .write (getContents (Browser .currentScene, path .basename (output)))
   }
   else
   {
      process .stdout .write (getContents (Browser .currentScene, path .extname (input)))
   }
}

function getContents (scene, type)
{
   switch (type)
   {
      default:
      case ".x3d":
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
