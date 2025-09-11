# x3d-tidy

[![NPM Version](https://img.shields.io/npm/v/x3d-tidy)](https://www.npmjs.com/package/x3d-tidy)
[![NPM Downloads](https://img.shields.io/npm/dm/x3d-tidy)](https://npmtrends.com/x3d-tidy)
[![DeepScan grade](https://deepscan.io/api/teams/23540/projects/26815/branches/855448/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=23540&pid=26815&bid=855448)

X3D converter, beautifier and minimizer

## Synopsis

You can run *x3d-tidy* without installing it using **npx**:

**npx x3d-tidy** \[options\] -i input-file -o output-file [-i input-file -o output-file ...]

## Overview

*x3d-tidy* is a command-line tool, based on [X_ITE](https://create3000.github.io/x_ite/), designed for processing X3D (Extensible 3D) files. It provides both conversion and data mining capabilities to enhance and streamline work with X3D content.

* Run *x3d-tidy* with `npx x3d-tidy ...` directly from npm without installing it.
* Format Conversion: Transforms X3D files between different encodings, such as XML, Classic VRML, and JSON.
* Syntax Cleanup: Ensures well-formed and standardized X3D output by fixing structural inconsistencies and formatting issues.
* Data Extraction: Mines relevant data from X3D scenes, allowing analysis and reuse of geometries, metadata, and structure.
* Validation & Optimization: Helps identify errors, redundant elements, and inefficiencies in X3D models.
* Command-line Usability: Easily integrates into automation workflows and scripts for batch processing.

This tool is particularly useful for developers, 3D artists, and researchers working with X3D-based applications, ensuring clean, efficient, and interoperable files.

## Options

**x3d-tidy** interprets the following options when it is invoked:

### -d *integer*

Set double precision, default is 15.

### -e *extension(s)* ...

Set output file extension(s), e.g. ".x3dv" or ".tidy.x3d". The output file will have the same basename as the input file. Use either "-e" or "-o".

### -f *integer*

Set float precision, default is 7.

### -l

Log output filenames to stdout.

### -h

Show help.

### -i *file(s)* ...

Set input file(s). This can be either a local file path or a URL. If there are less input files than output files, the last input file is used for the remaining output files.

### -m

If set, remove metadata nodes.

### -o *file(s)* ...

Set output file(s). To output it to stdout use only the extension, e.g. ".x3dv". Use either "-e" or "-o".

### -r

If set, infer profile and components from used nodes.

### -s *[**TIDY**, COMPACT, SMALL, CLEAN]*

Set output style, default is "TIDY". "TIDY" results in a good readable file, but with larger size, whereas "CLEAN" result in the smallest size possible by removing all redundant whitespaces. The other values are somewhere in between.

### -v

Show version.

## Supported Input File Types

| Encoding         | File Extension | MIME Type       |
|------------------|----------------|-----------------|
| X3D XML          | .x3d, .x3dz    | model/x3d+xml   |
| X3D JSON         | .x3dj, .x3djz  | model/x3d+json  |
| X3D Classic VRML | .x3dv, .x3dvz  | model/x3d+vrml  |
| VRML 2.0         | .wrl, .wrz     | model/vrml      |
| glTF             | .gltf, .glb    | model/gltf+json |
| Wavefront OBJ    | .obj           | model/obj       |
| STL              | .stl           | model/stl       |
| PLY              | .ply           | model/ply       |
| SVG Document     | .svg, .svgz    | image/svg+xml   |

## Supported Output File Types

| X3D Encoding | File Extension | MIME Type      |
|--------------|----------------|----------------|
| XML          | .x3d, .x3dz    | model/x3d+xml  |
| JSON         | .x3dj, .x3djz  | model/x3d+json |
| Classic VRML | .x3dv, .x3dvz  | model/x3d+vrml |
| HTML         | .html          | text/html      |

## Examples

Convert an XML encoded file to a VRML encoded file.

```sh
$ npx x3d-tidy -i file.x3d -o file.x3dv
```

Convert an XML encoded file to a VRML encoded file and a JSON encoded file with smallest size possible by removing redundant whitespaces.
```sh
$ npx x3d-tidy -s CLEAN -i file.x3d -o file.x3dv file.x3dj
```

## Online Converter

[Online X3D File Format Converter](https://create3000.github.io/x_ite/laboratory/x3d-file-converter) powered by [X_ITE](https://create3000.github.io/x_ite/).

## See Also

* [x3d-image](https://www.npmjs.com/package/x3d-image) — render image files from X3D
