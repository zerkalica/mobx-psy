import express from 'express'

import { usePsyContextNode } from '@psy/core/context/provide.node'

import { SnapServerManifest } from '../Manifest'

export function snapServerMdlVersion(req: express.Request, res: express.Response) {
  const $ = usePsyContextNode()
  const manifest = $.get(SnapServerManifest)
  res.send(manifest.version)
}
