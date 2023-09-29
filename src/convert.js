"use strict"

const
   X3D      = require ("x_ite"),
   pkg      = require ("../package.json"),
   infer    = require ("./infer"),
   metadata = require ("./metadata"),
   electron = require ("electron"),
   yargs    = require ("yargs"),
   url      = require ("url"),
   path     = require ("path"),
   fs       = require ("fs"),
   zlib     = require ("zlib"),
   DEBUG    = false

// Redirect console messages.

process .exit  = (code)  => electron .ipcRenderer .send ("exit", code)
console .log   = (... messages) => electron .ipcRenderer .send ("log",   messages)
console .warn  = (... messages) => electron .ipcRenderer .send ("warn",  messages)
console .error = (... messages) => electron .ipcRenderer .send ("error", messages)

electron .ipcRenderer .on ("main", async (event, argv) => main (argv))

async function main (argv)
{
   try
   {
      await convert (argv)

      process .exit ()
   }
   catch (error)
   {
      console .error (error .message || error)
      process .exit (1)
   }
}

async function convert (argv)
{
   const args = yargs (argv)
   .scriptName ("x3d-tidy")
   .usage ("$0 args")
   .command ("x3d-tidy", "X3D converter, beautifier and minimizer")
   .version (pkg .version)
   .alias ("v", "version")
   .fail ((msg, error, yargs) =>
   {
      console .error (msg)
      process .exit (1)
   })
   .option ("cwd",
   {
      type: "string",
   })
   .hide ("cwd")
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
      description: "Set output file. To output it to stdout use only the extension, e.g. '.x3dv'.",
      demandOption: true,
   })
   .option ("style",
   {
      type: "string",
      alias: "s",
      description: "Set output style, default is 'TIDY'.",
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
      description: "If set, remove metadata nodes.",
   })
   .help ()
   .alias ("help", "h") .argv

   if (args .help)
      return

   const
      Browser = X3D .createBrowser () .browser,
      input   = path .resolve (args .cwd, args .input)

   Browser .endUpdate ()
   Browser .setBrowserOption ("LoadUrlObjects",   false);
   Browser .setBrowserOption ("PrimitiveQuality", "HIGH")
   Browser .setBrowserOption ("TextureQuality",   "HIGH")

   await Browser .loadComponents (Browser .getProfile ("Full"))
   await Browser .loadURL (new X3D .MFString (input))

   Browser .currentScene .setMetaData ("generator", `${pkg .name} V${pkg .version}, ${pkg .homepage}`)
   Browser .currentScene .setMetaData ("modified", new Date () .toUTCString ())

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
      const output = path .resolve (args .cwd, args .output)

      if (path .extname (output))
         fs .writeFileSync (output, getContents ({ ... options, type: path .extname (output) }))
      else
         console .log (getContents ({ ... options, type: path .basename (output) }))
   }
   else
   {
      console .log (getContents ({ ... options, type: path .extname (input) }))
   }
}

function getContents ({ scene, type, style, precision, doublePrecision })
{
   switch (type .toLowerCase ())
   {
      default:
      case ".x3d":
         return scene .toXMLString ({ style: style || "TIDY", precision, doublePrecision })
      case ".x3dz":
         return zlib .gzipSync (scene .toXMLString ({ style: style || "CLEAN", precision, doublePrecision }))
      case ".x3dv":
         return scene .toVRMLString ({ style: style || "TIDY", precision, doublePrecision })
      case ".x3dvz":
         return zlib .gzipSync (scene .toVRMLString ({ style: style || "CLEAN", precision, doublePrecision }))
      case ".x3dj":
         return scene .toJSONString ({ style: style || "TIDY", precision, doublePrecision })
      case ".x3djz":
         return zlib .gzipSync (scene .toJSONString ({ style: style || "CLEAN", precision, doublePrecision }))
      case ".html":
         return getHTML (scene)
   }
}

function getHTML (scene)
{
   return /* html */ `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script src="https://create3000.github.io/code/x_ite/latest/x_ite.min.js"></script>
    <style>
body {
  background-color: rgb(21, 22, 24);
  color: rgb(108, 110, 113);
}

a {
  color: rgb(106, 140, 191);
}

x3d-canvas {
  width: 768px;
  height: 432px;
}
    </style>
  </head>
  <body>
    <h1>${path .basename (url .fileURLToPath (scene .worldURL))}</h1>
    <x3d-canvas>
${scene .toXMLString ({ html: true, indent: " " .repeat (6) }) .trimEnd ()}
    </x3d-canvas>
    <p>Made with <a href="https://www.npmjs.com/package/x3d-tidy" target="_blank">x3d-tidy.</a></p>
  </body>
</html>`
}
