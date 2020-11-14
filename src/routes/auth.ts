import * as express from 'express-serve-static-core'
import {
  apiOnly,
  asyncHandler,
  ipRateLimited,
  adminOnlyHandler,
  createRequestValidator,
  didValidator,
} from '../requestUtils'

const EthrDID = require('ethr-did');
const { Credentials, SimpleSigner } = require( 'uport-credentials')
import { Resolver } from 'did-resolver';
import { getResolver } from 'ethr-did-resolver';
const DidRegistryContract = require('ethr-did-registry')

const Web3 = require("web3");
const ganache = require('ganache-cli')
import Repo from '../repository'
const makeEthrDID = require('../../services/did-service/src/main')

import regularExpressions from '../regularExpressions'
import {
  ModelValidator,
  ClientFacingError,
  toBoolean,
  recoverEthAddressFromPersonalRpcSig,
} from '../utils'
import * as EthU from 'ethereumjs-util'
import {personalSign} from '../../src/utils'

export const didRouter = (app: express.Application) => {
  app.post(
    '/did/create',
    ipRateLimited(20, 'create'),
    apiOnly,
    asyncHandler(
      async () => {
        // const DidRegistryContract = require('ethr-did-registry')

        // let networkId = 1 // Mainnet
        // let DidReg = web3.eth.contract(DidRegistryContract.abi)
        // return DidReg.at(DidRegistryContract.networks[networkId].address)

        const ethrDid = makeEthrDID.makeEthrDID('did:ethr:0xE971BA3568B5b73C6936588C56FACBfA193f6Bab', 'e36b2e5c2207c03aff7c160d8b313713a0fa1a36fd9596244ca50155449c7c79')
        
        const providerConfig = { rpcUrl: 'https://ropsten.infura.io/v3/91b0038d3b154f0a9b11212d29485594' } 
        const didResolver = new Resolver(getResolver(providerConfig))

        const doc = await didResolver.resolve(ethrDid.did)
        return doc
      },

      async (didReg) => {
        return {
          status: 200,
          body: {
            message: 'Did successfully created and on-chain',
            did: didReg
          },
        }
      }
    )
  )

export const tokenRouter = (app: express.Application) => {
  app.post(
    '/auth/request-token',
    ipRateLimited(20, 'request-token'),
    apiOnly,
    asyncHandler(
      async req => {
        const query = req.query as {did: string; initialize: boolean}
        const validator = new ModelValidator(query, {initialize: true})
        
        return validator.validate({
          did: didValidator,
          initialize: (_name, value) => toBoolean(value),
          
        })
      },

      async ({did, initialize}) => {
        const token = await Repo.createAccessToken(did.toLowerCase(), true)
        const signature = personalSign(
          token,
          '0xe36b2e5c2207c03aff7c160d8b313713a0fa1a36fd9596244ca50155449c7c79'
        )
        
        return {
          status: 200,
          body: {
            token: token,
            signature: signature
          },
        }
      }
    )
  )

  app.post(
    '/auth/validate-token',
    ipRateLimited(20, 'validate-token'),
    apiOnly,
    asyncHandler(
      async req => {
        const body = req.body as {
          accessToken: string
          signature: string
          did: string
        }
        const validator = new ModelValidator(body)

        return validator.validate({
          accessToken: async (name, value) => {
            const uuidRegex = regularExpressions.auth.uuid
            if (!uuidRegex.test(value)) {
              throw new ClientFacingError(`bad ${name} format`, 400)
            }
            return value
          },
          did: didValidator,
          signature: async (name, value) => {
            try {
              const ethAddress = EthU.bufferToHex(
                recoverEthAddressFromPersonalRpcSig(body.accessToken, value)
              )
              
              if (ethAddress !== body.did.replace('did:ethr:', '').toLowerCase()) {
                throw new ClientFacingError('unauthorized', 401)
              }
              console.log('erererererere')
              return value
            } catch (err) {
              console.log('validate-token signature validation error')
              console.log(err)
              if (err instanceof ClientFacingError) {
                throw err
              }
              throw new ClientFacingError(`bad ${name} format`, 400)
            }
          },
        })
      },
      async ({accessToken, signature}) => {
        const expiresAt = await Repo.validateAccessToken(accessToken, signature)
        console.log(expiresAt)
        console.log('biiiiiiiùmùùùù')
        if (!expiresAt) {
          throw new ClientFacingError('unauthorized', 401)
        }
        return {
          status: 200,
          body: {expiresAt},
        }
      }
    )
  )

  const parseDID = createRequestValidator(async req => {
    const query = req.query as {did: string}
    const validator = new ModelValidator(query)

    return validator.validate({
      did: didValidator,
    })
  })

  app.post(
    '/auth/blacklist',
    apiOnly,
    adminOnlyHandler(parseDID, async ({did}) => {
      await Repo.addBlacklist(did)
      return {
        status: 200,
        body: {},
      }
    })
  )

  app.delete(
    '/auth/blacklist',
    apiOnly,
    adminOnlyHandler(parseDID, async ({did}) => {
      await Repo.removeBlacklist(did)
      return {
        status: 200,
        body: {},
      }
    })
  )

  app.post(
    '/auth/admin',
    apiOnly,
    adminOnlyHandler(parseDID, async ({did}) => {
      await Repo.addAdmin(did)
      return {
        status: 200,
        body: {},
      }
    })
  )

  app.delete(
    '/auth/admin',
    apiOnly,
    adminOnlyHandler(parseDID, async ({did}) => {
      await Repo.removeAdmin(did)
      return {
        status: 200,
        body: {},
      }
    })
  )

  app.post(
    '/auth/entity',
    apiOnly,
    adminOnlyHandler(parseDID, async ({did}) => {
      await Repo.addEntity(did)
      return {
        status: 200,
        body: {},
      }
    })
  )
}
