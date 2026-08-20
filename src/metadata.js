"use strict";

const
   X3D      = require ("x_ite-node"),
   Traverse = require ("x3d-traverse");

module .exports = function metadata (scene)
{
   scene .rootNodes = scene .rootNodes .filter (node => !node .getNodeType () .includes (X3D .X3DConstants .X3DMetadataObject));

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
