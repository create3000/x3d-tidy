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
      console .error (error .message || error);
      process .exit (1);
   }
}

async function convert ()
{
   const args = yargs (hideBin (process .argv))
   .scriptName ("x3d-tidy")
   .usage ("$0 [options] input-file output-file [input-file output-file ...]")
   .wrap (yargs .terminalWidth ())
   .command ("X3D converter, beautifier and minimizer")
   .version (pkg .version)
   .alias ("v", "version")
   .fail ((msg, error, yargs) =>
   {
      console .error (msg);
      process .exit (1);
   })
   .option ("input",
   {
      type: "string",
      alias: "i",
      description: "Set input file(s). If there are less input files than output files, the last input file is used for the remaining output files.",
      array: true,
      default: [ ],
      implies: "output",
   })
   .option ("output",
   {
      type: "string",
      alias: "o",
      description: `Set output file(s). To output it to stdout use only the extension, e.g. ".x3dv".`,
      array: true,
      default: [ ],
      implies: "input",
   })
   .option ("style",
   {
      type: "string",
      alias: "s",
      description: `Set output style, default is "TIDY". "TIDY" results in a good readable file, but with larger size, whereas "CLEAN" result in the smallest size possible. The other values are somewhere in between.`,
      choices: ["TIDY", "COMPACT", "SMALL", "CLEAN"],
      array: true,
      default: ["TIDY"],
   })
   .option ("double",
   {
      type: "number",
      alias: "d",
      description: "Set double precision, default is 15.",
      array: true,
      default: [15],
   })
   .option ("float",
   {
      type: "number",
      alias: "f",
      description: "Set float precision, default is 7.",
      array: true,
      default: [7],
   })
   .option ("infer",
   {
      type: "boolean",
      alias: "r",
      description: "If set, infer profile and components from used nodes.",
      array: true,
      default: [false],
   })
   .option ("metadata",
   {
      type: "boolean",
      alias: "m",
      description: "If set, remove metadata nodes.",
      array: true,
      default: [false],
   })
   .example ([
      [
         "npx x3d-tidy -i file.x3d -o file.x3dv",
         "Convert an XML encoded file into a VRML encoded file."
      ],
      [
         "npx x3d-tidy -i file.x3d -o file.x3dv file.x3dj",
         "Convert an XML encoded file into a VRML encoded file and a JSON encoded file."
      ],
   ])
   .help ()
   .alias ("help", "h") .argv;

   // Fixes an issue with URL, if it matches a drive letter.
   args .input = args .input .map (input => input .replace (/^([A-Za-z]:)/, "file://$1"));

   const
      browser = X3D .createBrowser () .browser,
      scenes  = new Map ();

   browser .endUpdate ();
   browser .setBrowserOption ("LoadUrlObjects",   false);
   browser .setBrowserOption ("PrimitiveQuality", "HIGH");
   browser .setBrowserOption ("TextureQuality",   "HIGH");

   await browser .loadComponents (browser .getProfile ("Full"));

   for (const i of args .output .keys ())
   {
      const
         input     = new URL (arg (args .input, i), url .pathToFileURL (path .join (process .cwd (), "/"))),
         scene     = scenes .get (input .href) ?? await browser .createX3DFromURL (new X3D .MFString (input)),
         generator = scene .getMetaData ("generator") ?.filter (value => !value .startsWith (pkg .name)) ?? [ ];

      scenes .set (input .href, scene);
      generator .push (`${pkg .name} V${pkg .version}, ${pkg .homepage}`);

      scene .setMetaData ("generator", generator);
      scene .setMetaData ("modified", new Date () .toUTCString ());

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

      const output = path .resolve (process .cwd (), args .output [i]);

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
    <script src="https://cdn.jsdelivr.net/npm/x_ite@latest/dist/x_ite.min.js"></script>
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
    <h1>${path .basename (new URL (scene .worldURL) .pathname)}</h1>
    <x3d-canvas>
${scene .toXMLString ({ html: true, indent: " " .repeat (6) }) .trimEnd ()}
    </x3d-canvas>
    <p>Made with <a href="https://www.npmjs.com/package/x3d-tidy" target="_blank">x3d-tidy.</a></p>
  </body>
</html>`;
}
