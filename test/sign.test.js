/* global describe it */
import fs from 'fs'
import request from 'request'
import {assert} from 'chai'
import {run} from 'syncano-test'

describe('sign', function () {
  it('send document to sign', function (done) {
    const args = {
      userIDs: ['07023226604', '05054714493']
    }

    const config = {
      HOST: process.env.SIGNICAT_HOST,
      SERVICE: process.env.SIGNICAT_SERVICE,
      SERVICE_PASSWORD: process.env.SIGNICAT_SERVICE_PASSWORD
    }

    const uploadFile = () => {
      return new Promise((resolve, reject) => {
        fs.createReadStream('test.txt').pipe(
            request.post(
                `https://${config.HOST}/doc/${config.SERVICE}/sds/`,
                function (error, response, body) {
                  if (!error && response.statusCode === 201) {
                    resolve(body)
                  } else {
                    reject(error)
                  }
                }
            ).auth(
                config.SERVICE,
                config.SERVICE_PASSWORD
            )
        )
      })
    }

    uploadFile()
      .then(documentID => {
        args.documentID = documentID
        return run('sign', {args, config})
      })
      .then(response => {
        assert.property(response.data, 'signURL')
        assert.propertyVal(response, 'code', 200)
        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })
})
