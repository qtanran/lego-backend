import { Service } from 'egg'
import { createSSRApp } from 'vue'
// @ts-ignore
import LegoComponents from 'lego-components'
import { renderToString } from '@vue/server-renderer'
import { WorkProps } from '../model/work'

export default class UserService extends Service {
  propsToStyle(props = {}) {
    const keys = Object.keys(props)
    const styleArr = keys.map(key => {
      const formatKey = key.replace(/[A-Z]/g, c => `-${c.toLocaleLowerCase()}`)
      // fontSize -> font-size
      const value = props[key]
      return `${formatKey}: ${value}`
    })
    return styleArr.join(';')
  }

  async renderToPageData(query: { id: string; uuid: string }) {
    const work = await this.ctx.model.Work.findOne<WorkProps>(query).lean()
    if (!work) {
      throw new Error('work not exist')
    }
    const { title, desc, content } = work
    const vueApp = createSSRApp({
      data: () => {
        return {
          components: (content && content.components) || []
        }
      },
      template: '<final-page :components="components" />'
    })
    vueApp.use(LegoComponents)
    const html = await renderToString(vueApp)
    const bodyStyle = this.propsToStyle(content && content.props)
    return {
      html,
      title,
      desc,
      bodyStyle
    }
  }
}
