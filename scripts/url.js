import { response } from 'syncano-server'


const additionalArgs = Object.keys(ARGS.args).map(k => k + '=' + encodeURIComponent(ARGS.args[k])).join('&')

response.json({
  url: `https://${CONFIG.HOST}/std/method/demo?id=${ARGS.method}:${CONFIG.SERVICE}:${ARGS.lang}&
target=https://${META.instance}.syncano.space/signicat/verify/${additionalArgs}`
})
