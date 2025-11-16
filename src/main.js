"use strict";

const
   X3D         = require ("x_ite-node"),
   pkg         = require ("../package.json"),
   infer       = require ("./infer"),
   metadata    = require ("./metadata"),
   yargs       = require ("yargs"),
   { hideBin } = require ("yargs/helpers"),
   url         = require ("url"),
   path        = require ("path"),
   fs          = require ("fs"),
   zlib        = require ("zlib"),
   colors      = require ("colors"),
   DEBUG       = false;

main ();

async function main ()
{
   try
   {
      await convert ();

      process .exit ();
   }
   catch (error)
   {
      console .error (colors .red (error .message || error));
      process .exit (1);
   }
}

async function convert ()
{
   const args = yargs (hideBin (process .argv))
   .scriptName ("x3d-tidy")
   .usage ("$0 [options] input-file output-file [input-file output-file ...]")
   .wrap (yargs () .terminalWidth ())
   .command ("X3D converter, beautifier and minimizer")
   .version (pkg .version)
   .alias ("v", "version")
   .fail ((msg, error, yargs) =>
   {
      console .error (colors .red (msg));
      process .exit (1);
   })
   .option ("double",
   {
      type: "number",
      alias: "d",
      description: "Set double precision, default is 15.",
      array: true,
      default: [15],
      requiresArg: true,
   })
   .option ("extension",
   {
      type: "string",
      alias: "e",
      description: `Set output file extension(s), e.g. ".x3dv" or ".tidy.x3d". The output file will have the same basename as the input file.`,
      array: true,
      requiresArg: true,
      implies: "input",
      conflicts: "output",
   })
   .option ("float",
   {
      type: "number",
      alias: "f",
      description: "Set float precision, default is 7.",
      array: true,
      default: [7],
      requiresArg: true,
   })
   .option ("log",
   {
      type: "boolean",
      alias: "l",
      description: `Log output filenames to stdout.`,
      implies: "input",
   })
   .option ("infer",
   {
      type: "boolean",
      alias: "r",
      description: "If set, infer profile and components from used nodes.",
      array: true,
      default: [false],
   })
   .option ("input",
   {
      type: "string",
      alias: "i",
      description: "Set input file(s). If there are less input files than output files, the last input file is used for the remaining output files.",
      array: true,
      requiresArg: true,
      demandOption: true,
   })
   .option ("metadata",
   {
      type: "boolean",
      alias: "m",
      description: "If set, remove metadata nodes.",
      array: true,
      default: [false],
   })
   .option ("output",
   {
      type: "string",
      alias: "o",
      description: `Set output file(s). To output it to stdout use only the extension, e.g. ".x3dv".`,
      array: true,
      requiresArg: true,
      implies: "input",
      conflicts: "extension",
   })
   .option ("style",
   {
      type: "string",
      alias: "s",
      description: `Set output style, default is "TIDY". "TIDY" results in a good readable file, but with larger size, whereas "CLEAN" result in the smallest size possible by removing all redundant whitespaces. The other values are somewhere in between.`,
      choices: ["TIDY", "COMPACT", "SMALL", "CLEAN"],
      array: true,
      requiresArg: true,
      default: ["TIDY"],
   })
   .check (args =>
   {
      if (!args .output && !args .extension)
         throw new Error ("Missing argument output or extension.");

      return true;
   })
   .example ([
      [
         "npx x3d-tidy -i file.x3d -o file.x3dv",
         "Convert an XML encoded file to a VRML encoded file."
      ],
      [
         "npx x3d-tidy -s CLEAN -i file.x3d -o file.x3dv file.x3dj",
         "Convert an XML encoded file to a VRML encoded file and a JSON encoded file with smallest size possible by removing redundant whitespaces"
      ],
   ])
   .help ()
   .alias ("help", "h") .argv;

   // Fixes an issue with URL, if it matches a drive letter.
   args .input = args .input .map (input => input .replace (/^([A-Za-z]:)/, "file://$1"));

   const
      browser = X3D .createBrowser () .browser,
      scenes  = new Map ();

   browser .setBrowserOption ("PrimitiveQuality", "HIGH");
   browser .setBrowserOption ("TextureQuality",   "HIGH");
   browser .setBrowserOption ("LoadUrlObjects",   false);
   browser .setBrowserOption ("Mute",             true);
   browser .endUpdate ();

   await browser .loadComponents (browser .getProfile ("Full"));

   const argc = Math .max (args .input .length, args .output ?.length ?? args .extension ?.length);

   for (let i = 0; i < argc; ++ i)
   {
      // Create input filename.

      const input = new URL (arg (args .input, i), url .pathToFileURL (path .join (process .cwd (), "/")));

      // Create output filename.

      let output;

      if (args .output)
      {
         output = path .resolve (process .cwd (), arg (args .output, i));
      }
      else if (args .extension)
      {
         const
            filename  = url .fileURLToPath (input),
            extension = arg (args .extension, i);

         output = `${filename .slice (0, -path. extname (filename) .length)}${extension}`;
      }

      if (args .log)
         console .log (output);

      // Load scene.

      const
         scene     = scenes .get (input .href) ?? await browser .createX3DFromURL (new X3D .MFString (input)),
         generator = scene .getMetaData ("generator") ?.filter (value => !value .startsWith (pkg .name)) ?? [ ];

      scenes .set (input .href, scene);
      generator .unshift (`${pkg .name} V${pkg .version}, ${pkg .homepage}`);

      scene .setMetaData ("generator", generator);
      scene .setMetaData ("modified", new Date () .toUTCString ());

      // Output scene.

      if (arg (args .infer, i))
         infer (scene);

      if (arg (args .metadata, i))
         metadata (scene);

      const options =
      {
         scene: scene,
         style: arg (args .style, i),
         precision: arg (args .float, i),
         doublePrecision: arg (args .double, i),
      };

      if (path .extname (output))
         fs .writeFileSync (output, getContents ({ ... options, type: path .extname (output) }));
      else
         console .log (getContents ({ ... options, type: path .basename (output) }));
   }

   scenes .forEach (scene => scene .dispose ());
   browser .dispose ();
}

