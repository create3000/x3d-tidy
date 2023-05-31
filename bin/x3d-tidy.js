#!/usr/bin/env node
"use strict"

const path = require ("path")
const { execFile } = require ("child_process")

execFile ("electron", [path .resolve (__dirname, ".."), ... process .argv], (error, stdout, stderr) =>
{
   if (error)
      return process .stderr .write (error .message)

   if (stdout)
      process .stdout .write (stdout)

   if (stderr)
      process .stderr .write (stderr)
})
