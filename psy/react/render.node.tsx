import ReactDOMServer from 'react-dom/server'

import { PsyContext } from '@psy/psy/context/Context'
import { PsySsrRenderNode } from '@psy/psy/ssr/Render.node'

import { PsyReactProvide } from './provide'

export class PsyReactRenderNode extends PsySsrRenderNode {
  render(ctx: PsyContext) {
    return ReactDOMServer.renderToNodeStream(<PsyReactProvide parent={ctx} children={this.template().node()} />)
  }
}