function arg (arg, i)
{
   return arg [i] ?? arg .at (-1);
}

function getContents ({ scene, type, style, precision, doublePrecision })
{
   switch (type .toLowerCase ())
   {
      default:
      case ".x3d":
         return scene .toXMLString ({ style: style || "TIDY", precision, doublePrecision });
      case ".x3dz":
         return zlib .gzipSync (scene .toXMLString ({ style: style || "CLEAN", precision, doublePrecision }));
      case ".x3dv":
         return scene .toVRMLString ({ style: style || "TIDY", precision, doublePrecision });
      case ".x3dvz":
         return zlib .gzipSync (scene .toVRMLString ({ style: style || "CLEAN", precision, doublePrecision }));
      case ".x3dj":
         return scene .toJSONString ({ style: style || "TIDY", precision, doublePrecision });
      case ".x3djz":
         return zlib .gzipSync (scene .toJSONString ({ style: style || "CLEAN", precision, doublePrecision }));
      case ".html":
         return getHTML (scene);
   }
}

function getHTML (scene)
{
   return /* html */ `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <script defer src="https://cdn.jsdelivr.net/npm/x_ite@latest/dist/x_ite.min.js"></script>
    <style>
body {
  display: flex;
  flex-direction: column;
  margin: 0px;
  padding: 0px;
  height: 100vh;
  background-color: rgb(27, 27, 30);
  color: rgb(175, 176, 177);
  font-family: sans-serif;
}

body > * {
  flex: 0 0 auto;
  padding: 0px 1rem;
}

x3d-canvas {
  flex: 1 1 auto;
  padding: 0px;
  width: 100%;
  height: 100%;
}

a {
  color: rgb(82, 108, 150);
}

a:hover {
  color: rgb(210, 96, 58)
}
    </style>
  </head>
  <body>
    <h1>${path .basename (new URL (scene .worldURL) .pathname)}</h1>
    <x3d-canvas>
${scene .toXMLString ({ html: true, indent: " " .repeat (6) }) .trimEnd ()}
    </x3d-canvas>
    <p>Made with <a href="https://www.npmjs.com/package/x3d-tidy" target="_blank">x3d-tidy.</a></p>
  </body>
</html>`;
}
