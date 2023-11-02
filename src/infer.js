"use strict"

const
   X3D      = require ("x_ite"),
   Traverse = require ("./traverse")

module .exports = function inferProfileAndComponents (scene)
{
   const
      browser              = scene .getBrowser (),
      usedComponents       = getUsedComponents (scene),
      profileAndComponents = getProfileAndComponentsFromUsedComponents (browser, usedComponents)

   setProfile    (scene, profileAndComponents .profile)
   setComponents (scene, profileAndComponents .components)
}

function getUsedComponents (scene)
{
   const components = new Set ()

   Traverse .traverse (scene, Traverse .PROTO_DECLARATIONS | Traverse .PROTO_DECLARATION_BODY | Traverse .ROOT_NODES | Traverse .PROTOTYPE_INSTANCES, (node) =>
   {
      if (!node .getType () .includes (X3D .X3DConstants .X3DNode))
         return

      if (node .getScene () !== scene)
         return

      components .add (node .getComponentInfo () .name)
   })

   return components
}

function getProfileAndComponentsFromUsedComponents (browser, usedComponents)
{
   const profiles = ["Interactive", "Interchange", "Immersive"] .map (name =>
   {
      return { profile: browser .getProfile (name), components: new Set (usedComponents) }
   })

   profiles .forEach (object =>
   {
      for (const component of object .profile .components)
         object .components .delete (component .name)
   })

   const min = profiles .reduce ((min, object) =>
   {
      const count = object .profile .components .length + object .components .size

      return min .count < count ? min : {
         count: count,
         object: object,
      }
   },
   { count: Number .POSITIVE_INFINITY })

   return {
      profile: min .object .profile,
      components: Array .from (min .object .components) .sort () .map (name => browser .getSupportedComponents () .get (name)),
   }
}

function setProfile (scene, profile)
{
   scene .setProfile (profile)
}

function setComponents (scene, components)
{
   const oldComponents = Array .from (scene .getComponents ())

   for (const component of oldComponents)
      scene .removeComponent (component .name)

   for (const component of components)
      scene .addComponent (component)
}
