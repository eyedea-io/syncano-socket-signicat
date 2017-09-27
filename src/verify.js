import saml from 'saml20'
import {stringify} from 'querystring'
import Syncano from 'syncano-server'

export default (ctx) => {
  const {socket, response, users, logger} = Syncano(ctx)
  const {debug} = logger('verify')

  const SAMLResponse = Buffer.from(ctx.args.SAMLResponse, 'base64').toString('utf8')

  // const pubKey = `
  // MIIDuzCCAqOgAwIBAgIBDjANBgkqhkiG9w0BAQsFADBJMQswCQYDVQQGEwJOTzEU
  // MBIGA1UEChMLU2lnbmljYXQgQVMxJDAiBgNVBAMTG1NpZ25pY2F0IEV4dGVybmFs
  // IENBICgyMDQ4KTAeFw0xNTA1MTIxMzA4MzVaFw0xNzA5MjMxMzA4MzVaMHgxCzAJ
  // BgNVBAYTAk5PMQ8wDQYDVQQIDAZOb3J3YXkxEjAQBgNVBAcMCVRyb25kaGVpbTER
  // MA8GA1UECgwIU2lnbmljYXQxETAPBgNVBAsMCFNpZ25pY2F0MR4wHAYDVQQDDBV0
  // ZXN0LnNpZ25pY2F0LmNvbS9zdGQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
  // AoIBAQCnVHnRlvqzV6RPNjPTSOqboAH8xJwOR2hncTcYsVZ8U5TLYAwaphaiGa5S
  // x2PGpi/R8+uVyxAm3EdOcXBIg60sfZ7dhXl78x0porzXA4wxFTd3wTpAYh/jt2JX
  // 0aLnEtYATvVzW1xatmQODBhBpwZ0Gj352FadQFVobqhKkJJkguudQ6z0QpZiRRDu
  // A1vXXrnCmwCfzXmGXVOfMIfgkvPz85EGd5Y365UALDLWcbamk7Z/llEXc+oaOR6a
  // mdFVxnH3ksSyfZ+Hhi2G9qijiLKs1qp516pwVdb3flryJRsoa9GccS68rQN6EzD+
  // S9io7qmUGQkfBpKd9s8O2SwqhSjtAgMBAAGjfzB9MAkGA1UdEwQCMAAwCwYDVR0P
  // BAQDAgXgMCMGCWCGSAGG+EIBDQQWFhRTaWduaWNhdCBDZXJ0aWZpY2F0ZTAdBgNV
  // HQ4EFgQUlvBuK7QGLkIZlNUxMaZwjtVOZyIwHwYDVR0jBBgwFoAUstl+DZ605NwX
  // 3br661U41SHRS/YwDQYJKoZIhvcNAQELBQADggEBAEhA48Ioyr6qSySmFBmxitUC
  // +421IgTZ6ZOPLE8u0QLCXuUdwicOOAtn5ue3iSq6kxMI5jPa3JFQdX/sCgeON0jZ
  // GCvcJ8DOw4ScwR7OjLk0cHLpb1t+8ns9YAPjy0Ho69N0L4vSujKWA4pw3T2Hw2XI
  // KRSqfgfrjAlSXBugQNl0NB9PmCvUbfHwGsz1ldgNjAUfMweSyRfiR6ZrRaUjzB93
  // q2cpY4kWVgCld0Kw+Qu/qaEXn1BpA7Lf9ZDyMQjqbbEug2t40Y/Ey90eYotj5cHg
  // B5XLK+N1Z8S6fmWFwGiMYDCvg60dOUfLp4b/7KK0aj79l7WH7f6FCeT0uIuqpdQ=
  // `

  // Calculate thumbprint
  // console.log(thumbprint.calculate(pubKey))

  // var options = {
  //     thumbprint: 'f43cece9780e65c9807ef1ed162e6b17ae2861fe'
  // }

  // saml.validate(response, options, function(err, profile) {
  //   console.log(err)
  //   console.log(profile)
  // });

  saml.parse(SAMLResponse, function (err, profile) {
    if (err) {
      response.json({message: 'Error while parsing SAML response!'}, 400)
    } else {
      debug(profile)

      users
        .where('national_id', 'eq', profile.claims['signicat/national-id'])
        .first()
        .then(userProfile => {
          debug('user profile from search')
          debug(userProfile)
          if (userProfile) {
            return userProfile
          } else {
            return socket.post(ctx.config.REGISTER_ENDPOINT, {
              username: ctx.args.username,
              password: Math.random().toString(36).slice(-8),
              national_id: profile.claims['signicat/national-id']
            })
          }
        })
        .then(userProfile => {
          debug('user profile')
          debug(userProfile)

          const verifyArgs = Object.assign({}, ctx.args)
          delete verifyArgs.SAMLResponse
          delete verifyArgs.TARGET

          const args = {
            user_key: userProfile.user_key,
            args: JSON.stringify(verifyArgs)
          }

          debug('location')
          debug(`${ctx.config.REDIRECT_URL}${/\?/.test(ctx.config.REDIRECT_URL) ? '&' : '?'}${stringify(args)}`)
          global.setResponse(new global.HttpResponse(301, ' ', 'plain/text', {
            Location: `${ctx.config.REDIRECT_URL}${/\?/.test(ctx.config.REDIRECT_URL) ? '&' : '?'}${stringify(args)}`
          }))
        })
        .catch(err => {
          if (err.response) {
            err.response.json()
              .then(json => {
                response.json({message: json}, 400)
                process.exit()
              })
          }
          console.log(err)
        })
    }
  })
}
