import { defineField, defineType, defineArrayMember } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'

export const problemsType = defineType({
  name: 'problems',
  type: 'object',
  title: 'Problems Solved Section',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({ name: 'eyebrow', type: 'string', title: 'Eyebrow Text', initialValue: 'PROBLEMS WE SOLVE' }),
    defineField({ name: 'heading', type: 'string', title: 'Heading', initialValue: 'Stop Losing' }),
    defineField({ name: 'headingAccent', type: 'string', title: 'Heading Accent (red)', initialValue: 'Business' }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Problem Items',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'problemItem',
          title: 'Problem',
          fields: [
            defineField({ name: 'problem', type: 'string', title: 'Problem Statement', validation: (rule) => rule.required() }),
            defineField({ name: 'solution', type: 'string', title: 'Our Solution' }),
          ],
          preview: {
            select: { title: 'problem' },
            prepare({ title }) { return { title: title || 'Problem' } },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare({ title, subtitle }) {
      return { title: title || 'Problems Section', subtitle, media: CheckmarkCircleIcon }
    },
  },
})
