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

### -s [TIDY, COMPACT, SMALL, CLEAN]

Set output style.

### -f

Infer profile and components from used nodes.

### -m

If set, remove metadata.

## Examples

Convert an XML encoded file into a VRML encoded file.

```sh
$ npx x3d-tidy -i file.x3d -o file.x3dv
```
