/* global describe it */
import {assert} from 'chai'
import {run, generateMeta} from 'syncano-test'

describe('url', function () {
  const meta = generateMeta({
    instance: 'my_instance'
  })

  const config = {
    HOST: 'preprod.signicat.com',
    SERVICE: 'demo'
  }

  const args = {
    method: 'nbid',
    lang: 'en'
  }

  it('simple', function (done) {
    const additionalArgs = null
    const url = [
      `https://${config.HOST}/std/method/demo?id=${args.method}:${config.SERVICE}:${args.lang}`,
      `&target=https://${meta.instance}.syncano.space/signicat/verify/${additionalArgs ? `?${additionalArgs}` : ''}`
    ].join('')

    run('url', {args, config, meta})
      .then(response => {
        assert.propertyVal(response.data, 'url', url)
        assert.propertyVal(response, 'code', 200)
        done()
      })
  })

  it('with additional args', function (done) {
    const argsWithAdditionalArgs = Object.assign({}, args, {args: {testArg: 'test123'}})
    const url = [
      `https://${config.HOST}/std/method/demo?id=${args.method}:${config.SERVICE}:${args.lang}`,
      `&target=https://${meta.instance}.syncano.space/signicat/verify/?testArg=test123`
    ].join('')

    run('url', {args: argsWithAdditionalArgs, config, meta})
      .then(response => {
        assert.propertyVal(response.data, 'url', url)
        assert.propertyVal(response, 'code', 200)
        done()
      })
  })
})
