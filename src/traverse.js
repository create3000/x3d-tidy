"use strict"

const X3D = require ("x_ite")

let flags = 1

module .exports = class Traverse
{
   static EXTERNPROTO_DECLARATIONS      = flags <<= 1
   static PROTO_DECLARATIONS            = flags <<= 1
   static ROOT_NODES                    = flags <<= 1
   static IMPORTED_NODES                = flags <<= 1
   static EXTERNPROTO_DECLARATION_SCENE = flags <<= 1
   static PROTO_DECLARATION_BODY        = flags <<= 1
   static PROTOTYPE_INSTANCES           = flags <<= 1
   static INLINE_SCENE                  = flags <<= 1

   /**
    *
    * @param {X3DScene|X3DExecutionContext|MFNode|Array<SFNode>|SFNode} object
    * @param {number} flags
    * @param {Function} callback
    * @returns boolean
    */
   static traverse (object, flags, callback)
   {
      const seen = new Set ()

      if (object instanceof X3D .X3DExecutionContext)
         return this .traverseScene (object, flags, callback, seen)

      if (object instanceof X3D .MFNode || Array .isArray (object))
         return this .traverseNodes (object, flags, callback, seen)

      if (object instanceof X3D .SFNode)
         return this .traverseNode (object .getValue (), flags, callback, seen)

      if (object instanceof X3D .X3DBaseNode)
         return this .traverseNode (object, flags, callback, seen)

      return false
   }

   static traverseScene (executionContext, flags, callback, seen)
   {
      if (! executionContext)
         return true

      if (flags & Traverse .PROTO_DECLARATIONS)
      {
         for (const proto of executionContext .protos)
         {
            if (this .traverseNode (proto, flags, callback, seen) === false)
               return false
         }
      }

      if (flags & Traverse .ROOT_NODES)
      {
         if (this .traverseNodes (executionContext .rootNodes, flags, callback, seen) === false)
            return false
      }

      return callback (executionContext) !== false
   }

   static traverseNodes (nodes, flags, callback, seen)
   {
      for (const node of nodes)
      {
         if (this .traverseNode (node instanceof X3D .SFNode ? node .getValue () : node, flags, callback, seen) === false)
            return false
      }

      return true
   }

   static traverseNode (node, flags, callback, seen)
   {
      if (!node)
         return true

      if (seen .has (node))
         return true

      seen .add (node)

      for (const field of [... node .getUserDefinedFields (), ... node .getPredefinedFields ()])
      {
         switch (field .getType ())
         {
            case X3D .X3DConstants .SFNode:
            {
               if (this .traverseNode (field .getValue (), flags, callback, seen) === false)
                  return false

               break
            }
            case X3D .X3DConstants .MFNode:
            {
               if (this .traverseNodes (field, flags, callback, seen) === false)
                  return false

               break
            }
         }
      }

      const type = node .getType ()

      for (let t = type .length - 1; t >= 0; -- t)
      {
         switch (type [t])
         {
            case X3D .X3DConstants .X3DProtoDeclaration:
            {
               if (flags & Traverse .PROTO_DECLARATION_BODY)
               {
                  if (this .traverseScene (node .getBody (), flags, callback, seen) === false)
                     return false
               }

               break
            }
            case X3D .X3DConstants .X3DPrototypeInstance:
            {
               if (flags & Traverse .PROTOTYPE_INSTANCES)
               {
                  if (this .traverseScene (node .getBody (), flags, callback, seen) === false)
                     return false
               }

               break
            }
            default:
            {
               continue
            }
         }

         break
      }

      return callback (node) !== false
   }
}
