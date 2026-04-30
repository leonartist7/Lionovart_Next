import { type SchemaTypeDefinition } from 'sanity'
import { heroTopType } from './blocks/heroTopType'
import { aboutUsHalfType } from './blocks/aboutUsHalfType'
import { servicesType } from './blocks/servicesType'
import { processType } from './blocks/processType'
import { testimonialsType } from './blocks/testimonialsType'
import { comparisonType } from './blocks/comparisonType'
import { faqType } from './blocks/faqType'
import { problemsType } from './blocks/problemsType'
import { pageBuilderType } from './pageBuilderType'
import { pageType } from './pageType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Document types
    pageType,
    // Array type
    pageBuilderType,
    // Block types (sections)
    heroTopType,
    aboutUsHalfType,
    servicesType,
    processType,
    testimonialsType,
    comparisonType,
    faqType,
    problemsType,
  ],
}
