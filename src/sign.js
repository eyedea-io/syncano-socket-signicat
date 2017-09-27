import soap from 'soap'
import Syncano from 'syncano-server'

export default (ctx) => {
  const {response} = Syncano(ctx)

  const documentServiceUrl = `https://${ctx.config.HOST}/ws/documentservice-v3?wsdl`

  const args = {
    service: ctx.config.SERVICE,
    password: ctx.config.SERVICE_PASSWORD,
    request: {
      profile: 'default',
      language: ctx.config.SERVICE_LANGUAGE || 'en',
      document: {
        attributes: {
          id: 'pdfdoc',
          'xsi:type': 'tns:sds-document',
          'ref-sds-id': ctx.args.documentID,
          'send-to-archive': false
        },
        description: ctx.args.documentDescription || 'Document'
      }
    }
  }

  args.request.task = ctx.args.userIDs.map(userID => {
    return {
      attributes: {
        id: `task-${userID}`,
        bundle: false
      },
      'document-action': {
        attributes: {
          'type': 'sign'
        },
        'document-ref': 'pdfdoc'
      },
      signature: {
        method: 'nbid-sign'
      },
      subject: {
        attributes: {
          id: userID
        },
        'national-id': userID
      }
    }
  })

  return new Promise((resolve, reject) => {
    soap.createClient(documentServiceUrl, (err, client) => {
      if (err) {
        return response.json({error: err}, 400)
      }
      client.setSecurity(new soap.BasicAuthSecurity(ctx.config.SERVICE, ctx.config.SERVICE_PASSWORD))
      client.DocumentService.DocumentServiceEndPointPort.createRequest(args, (err, resp) => {
        if (resp && resp['request-id']) {
          response.json({
            signURL: `https://${ctx.config.HOST}/std/docaction/${ctx.config.SERVICE}?request_id=${resp['request-id']}`
          })
          resolve()
        } else if (err) {
          response.json({error: err}, 400)
          resolve()
        }
      })
    })
  })
}
