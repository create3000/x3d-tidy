"use strict";

const
   X3D      = require ("x_ite"),
   Traverse = require ("./traverse");

module .exports = function metadata (scene)
{
   Traverse .traverse (scene, Traverse .PROTO_DECLARATIONS | Traverse .PROTO_DECLARATION_BODY | Traverse .ROOT_NODES, (node) =>
   {
      if (!node .getType () .includes (X3D .X3DConstants .X3DNode))
         return;

      const metadata = node .getField ("metadata");

      // Handle externproto not loaded case.
      if (!metadata .getValue ())
         return;

      metadata .setValue (null);
   });
};
