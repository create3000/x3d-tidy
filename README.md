# x3d-tidy

X3D converter, beautifier and minimizer

## Installation

```sh
$ npm i x3d-tidy
```

## Synopsis

**npx x3d-tidy** \[options\]

## Options

**x3d-tidy** interprets the following options when it is invoked:

### -i file

Set input file.

### -o file

Set output file.

### -s [**TIDY**, COMPACT, SMALL, CLEAN]

Set output style, default is "TIDY".

### -d

Set double precision, default is 15.

### -f

Set float precision, default is 7.

### -r

If set, infer profile and components from used nodes.

### -m

If set, remove metadata.

### Supported Input File Types

| X3D Encoding | File Extension | MIME Type      |
|--------------|----------------|----------------|
| XML          | .x3d, .x3dz    | model/x3d+xml  |
| JSON         | .x3dj, .x3djz  | model/x3d+json |
| Classic VRML | .x3dv, .x3dvz  | model/x3d+vrml |
| VRML         | .wrl, .wrz     | model/vrml     |

### Supported Output File Types

| X3D Encoding | File Extension | MIME Type      |
|--------------|----------------|----------------|
| XML          | .x3d, .x3dz    | model/x3d+xml  |
| JSON         | .x3dj, .x3djz  | model/x3d+json |
| Classic VRML | .x3dv, .x3dvz  | model/x3d+vrml |

## Examples

Convert an XML encoded file into a VRML encoded file.

```sh
$ npx x3d-tidy -i file.x3d -o file.x3dv
```
