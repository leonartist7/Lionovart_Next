import { defineField, defineType, defineArrayMember } from 'sanity'
import { BlockContentIcon } from '@sanity/icons'

export const heroTopType = defineType({
  name: 'heroTop',
  type: 'object',
  title: 'Hero Top',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'staticText',
      type: 'string',
      title: 'Static Text',
    }),
    defineField({
      name: 'cyclingWords',
      type: 'array',
      title: 'Cycling Words',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'subtitle',
      type: 'text',
      title: 'Subtitle',
    }),
    defineField({
      name: 'ctaStart',
      type: 'string',
      title: 'CTA Start Text',
    }),
    defineField({
      name: 'ctaStartOpening',
      type: 'string',
      title: 'CTA Start Opening Text (After Submit)',
    }),
    defineField({
      name: 'trustText',
      type: 'string',
      title: 'Trust Text',
    }),
    defineField({
      name: 'badges',
      type: 'object',
      title: 'Badges',
      fields: [
        defineField({
          name: 'brands',
          type: 'array',
          title: 'Brands Text (2 lines)',
          of: [defineArrayMember({ type: 'string' })],
          validation: (rule) => rule.length(2),
        }),
        defineField({
          name: 'experience',
          type: 'array',
          title: 'Experience Text (2 lines)',
          of: [defineArrayMember({ type: 'string' })],
          validation: (rule) => rule.length(2),
        }),
        defineField({
          name: 'countries',
          type: 'string',
          title: 'Countries Text',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'staticText',
      subtitle: 'subtitle',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Hero Top',
        subtitle: subtitle || 'Hero Section',
        media: BlockContentIcon,
      }
    },
  },
})
