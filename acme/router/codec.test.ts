import { AcmeRouterCodec } from './codec'

function defaultCodec() {
  return new AcmeRouterCodec(
    (
      t,
      p: Record<'project' | 'region' | 'deal' | 'realty' | 'priceMaxDeshevie' | 'priceMaxNumber', typeof t>,
      opt = (...strs: string[]) => t`(?:` + strs.join(t`|`) + t`)?`
    ) => [
      '/' + p.project`nedvishimost`,
      opt('/' + p.region`\\w+`),
      opt('/' + p.deal`pokupka|arenda` + `-` + p.realty`kvartiri|komnati`),
      opt('/' + p.priceMaxDeshevie`deshevie`, p.priceMaxNumber`do-${val => val`\\d{1,2}`}-mln-rub`),
      opt('/'),
      t`$`,
    ]
  )
}

test('not matched if wrong required part', () => {
  const codec = defaultCodec()
  const params = codec.match('/nedvishimost@')
  expect(params.seg?.project).toBe(undefined)
})

test('match required part', () => {
  const codec = defaultCodec()
  const params = codec.match('/nedvishimost')
  expect(params.seg?.project).toBe('nedvishimost')
})

test('match variable parts', () => {
  const codec = defaultCodec()
  const params = codec.match('/nedvishimost/moskva/pokupka-kvartiri/deshevie')
  expect(params.seg).toEqual({
    project: 'nedvishimost',
    region: 'moskva',
    deal: 'pokupka',
    realty: 'kvartiri',
    priceMaxNumber: undefined,
    priceMaxDeshevie: 'deshevie',
  })
})
