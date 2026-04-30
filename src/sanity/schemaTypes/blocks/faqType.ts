import { defineField, defineType, defineArrayMember } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons'

export const faqType = defineType({
  name: 'faq',
  type: 'object',
  title: 'FAQ Section',
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: 'eyebrow', type: 'string', title: 'Eyebrow Text', initialValue: 'FAQ' }),
    defineField({ name: 'heading', type: 'string', title: 'Heading', initialValue: 'Common' }),
    defineField({ name: 'headingAccent', type: 'string', title: 'Heading Accent (red)', initialValue: 'Questions' }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'FAQ Items',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faqItem',
          title: 'FAQ',
          fields: [
            defineField({ name: 'question', type: 'string', title: 'Question', validation: (rule) => rule.required() }),
            defineField({ name: 'answer', type: 'text', title: 'Answer', validation: (rule) => rule.required() }),
          ],
          preview: {
            select: { title: 'question' },
            prepare({ title }) { return { title: title || 'FAQ Item' } },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare({ title, subtitle }) {
      return { title: title || 'FAQ Section', subtitle, media: HelpCircleIcon }
    },
  },
})
