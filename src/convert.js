"use strict"

const
   X3D      = require ("x_ite"),
   infer    = require ("./infer"),
   pkg      = require ("../package.json"),
   metadata = require ("./metadata"),
   electron = require ("electron"),
   yargs    = require ("yargs"),
   path     = require ("path"),
   fs       = require ("fs"),
   zlib     = require ("zlib"),
   DEBUG    = false

// DEBUG: npm start -- --version` to reset cache.

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
   console .log   = output .bind (null, process .stdout)
   console .warn  = output .bind (null, process .stdout)
   console .error = output .bind (null, process .stderr)

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
      description: "Set input file.",
      demandOption: true,
   })
   .option ("output",
   {
      type: "string",
      alias: "o",
      description: "Set output filen.",
   })
   .option ("style",
   {
      type: "string",
      alias: "s",
      description: "Set output style, default is \"TIDY\".",
      choices: ["CLEAN", "SMALL", "COMPACT", "TIDY"],
   })
   .option ("double",
   {
      type: "number",
      alias: "d",
      description: "Set double precision, default is 15.",
   })
   .option ("float",
   {
      type: "number",
      alias: "f",
      description: "Set float precision, default is 7.",
   })
   .option ("infer",
   {
      type: "boolean",
      alias: "r",
      description: "If set, infer profile and components from used nodes.",
   })
   .option ("metadata",
   {
      type: "boolean",
      alias: "m",
      description: "If set, remove metadata.",
   })
   .help ()
   .alias ("help", "h") .argv;

   if (!DEBUG)
   {
      console .log   = Function .prototype
      console .warn  = Function .prototype
      console .error = Function .prototype
   }

   const
      Browser = X3D .createBrowser () .browser,
      input   = path .resolve (process .cwd (), args .input)

   Browser .endUpdate ()

   await Browser .loadURL (new X3D .MFString (input))

   Browser .currentScene .setMetaData ("converter", `${pkg .name} V${pkg .version}, ${pkg .homepage}`)
   Browser .currentScene .setMetaData ("converted", new Date () .toUTCString ())

   if (args .infer)
      infer (Browser .currentScene)

   if (args .metadata)
      metadata (Browser .currentScene)

   const options =
   {
      scene: Browser .currentScene,
      style: args .style,
      precision: args .float,
      doublePrecision: args .double,
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

function getContents ({ scene, type, style, precision, doublePrecision })
{
   switch (type)
   {
      default:
      case ".x3d":
         return scene .toXMLString ({ style: style || "TIDY", precision: precision, doublePrecision: doublePrecision })
      case ".x3dz":
         return zlib .gzipSync (scene .toXMLString ({ style: style || "CLEAN", precision: precision, doublePrecision: doublePrecision }))
      case ".x3dv":
         return scene .toVRMLString ({ style: style || "TIDY", precision: precision, doublePrecision: doublePrecision })
      case ".x3dvz":
         return zlib .gzipSync (scene .toVRMLString ({ style: style || "CLEAN", precision: precision, doublePrecision: doublePrecision }))
      case ".x3dj":
         return scene .toJSONString ({ style: style || "TIDY", precision: precision, doublePrecision: doublePrecision })
      case ".x3djz":
         return zlib .gzipSync (scene .toJSONString ({ style: style || "CLEAN", precision: precision, doublePrecision: doublePrecision }))
   }
}

function output (stdout, ... args)
{
   stdout .write (args .join (" ") + "\n")
}
