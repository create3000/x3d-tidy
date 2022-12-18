#!/usr/bin/env node
const path = require ("path")
const { execFile } = require ("child_process")

execFile ("electron", [path .resolve (__dirname, ".."), ... process .argv], (error, stdout, stderr) =>
{
   if (error)
   {
      process .stderr .write (error .message);
      return;
   }

   if (stderr)
      process .stderr .write (stderr);

   process .stdout .write (stdout);
});
