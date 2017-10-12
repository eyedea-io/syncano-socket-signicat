/* global describe it */
import fs from 'fs'
import {assert} from 'chai'
import {run} from 'syncano-test'

describe('sign', function () {
  const args = {
    userIDs: ['07023226604', '05054714493']
  }

  const config = {
    HOST: process.env.SIGNICAT_HOST,
    SERVICE: process.env.SIGNICAT_SERVICE,
    SERVICE_PASSWORD: process.env.SIGNICAT_SERVICE_PASSWORD
  }

  it('send document to sign vis socket', function (done) {
    args['file'] = fs.createReadStream('test/assets/test.txt')
    run('upload-document', {args, config})
      .then((res) => {
        const signArgs = {
          documentID: res.data.documentID,
          userIDs: args.userIDs
        }
        return run('sign', {args: signArgs, config})
      })
      .then(res => {
        assert.property(res.data, 'signURL')
        assert.propertyVal(res, 'code', 200)
        done()
      })
  })
})
