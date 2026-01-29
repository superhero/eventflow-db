import util from 'node:util'

export default class Serde
{
  transformers = new Map(
  [
    [
      'Date',
      {
        type          : Date,
        serializer    : (input) => input.toJSON(),
        deserializer  : (input) => new Date(input)
      }
    ],
    [
      'Error',
      {
        type          : Error,
        serializer    : (input) => 
        {
          const json = { name: input.name }

          Object.getOwnPropertyNames(input)
            .forEach((key) => json[key] = this.serialize(input[key]))

          return json
        },
        deserializer  : (input) => 
        {
          const error = new Error

          Object.getOwnPropertyNames(input)
            .forEach((key) => error[key] = this.deserialize(input[key]))

          return error
        }
      }
    ],
    [
      'Map',
      {
        type          : Map,
        serializer    : (input) => [...input.entries()].map(([key, value]) => [ this.serialize(key), this.serialize(value) ]),
        deserializer  : (input) => new Map(input.map(([key, value]) => [ this.deserialize(key), this.deserialize(value) ]))
      }
    ],
    [
      'Set',
      {
        type          : Set,
        serializer    : (input) => [...input.values()].map(value => this.serialize(value)),
        deserializer  : (input) => new Set(input.map(value => this.deserialize(value)))
      }
    ],
  ])

  constructor(typeAttribute = '$type', valueAttribute = '$value') 
  {
    this.typeAttribute  = typeAttribute
    this.valueAttribute = valueAttribute
  }

  serialize(input) 
  {
    for(const [key, { type, serializer }] of this.transformers)
    {
      if(input instanceof type)
      {
        return { [this.typeAttribute]  : key, 
                 [this.valueAttribute] : serializer(input) }
      }
    }

    if(Array.isArray(input))
    {
      return input.map(this.serialize.bind(this))
    }

    if('object' === typeof input && null !== input)
    {
      const serialized = {}
      for (const [key, value] of Object.entries(input))
      {
        serialized[key] = this.serialize(value)
      }
      return serialized
    }

    return input
  }

  deserialize(input) 
  {
    if(input)
    {
      for(const [key, { deserializer }] of this.transformers)
      {
        if(key === input[this.typeAttribute])
        {
          return deserializer(input[this.valueAttribute])
        }
      }

      if (Array.isArray(input))
      {
        return input.map(this.deserialize.bind(this))
      }

      if (typeof input === 'object') 
      {
        const deserialized = {}
        for (const [key, value] of Object.entries(input))
        {
          deserialized[key] = this.deserialize(value)
        }
        return deserialized
      }
    }

    return input
  }
}
