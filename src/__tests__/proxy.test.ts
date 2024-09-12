import { uniq } from 'lodash'
import { PerxInvoiceRequest, PerxInvoiceRequestTransactionData, PerxInvoiceRequestUsedItem, PerxLoyalty, PerxLoyaltyTransactionRequest, PerxLoyaltyTransactionRequestUserAccount, PerxLoyaltyTransactionReservationRequest, PerxMerchant } from '..'
import { IPerxService, PerxService } from '../client'
import { PerxCampaign } from '../models'
import { PerxProxyManager } from '../proxy'

describe('PerxProxyManager', () => {

  const testingTokenDurationInSeconds = 300

  const client: IPerxService = new PerxService({
    baseURL: (process.env.TEST_PERX_API_URL || ''),
    clientId: (process.env.TEST_PERX_CLIENT_ID || ''),
    clientSecret: (process.env.TEST_PERX_CLIENT_SECRET || ''),
    tokenDurationInSeconds: testingTokenDurationInSeconds, // 5 mins is more than enough
  })

  const testableLoyaltyProgramIdOnPerxServer = (process.env.TEST_PERX_LOYALTY_PROGRAM_ID || '')
  const testableUserIdentifierOnPerxServer = (process.env.TEST_PERX_USER_IDENTIFIER || '')
  const testableUserIdOnPerxServer = (process.env.TEST_PERX_USER_ID || '')
  const testablePerxTriggerId = (process.env.TEST_CUSTOM_TRIGGER_ID || '')
  // Optional target, if not provide use first record in query to run the test
  const testableMerchantIdentifier = (process.env.TEST_PERX_MERCHANT_IDENTIFIER || '')
  const testableRewardId = +(process.env.TEST_PERX_REWARD_ID || '-1')
  const testableMerchantIds = (process.env.TEST_PERX_VALID_MERCHANT_ID || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  const testableGameId = (process.env.TEST_PERX_GAME_ID || '')
  

  if (!testableUserIdentifierOnPerxServer) {
    throw new Error('Unable to run test without proper configuration. Please revise your .env file. (in root folder)')
  }
  const manager = new PerxProxyManager(client)
  const userAccount = new PerxLoyaltyTransactionRequestUserAccount({ type: 'id', id: +testableUserIdOnPerxServer })
  const user = manager.user({ type: 'id', id: +testableUserIdOnPerxServer }, 'en')
  const pos = manager.pos('en')

  describe('id', () => {
    it('can assureToken with id', async () => {
      const resp = await manager.assureToken({
        type: 'id',
        id: +testableUserIdOnPerxServer,
      })
      expect(resp.accessToken).toBeTruthy()
    })

    if (testableMerchantIdentifier) {
      it('can issue merchant token', async () => {
        const token = await manager.merchantBearer(testableMerchantIdentifier)
        expect(typeof token.bearerToken).toEqual('string')
        expect(token.bearerToken).toBeTruthy()
      })
    }
  })

  describe('user', () => {
    it('can query the customer', async () => {
      const user = manager.user({
        type: 'id',
        id: +testableUserIdOnPerxServer,
      }, 'en')

      const me = await user.getMe()
      expect(me.id).toEqual(+testableUserIdOnPerxServer)
      expect(me.identifier).toEqual(testableUserIdentifierOnPerxServer)
    })

    it('can query categories', async () => {
      const user = manager.user({
        type: 'id',
        id: +testableUserIdOnPerxServer,
      }, 'en')

      const firstPage = await user.listCategories(1, 1)
      expect(firstPage).toBeTruthy()
      const hasCategory = firstPage.data.length > 0
      if (hasCategory) {
        expect(firstPage.data.length).toBeLessThanOrEqual(1)
        expect(firstPage.meta).toBeTruthy()
        expect(firstPage.meta.totalCount).toBeTruthy()
        expect(firstPage.meta.nextPage).toBeTruthy()
        expect(firstPage.meta.totalPages).toBeGreaterThanOrEqual(1)

        // Try get all pages!

        const allCats = await user.listAllCategories()
        expect(allCats).toBeTruthy()
        expect(allCats).toBeInstanceOf(Array)
        expect(allCats.length).toEqual(firstPage.meta.totalCount)
        expect(uniq(allCats.map((o) => o.id)).length).toEqual(firstPage.meta.totalCount)
      }
    })
  })

  describe('LoyaltyPoints', () => {
    let program: PerxLoyalty | undefined = undefined
    const pointsToTest = 300
    let reservationBalanceBeforeReserve = 0
    let reservedTransactionId: string = ''

    it('can query the user points', async () => {
      program = await user.getLoyaltyProgram(testableLoyaltyProgramIdOnPerxServer)

      expect(program).toBeTruthy()
      expect(program.pointBalance).toBeTruthy()
      reservationBalanceBeforeReserve = program.redemptionInProgressBalance
    })

    it('can added some points in', async () => {
      await pos.submitLoyaltyTransaction(new PerxLoyaltyTransactionRequest(
        userAccount,
        +testableLoyaltyProgramIdOnPerxServer,
        pointsToTest,
        null,
        {},
      ))
      const newPrg = await user.getLoyaltyProgram(testableLoyaltyProgramIdOnPerxServer)
      expect(newPrg).toBeTruthy()
      expect(newPrg.pointBalance - program!.pointBalance).toEqual(pointsToTest)
      expect(newPrg.redemptionInProgressBalance).toEqual(reservationBalanceBeforeReserve)
      program = newPrg
    })

    it('will throws an error when reserving points exceeds current balance', async () => {
      const exceedingPoints = program!.pointBalance + 1
      await expect(() => pos.reserveLoyaltyPoints(new PerxLoyaltyTransactionReservationRequest(
        userAccount,
        +testableLoyaltyProgramIdOnPerxServer,
        exceedingPoints,
      ))).rejects.toThrow(/not.*enough points/)
    })

    it('can reserve the loyalty points', async () => {
      const reserved = await pos.reserveLoyaltyPoints(new PerxLoyaltyTransactionReservationRequest(
        userAccount,
        +testableLoyaltyProgramIdOnPerxServer,
        pointsToTest,
      ))

      expect(reserved).toBeTruthy()
      expect(reserved.id).toBeTruthy()
      expect(`${reserved.loyaltyProgramId}`).toEqual(testableLoyaltyProgramIdOnPerxServer)
      reservedTransactionId = `${reserved.id}`
    })

    it('can see the the points has been reserved', async () => {
      const newPrg = await user.getLoyaltyProgram(testableLoyaltyProgramIdOnPerxServer)
      expect(newPrg).toBeTruthy()
      // point balance won't change a bit
      expect(newPrg.pointBalance).toEqual(program!.pointBalance)
      expect(newPrg.redemptionInProgressBalance).toEqual(reservationBalanceBeforeReserve + pointsToTest)
    })

    it('can then release the reserved transaction', async () => {
      const released = await pos.releaseLoyaltyPoints(
        userAccount,
        reservedTransactionId,
      )

      expect(released).toBeTruthy()
    })

    it('can then see the points those has been released', async () => {
      const newPrg = await user.getLoyaltyProgram(testableLoyaltyProgramIdOnPerxServer)
      expect(newPrg).toBeTruthy()
      // point balance won't change a bit
      expect(newPrg.pointBalance).toEqual(program!.pointBalance)
      expect(newPrg.redemptionInProgressBalance).toEqual(reservationBalanceBeforeReserve)
    })
  })

  if (testableRewardId) {
    describe('vouchers', () => {
      const targetRewardId = `${testableRewardId}`
      let targetVoucherId: string = ''

      it('can claim the reward and use it right away', async () => {
        const voucher = await user.issueReward(targetRewardId)
        expect(voucher).toBeTruthy()
        expect(voucher.issuedDate).toBeTruthy()
        expect(voucher.id).toBeTruthy()

        const used = await user.confirmVouchers([ `${voucher.id}` ])
        expect(used).toBeInstanceOf(Array)
        expect(used.length).toEqual(1)
        expect(used[0].id).toEqual(voucher.id)
        expect(used[0].state).toEqual('redeemed')
      })
  
      it('can claim the reward', async () => {
        const voucher = await user.issueReward(targetRewardId)
        expect(voucher).toBeTruthy()
        expect(voucher.issuedDate).toBeTruthy()
        expect(voucher.id).toBeTruthy()
        targetVoucherId = `${voucher.id}`
      })

      it('can reserve the voucher', async () => {
        const reservedVochers = await user.reserveVouchers([ targetVoucherId ])
        expect(reservedVochers).toBeInstanceOf(Array)
        expect(reservedVochers.length).toEqual(1)
        expect(reservedVochers[0].id).toEqual(+targetVoucherId)
        expect(reservedVochers[0].state).toEqual('redemption_in_progress')
      })

      it('cannot be reserved for the second time', async () => {
        await expect(() => user.reserveVouchers([ targetVoucherId ]))
          .rejects.toThrow(/not permit/)
      })

      it('can be released', async () => {
        const reservedVochers = await pos.releaseVouchers([ targetVoucherId ])
        expect(reservedVochers).toBeInstanceOf(Array)
        expect(reservedVochers.length).toEqual(1)
        expect(reservedVochers[0].id).toEqual(+targetVoucherId)
        expect(reservedVochers[0].state).toEqual('issued')
      })

      it('can then be reserved again', async () => {
        const reservedVochers = await user.reserveVouchers([ targetVoucherId ])
        expect(reservedVochers).toBeInstanceOf(Array)
        expect(reservedVochers.length).toEqual(1)
        expect(reservedVochers[0].id).toEqual(+targetVoucherId)
        expect(reservedVochers[0].state).toEqual('redemption_in_progress')
      })

      it('can then be confirmed to use', async () => {
        const reservedVochers = await user.confirmVouchers([ targetVoucherId ])
        expect(reservedVochers).toBeInstanceOf(Array)
        expect(reservedVochers.length).toEqual(1)
        expect(reservedVochers[0].id).toEqual(+targetVoucherId)
        expect(reservedVochers[0].state).toEqual('redeemed')
      })
    })
  }

  if (testablePerxTriggerId) {
    it('Allow user to trigger with ruleId', async () => {
      await expect(user.performCustomTrigger(testablePerxTriggerId)).resolves.not.toThrow()
    })
  }

  it('Throw error "The record requested does not exist" when trigger bad ruleId', async ()=> {
    await expect(user.performCustomTrigger('some-invalid-rule-id')).rejects.toThrow(/record requested does not exist/)
  })

  describe('can list merchants', () => {
    it.each`
      count
      ${1}
      ${2}
      ${3}
    `('with count $count', async ({ count }) => {
      const listMerchants = await user.listAllMerchants(1, count)
      expect(listMerchants.data.length).toEqual(count)
      expect(listMerchants.data.filter((o) => o instanceof PerxMerchant).length).toEqual(count)
      expect(uniq(listMerchants.data.map((o) => o.id).filter(Boolean)).length).toEqual(count)
      expect(listMerchants.error).toBe(undefined)
    })
  })

  if (testableRewardId && testableMerchantIds.length >= 2) {
    const firstMerchantId = testableMerchantIds[0]
    const secondMerchantId = testableMerchantIds[1]
    const sourceRewardId = `${testableRewardId}`

    describe.each`
      pointsToUse  | numberOfTransactions    | distribution            | voucherUsages          | reserveVoucherBy   | merchantIds                                                | expectedInvoiceItems
      ${300}       | ${2}                    | ${[250, 50]}            | ${[true, false]}       | ${'voucherApi'}    | ${[firstMerchantId, secondMerchantId]}                     | ${4}
      ${300}       | ${2}                    | ${[250, 50]}            | ${[true, false]}       | ${'rewardApi'}     | ${[firstMerchantId, secondMerchantId]}                     | ${4}
      ${300}       | ${2}                    | ${[200, 50]}            | ${[true, false]}       | ${'voucherApi'}    | ${[firstMerchantId, secondMerchantId]}                     | ${4}
      ${350}       | ${3}                    | ${[150, 50, 150]}       | ${[true, false, true]} | ${'voucherApi'}    | ${[firstMerchantId, firstMerchantId, secondMerchantId]}    | ${5}
      ${500}       | ${2}                    | ${[250, 250]}           | ${[true, true]}        | ${'voucherApi'}    | ${[firstMerchantId, secondMerchantId]}                     | ${4}
      ${500}       | ${1}                    | ${[500]}                | ${[true]}              | ${'voucherApi'}    | ${[secondMerchantId]}                                      | ${3}
      ${600}       | ${2}                    | ${[0, 300]}             | ${[false, true]}       | ${'voucherApi'}    | ${[secondMerchantId, firstMerchantId]}                     | ${4}
      ${731}       | ${2}                    | ${[0, 300]}             | ${[false, false]}      | ${'voucherApi'}    | ${[secondMerchantId, firstMerchantId]}                     | ${4}
      ${745}       | ${2}                    | ${[0, 0]}               | ${[true, false]}       | ${'voucherApi'}    | ${[secondMerchantId, firstMerchantId]}                     | ${4}
    `('Invoice for $pointsToUse points on $numberOfTransactions txs using $reserveVoucherBy', ({ pointsToUse, numberOfTransactions, distribution, reserveVoucherBy, voucherUsages, merchantIds, expectedInvoiceItems }) => {
      let loyaltyTransactionId: number = 0
      let targetVoucherId: number = 0

      if (distribution.length !== numberOfTransactions) {
        throw Error('Invalid test suite setting! numberOfTransactions mismatched distribution array')
      }
      if (voucherUsages.length !== numberOfTransactions) {
        throw Error('Invalid test suite setting! numberOfTransactions mismatched voucherUsages array')
      }
      if (merchantIds.length !== numberOfTransactions) {
        throw Error('Invalid test suite setting! numberOfTransactions mismatched merchantIds array')
      }
  
      it('prepare loyalty points', async () => {
        const tx = await pos.submitLoyaltyTransaction(new PerxLoyaltyTransactionRequest(
          userAccount,
          +testableLoyaltyProgramIdOnPerxServer,
          pointsToUse,
          null,
          {},
        ))
        expect(tx).toBeTruthy()
        expect(tx.loyaltyProgramId).toEqual(+testableLoyaltyProgramIdOnPerxServer)
  
        const reserved = await pos.reserveLoyaltyPoints(new PerxLoyaltyTransactionReservationRequest(
          userAccount,
          +testableLoyaltyProgramIdOnPerxServer,
          pointsToUse,
        ))
  
        loyaltyTransactionId = reserved.id
      })
  
      if (reserveVoucherBy === 'voucherApi') {
        it(`prepare reward to be redeem by Voucher APIs`, async () => {
          const voucher = await user.issueReward(sourceRewardId)
          expect(voucher).toBeTruthy()
          expect(voucher.issuedDate).toBeTruthy()
          expect(voucher.id).toBeTruthy()
          targetVoucherId = voucher.id
    
          const reservedVochers = await user.reserveVouchers([ `${voucher.id}` ])
          expect(reservedVochers).toBeInstanceOf(Array)
          expect(reservedVochers.length).toEqual(1)
          expect(reservedVochers[0].id).toEqual(+targetVoucherId)
          expect(reservedVochers[0].state).toEqual('redemption_in_progress')
        })
      } else {
        it(`prepare reward to redeem by Reward APIs`, async () => {
          const voucher = await user.reserveReward(sourceRewardId)
          expect(voucher).toBeTruthy()
          expect(voucher.id).toBeTruthy()

          const issuedVoucher = await user.confirmReservedReward(`${voucher.id}`)
          expect(issuedVoucher).toBeTruthy()
          expect(issuedVoucher.id).toEqual(voucher.id)

          const reservedVochers = await user.reserveVouchers([ `${voucher.id}` ])
          expect(reservedVochers).toBeInstanceOf(Array)
          expect(reservedVochers.length).toEqual(1)
          expect(reservedVochers[0].id).toEqual(issuedVoucher.id)
          
          targetVoucherId = reservedVochers[0].id
        })
      }
  
      it('can confirm by single invoice API', async () => {
        const txs: PerxInvoiceRequestTransactionData[] = []
        for (let i=0;i<numberOfTransactions;i++) {
          txs.push(new PerxInvoiceRequestTransactionData(3000, merchantIds[i], {
            appliedPoints: distribution[i],
            appliedVouchers: voucherUsages[i] ? [targetVoucherId] : [],
            properties: {
              test: `MERC: ${merchantIds}, PNTS: ${distribution[i]}, VCHR?: ${voucherUsages[i] ? 'YES' : 'NOPE'}`,
            }
          }))
        }
        const req = new PerxInvoiceRequest(userAccount)
          .addTransactions(...txs)
          .used(
            PerxInvoiceRequestUsedItem.points(loyaltyTransactionId),
            PerxInvoiceRequestUsedItem.reward(targetVoucherId),
          )

        const result = await pos.createInvoice(req)
        expect(result).toBeTruthy()
        expect(result.data.invoiceItems).toBeInstanceOf(Array)
        expect(result.data.invoiceItems.length).toEqual(expectedInvoiceItems)
      })
    })
  }

  describe('identifier', () => {
    it('can assureToken with identifier', async () => {
      const resp = await manager.assureToken({
        type: 'identifier',
        identifier: testableUserIdentifierOnPerxServer,
      })
      expect(resp.accessToken).toBeTruthy()
    })
  })

  describe('campaign', () => {
    if (testableGameId) {
      const campaignIds = testableGameId.split(',').map(Number)
      it(`can list campaign with campaign type = game`, async () => {
        const listCampaign = await user.listAllCampaign(1, 50, 'game')
        const resultCampaignIds = listCampaign.data.map(o => o.id)
        expect(listCampaign.data.length).toBeGreaterThan(1)
        expect(listCampaign.data.filter((o) => o instanceof PerxCampaign).length).toBeGreaterThan(1)
        expect(uniq(listCampaign.data.map((o) => o.id).filter(Boolean)).length).toBeGreaterThan(1)
        expect(listCampaign.error).toBe(undefined)
        if (campaignIds) {
          const doArraysIntersect = (array1: number[], array2:number[]) => array1.some(item1 => array2.includes(item1))
          expect(doArraysIntersect(resultCampaignIds, campaignIds)).toBe(true)
        }
      })

      it(`can get campaign by campaignId`, async () => {
        if (campaignIds) {
          for (const id of campaignIds) {
            const campaignData = await user.getCampaign(id)
            expect(campaignData).toBeTruthy()
            expect(campaignData.id).toEqual(id)
          }
        }
      })
    }
  })
})