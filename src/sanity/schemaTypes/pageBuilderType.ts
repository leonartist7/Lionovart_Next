import { defineType, defineArrayMember } from 'sanity'

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  title: 'Page Builder',
  of: [
    defineArrayMember({ type: 'heroTop' }),
    defineArrayMember({ type: 'aboutUsHalf' }),
    defineArrayMember({ type: 'services' }),
    defineArrayMember({ type: 'process' }),
    defineArrayMember({ type: 'testimonials' }),
    defineArrayMember({ type: 'comparison' }),
    defineArrayMember({ type: 'problems' }),
    defineArrayMember({ type: 'faq' }),
  ],
})
