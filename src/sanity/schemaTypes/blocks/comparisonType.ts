import { defineField, defineType, defineArrayMember } from 'sanity'
import { ComposeIcon } from '@sanity/icons'

export const comparisonType = defineType({
  name: 'comparison',
  type: 'object',
  title: 'Comparison Table Section',
  icon: ComposeIcon,
  fields: [
    defineField({ name: 'heading', type: 'string', title: 'Heading', initialValue: 'Why Choose' }),
    defineField({ name: 'headingAccent', type: 'string', title: 'Heading Accent (red)', initialValue: 'Us' }),
    defineField({
      name: 'columns',
      type: 'array',
      title: 'Column Labels',
      description: 'The capability column headers (e.g. Speed, Quality, Support...)',
      of: [defineArrayMember({ type: 'string' })],
      initialValue: ['Speed', 'Flexibility', 'Quality', 'Scalability', 'Efficiency', 'Print', 'Support'],
    }),
    defineField({
      name: 'competitors',
      type: 'array',
      title: 'Competitor Rows',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'competitor',
          title: 'Competitor',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Competitor Name', validation: (rule) => rule.required() }),
            defineField({ name: 'description', type: 'string', title: 'Short Description' }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) { return { title: title || 'Competitor' } },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading' },
    prepare({ title }) {
      return { title: title || 'Comparison Table', media: ComposeIcon }
    },
  },
})
