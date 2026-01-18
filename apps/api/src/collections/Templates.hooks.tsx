import { Template } from '@/payload-types'
import { generateId } from '@/utils/generate-id'
import { CollectionBeforeOperationHook } from 'payload'
import slugify from 'slugify'
import { createOrUpdateTags } from './Tags.hooks'

export const beforeOperationHook: CollectionBeforeOperationHook = async (props) => {
  const { operation, args } = props
  const data = args.data as Partial<Template>
  if (['create'].indexOf(operation) > -1) {
    if (!data.slug) {
      args.data.slug = slugify(`${args.data.title} ${generateId(4)}`, { lower: true })
    }
  }
  if (['create', 'update'].indexOf(operation) > -1) {
    if (data.tags) {
      data.tags = await createOrUpdateTags(props.req.payload, data.tags)
    }
  }
  return args
}
