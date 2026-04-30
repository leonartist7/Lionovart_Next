import { defineField, defineType, defineArrayMember } from 'sanity'
import { ThListIcon } from '@sanity/icons'

export const servicesType = defineType({
  name: 'services',
  type: 'object',
  title: 'Services Section',
  icon: ThListIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      type: 'string',
      title: 'Eyebrow Text',
      initialValue: 'OUR SERVICES',
    }),
    defineField({
      name: 'heading',
      type: 'string',
      title: 'Heading',
      initialValue: 'What We',
    }),
    defineField({
      name: 'headingAccent',
      type: 'string',
      title: 'Heading Accent (red)',
      initialValue: 'Do',
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Service Items',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceItem',
          title: 'Service',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Title', validation: (rule) => rule.required() }),
            defineField({ name: 'description', type: 'text', title: 'Description' }),
            defineField({
              name: 'deliverables',
              type: 'array',
              title: 'Deliverables',
              of: [defineArrayMember({ type: 'string' })],
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Service Item' }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare({ title, subtitle }) {
      return { title: title || 'Services Section', subtitle, media: ThListIcon }
    },
  },
})
