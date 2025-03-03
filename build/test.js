#!/usr/bin/env node
"use strict";

const { systemSync } = require ("shell-tools");

systemSync (`npx . -i tests/assets/test.x3d -o tests/out/test.html -r`);
systemSync (`npx . -i tests/assets/test.x3d -o tests/out/test.x3d  -r -m`);
systemSync (`npx . -i "${__dirname}/../tests/assets/test.x3d" -o "${__dirname}/../tests/out/abs.x3d" -r -m`);
systemSync (`npx . -i tests/assets/Primitives.svg -o tests/out/Primitives.x3d`);
systemSync (`npx . -i https://create3000.github.io/media/examples/Geometry3D/IndexedFaceSet/IndexedFaceSet.x3d -o tests/out/https.html`);
systemSync (`npx . -i https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/master/Models/BoxTextured/glTF-Binary/BoxTextured.glb -o tests/out/BoxTextured.glb.x3d`);
systemSync (`npx . -i https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/master/Models/BoxTextured/glTF-Embedded/BoxTextured.gltf -o tests/out/BoxTextured.embedded.x3d`);

systemSync (`npx . -i tests/assets/test.x3d -o tests/out/test.o.x3d -o tests/out/test.o.x3dv -o tests/out/test.o.x3dj`);
systemSync (`npx . -i tests/assets/test.x3d -o tests/out/test.no.x3d -i tests/assets/test.x3d -o tests/out/test.no.x3dv -i tests/assets/test.x3d -o tests/out/test.no.x3dj`);
