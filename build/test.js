#!/usr/bin/env node
"use strict";

const { systemSync } = require ("shell-tools");

systemSync (`npx . -i tests/assets/test.x3d -o tests/out/test.html -r`);
systemSync (`npx . -i tests/assets/test.x3d -o tests/out/test.x3d  -r -m`);
systemSync (`npx . -i tests/assets/Primitives.svg -o tests/out/Primitives.x3d`);
systemSync (`npx . -i https://create3000.github.io/media/examples/Geometry3D/IndexedFaceSet/IndexedFaceSet.x3d -o tests/out/https.html`);
systemSync (`npx . -i /Volumes/Home/X3D/glTF/glTF-Sample-Assets/Models/BoxTextured/glTF-Embedded/BoxTextured.gltf -o tests/out/BoxTextured.embedded.x3d`);
systemSync (`npx . -i /Volumes/Home/X3D/glTF/glTF-Sample-Assets/Models/BoxTextured/glTF-Binary/BoxTextured.glb -o tests/out/BoxTextured.glb.x3d`);
