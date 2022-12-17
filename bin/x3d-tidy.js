#!/usr/bin/env node
const { execFile } = require ("child_process")

execFile ("electron", [".", ... process .argv], (error, stdout, stderr) =>
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
