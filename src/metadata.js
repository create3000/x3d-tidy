"use strict";

const
   X3D      = require ("x_ite"),
   Traverse = require ("x3d-traverse") (X3D);

module .exports = function metadata (scene)
{
   for (const node of scene .traverse (Traverse .PROTO_DECLARATIONS | Traverse .PROTO_DECLARATION_BODY | Traverse .ROOT_NODES))
   {
      if (!(node instanceof X3D .SFNode))
         continue;

      // Handle externproto not loaded case.
      if (!node .metadata)
         continue;

      node .metadata = null;
   }
};
