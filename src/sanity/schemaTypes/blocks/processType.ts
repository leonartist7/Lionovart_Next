import { defineField, defineType, defineArrayMember } from 'sanity'
import { OlistIcon } from '@sanity/icons'

export const processType = defineType({
  name: 'process',
  type: 'object',
  title: 'Process Section',
  icon: OlistIcon,
  fields: [
    defineField({ name: 'eyebrow', type: 'string', title: 'Eyebrow Text', initialValue: 'HOW WE WORK' }),
    defineField({ name: 'heading', type: 'string', title: 'Heading', initialValue: 'Our' }),
    defineField({ name: 'headingAccent', type: 'string', title: 'Heading Accent (red)', initialValue: 'Process' }),
    defineField({ name: 'scrollHint', type: 'string', title: 'Scroll Hint', initialValue: 'SCROLL →' }),
    defineField({
      name: 'steps',
      type: 'array',
      title: 'Steps',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'processStep',
          title: 'Step',
          fields: [
            defineField({ name: 'num', type: 'string', title: 'Step Number', initialValue: '1' }),
            defineField({ name: 'title', type: 'string', title: 'Title', validation: (rule) => rule.required() }),
            defineField({ name: 'description', type: 'text', title: 'Description' }),
            defineField({ name: 'tag', type: 'string', title: 'Tag (e.g. Foundation)' }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'num' },
            prepare({ title, subtitle }) {
              return { title: title || 'Step', subtitle: `Step ${subtitle}` }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare({ title, subtitle }) {
      return { title: title || 'Process Section', subtitle, media: OlistIcon }
    },
  },
})
