import express from 'express'

import { usePsyContextNode } from '@psy/psy/context/provide.node'

import { AcmeServerManifest } from '../Manifest'

export function acmeServerMdlVersion(req: express.Request, res: express.Response) {
  const $ = usePsyContextNode()
  const manifest = $.get(AcmeServerManifest)
  res.send(manifest.version)
}
