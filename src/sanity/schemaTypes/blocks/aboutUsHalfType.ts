import { defineField, defineType } from 'sanity'
import { BlockContentIcon } from '@sanity/icons'

export const aboutUsHalfType = defineType({
  name: 'aboutUsHalf',
  type: 'object',
  title: 'About Us Half',
  icon: BlockContentIcon,
  fields: [
    defineField({
      name: 'headlineTop',
      type: 'string',
      title: 'Headline Top',
      initialValue: 'In 2026, innovation is no longer a choice',
    }),
    defineField({
      name: 'headlineBottom',
      type: 'string',
      title: 'Headline Bottom',
      initialValue: "it's a necessity.",
    }),
    defineField({
      name: 'bodyText',
      type: 'text',
      title: 'Body Text',
      initialValue: "As a multidisciplinary team of artists and business owners, we provide what is needed to lead in today's digital landscape.",
    }),
    defineField({
      name: 'founderRole',
      type: 'string',
      title: 'Founder Role',
    }),
    defineField({
      name: 'stat1',
      type: 'object',
      title: 'Statistic 1',
      fields: [
        defineField({ name: 'number', type: 'number', title: 'Number', initialValue: 9 }),
        defineField({ name: 'unit', type: 'string', title: 'Unit', initialValue: '+' }),
        defineField({ name: 'label', type: 'string', title: 'Label' }),
        defineField({ name: 'description', type: 'text', title: 'Description' }),
      ],
    }),
    defineField({
      name: 'stat2',
      type: 'object',
      title: 'Statistic 2',
      fields: [
        defineField({ name: 'number', type: 'number', title: 'Number', initialValue: 7 }),
        defineField({ name: 'unit', type: 'string', title: 'Unit', initialValue: '+' }),
        defineField({ name: 'label', type: 'string', title: 'Label', initialValue: 'Countries' }),
        defineField({ name: 'description', type: 'text', title: 'Description', initialValue: 'A multilingual team serving clients across 4 continents.' }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'headlineTop',
    },
    prepare({ title }) {
      return {
        title: title || 'About Us Half',
        subtitle: 'About Us Section',
        media: BlockContentIcon,
      }
    },
  },
})
