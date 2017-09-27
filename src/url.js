import Syncano from 'syncano-server'

export default (ctx) => {
  const {response} = Syncano(ctx)
  const additionalArgs = Object.keys(ctx.args.args || {}).map(k => k + '=' + encodeURIComponent(ctx.args.args[k])).join('&')

  const url = [
    `https://${ctx.config.HOST}/std/method/demo?id=${ctx.args.method}:${ctx.config.SERVICE}:${ctx.args.lang}`,
    `&target=https://${ctx.meta.instance}.syncano.space/signicat/verify/${additionalArgs ? `?${additionalArgs}` : ''}`
  ].join('')

  response.json({url})
}
