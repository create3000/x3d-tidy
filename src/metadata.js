"use strict"

const Traverse = require ("./traverse")

module .exports = function metadata (scene)
{
   Traverse .traverse (scene, Traverse .PROTO_DECLARATIONS | Traverse .PROTO_DECLARATION_BODY | Traverse .ROOT_NODES, (node) =>
   {
      node ._metadata = null;
   })
}
