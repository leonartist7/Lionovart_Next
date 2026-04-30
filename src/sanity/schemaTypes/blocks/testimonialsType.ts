import { defineField, defineType, defineArrayMember } from 'sanity'
import { StarIcon } from '@sanity/icons'

export const testimonialsType = defineType({
  name: 'testimonials',
  type: 'object',
  title: 'Testimonials Section',
  icon: StarIcon,
  fields: [
    defineField({ name: 'eyebrow', type: 'string', title: 'Eyebrow Text', initialValue: 'CLIENT RESULTS' }),
    defineField({ name: 'heading', type: 'string', title: 'Heading', initialValue: 'Real Results' }),
    defineField({ name: 'subheading', type: 'text', title: 'Subheading', initialValue: 'Every engagement is measured by the impact it creates.' }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Testimonials',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'testimonialItem',
          title: 'Testimonial',
          fields: [
            defineField({ name: 'industry', type: 'string', title: 'Industry Label (e.g. HOSPITALITY)', validation: (rule) => rule.required() }),
            defineField({ name: 'hook', type: 'string', title: 'Hook / Headline', validation: (rule) => rule.required() }),
            defineField({ name: 'quote', type: 'text', title: 'Quote', validation: (rule) => rule.required() }),
            defineField({ name: 'author', type: 'string', title: 'Author Name', validation: (rule) => rule.required() }),
            defineField({ name: 'role', type: 'string', title: 'Author Role & Company' }),
          ],
          preview: {
            select: { title: 'author', subtitle: 'hook' },
            prepare({ title, subtitle }) {
              return { title: title || 'Testimonial', subtitle }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'heading', subtitle: 'eyebrow' },
    prepare({ title, subtitle }) {
      return { title: title || 'Testimonials Section', subtitle, media: StarIcon }
    },
  },
})
