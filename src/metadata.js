"use strict"

const
   X3D      = require ("x_ite"),
   Traverse = require ("./traverse")

module .exports = function metadata (scene)
{
   Traverse .traverse (scene, Traverse .PROTO_DECLARATIONS | Traverse .PROTO_DECLARATION_BODY | Traverse .ROOT_NODES, (node) =>
   {
      if (node .getType () .includes (X3D .X3DConstants .X3DNode))
         node .getField ("metadata") .setValue (null);
   })
}
