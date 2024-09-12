import {
  PerxVoucher,
  PerxRewardScope,
  IPerxService,
  PerxError,
  PerxVoucherScope,
  PerxRewardsResponse,
  PerxCustomer,
  PerxLoyalty,
  PerxLoyaltyTransaction,
  PerxLoyaltyTransactionRequest,
  PerxTransaction,
  PerxTransactionReqeust,
  PerxLoyaltyTransactionsHistoryResponse,
  PerxRewardSearchResultResponse,
  PerxVouchersResponse,
  PerxCategory,
  PerxRewardReservation,
  PerxCategoriesResultResponse,
  PerxLoyaltyTransactionReservationRequest,
  PerxLoyaltyTransactionRequestUserAccount,
  PerxInvoiceRequest,
  PerxInvoiceCreationResponse,
  BearerTokenResponse,
  PerxRewardResponse,
  PerxVoucherResponse,
  PerxMerchantsResponse,
  PerxMerchant,
} from '..'
import { PerxCampaign, PerxCampaignsResponse } from '../models'
import { MerchantInfo } from '../models/MerchantInfo'
import { PerxPosProxy } from './pos'
import { PerxUserProxy } from './user'


export interface PerxId {
  type: 'id'
  id: number
}

export interface PerxIdentifier {
  type: 'identifier'
  identifier: string
}

export type PerxIdentification = PerxId | PerxIdentifier

/**
 * Interface for User Access
 */
export interface IPerxUserProxy {

  /**
   * Get single Reward by Id
   * 
   * @param scope 
   */
  getReward(rewardId: number): Promise<PerxRewardResponse>

  /**
   * List Rewards to be claim
   * 
   * @param scope 
   */
  queryRewards(scope: Partial<PerxRewardScope>): Promise<PerxRewardsResponse>

  /**
   * Search existing Perx's rewards
   * 
   * @param keyword 
   */
  searchRewards(keyword: string): Promise<PerxRewardSearchResultResponse>
  searchRewards(keyword: string, page: number): Promise<PerxRewardSearchResultResponse>
  searchRewards(keyword: string, page: number, size: number): Promise<PerxRewardSearchResultResponse>

  /**
   * List categories within Perx's system
   * page starts with 1
   */
  listCategories(page: number, pageSize: number): Promise<PerxCategoriesResultResponse>

  /**
   * List all perx categories by ParentID
   * @param parentId
   * @param page
   * @param pageSize
   */
  listCategoriesByParentId(parentId: number, page: number, pageSize: number): Promise<PerxCategoriesResultResponse>

  /**
   * List all categories (chaining calls automatically)
   */
  listAllCategories(): Promise<PerxCategory[]>

  /**
   * List all categories (chaining calls automatically)
   * 
   * @param parentId
   */
  listAllCategories(parentId: number): Promise<PerxCategory[]>

  /**
   * Cliam a reward, resulting a Voucher.
   * 
   * @param rewardId
   */
  issueReward(rewardId: string): Promise<PerxVoucher>

  /**
   * Reserve a reward for particular token's owner (expires in 15mins)
   * 
   * WARNING: call this method while there is a reservation of the same
   * Reward exists will not issue a new token for the user. Rather it 
   * will pick current one to return!
   * 
   * @param rewardId
   */
  reserveReward(rewardId: string): Promise<PerxRewardReservation>

  /**
   * Reserve a reward with specific timeout.
   * 
   * WARNING: call this method while there is a reservation of the same
   * Reward exists will not issue a new token for the user. Rather it 
   * will pick current one to return!
   * 
   * @param rewardId
   * @param timeoutInMs
   */
  reserveReward(rewardId: string, timeoutInMs: number): Promise<PerxRewardReservation>

  /**
   * release reserved reward
   * 
   * @param scope 
   */
  releaseReservedReward(rewardId: string): Promise<PerxVoucher>

  /**
   * confirm the the reserved reward
   * 
   * @param scope 
   */
  confirmReservedReward(rewardId: string): Promise<PerxVoucher>

  /**
   * Get single perx voucher from API by Id
   * 
   * @param voucherId 
   */
  getVoucher(voucherId: number): Promise<PerxVoucherResponse>

  /**
   * Listing claimed rewards (vouchers)
   * 
   * @param scope 
   */
  queryVouchers(scope: Partial<PerxVoucherScope>): Promise<PerxVouchersResponse>

  /**
   * Redeem the vouchers without marking/confirming/releasing
   * 
   * @param voucherIds 
   */
  redeemVouchers(voucherIds: string[]): Promise<PerxVoucher[]>

  /**
   * Mark the voucher as redemption in progress (can only be released by `pos.releaseVouchers()`)
   * 
   * @param voucherIds 
   */
  reserveVouchers(voucherIds: string[]): Promise<PerxVoucher[]>

  /**
   * Confirm all vouchers those has been marked with `user.reserveVouchers`.
   * 
   * @param voucherIds
   */
  confirmVouchers(voucherIds: string[]): Promise<PerxVoucher[]>

  /**
   * Query loyalty program from Perx
   * 
   * @param loyaltyProgramId
   * @returns
   */
  getLoyaltyProgram(loyaltyProgramId: number | string): Promise<PerxLoyalty>

  /**
   * Listing loyalty programs from Perx
   * 
   * @returns
   */
  queryLoyaltyPrograms(): Promise<PerxLoyalty[]>

  /**
   * Query Perx transactions history of given user
   * @param page 
   * @param perPage 
   */
  queryTransactionsHistory(): Promise<PerxLoyaltyTransactionsHistoryResponse>
  queryTransactionsHistory(page: number): Promise<PerxLoyaltyTransactionsHistoryResponse>
  queryTransactionsHistory(page: number, perPage: number): Promise<PerxLoyaltyTransactionsHistoryResponse>
  queryTransactionsHistory(page: number, perPage: number, transactionReference?: string): Promise<PerxLoyaltyTransactionsHistoryResponse>

  /**
   * Get perx's self customer identity
   */
  getMe(): Promise<PerxCustomer>

  /**
   * Query all merchants from Perx
   * @param  {number} page
   * @param  {number} perPage
   * @param  {boolean} favorite
   * @returns
   */
  listAllMerchants(page: number, perPage: number): Promise<PerxMerchantsResponse>
  listAllMerchants(page: number, perPage: number, favorite: boolean): Promise<PerxMerchantsResponse>

  /**
   * Query merchants by merchant id from Perx
   * @param  {number} merchantId
   * @param  {boolean} favorite
   * @returns
   */
  getMerchant(merchantId: number): Promise<PerxMerchant>

  /**
   * Execute custom trigger on Perx for specific user.
   * 
   * @param perxCustomTriggerId 
   */
  performCustomTrigger(perxCustomTriggerId: string): Promise<void>

  /**
   * Query all campaign from Perx
   */
  listAllCampaign(page: number, perPage: number): Promise<PerxCampaignsResponse>
  listAllCampaign(page: number, perPage: number, campaignType: string): Promise<PerxCampaignsResponse>

  /**
   * Query campaign by campaign id from Perx
   */
  getCampaign(campaignId: number): Promise<PerxCampaign>

  /**
   * Get user access token
   */
  getToken(): Promise<IPerxToken>
}

/**
 * Interface for POS Access
 */
export interface IPerxPosProxy {

  /**
   * create invoice based on given request.
   * 
   * @param request 
   */
  createInvoice(request: PerxInvoiceRequest): Promise<PerxInvoiceCreationResponse>

  /**
   * Release the reserved vouchers
   * 
   * @param voucherIds 
   */
  releaseVouchers(voucherIds: string[]): Promise<PerxVoucher[]>
  
  /**
   * Hard burn/earn points
   * 
   * @param applicationToken 
   * @param request 
   */
  submitLoyaltyTransaction(request: PerxLoyaltyTransactionRequest): Promise<PerxLoyaltyTransaction>

  /**
   * Reserve the loyalty points give back the `loyaltyTransactionId` that holding the specified loyalty points.
   * 
   * @param request 
   */
  reserveLoyaltyPoints(request: PerxLoyaltyTransactionReservationRequest): Promise<PerxLoyaltyTransaction>

  /**
   * release the loyalty points witheld by specific `loyaltyTransactionId`
   * 
   * @param account 
   * @param loyaltyTransactionId
   */
  releaseLoyaltyPoints(account: PerxLoyaltyTransactionRequestUserAccount, loyaltyTransactionId: string): Promise<boolean>

  /**
   * Submit new transaction to perx service via POS Access.
   * 
   * @param transaction 
   */
  submitTransaction(transaction: PerxTransactionReqeust): Promise<PerxTransaction>

  /**
   * get customer detail via POS Access.
   * 
   * @param userId 
  */
  getCustomerDetail(userId: number): Promise<PerxCustomer>

  /**
   * create customer detail via POS Access.
   */
  createMerchantInfo(username: string, email: string, merchantId: number): Promise<MerchantInfo>
}

/**
 * Interface to wrap usage of Perx regardless of user control.
 */
export interface IPerxProxyManager {

  user(identifier: PerxIdentification, lang: string): IPerxUserProxy

  pos(lang: string): IPerxPosProxy

  merchantBearer(merchantIdentifier: string): Promise<BearerTokenResponse>

  merchantBearer(merchantIdentifier: string, lang: string): Promise<BearerTokenResponse>
}

export interface IPerxToken {
  accessToken: string
}

export interface TokenPool {

  /**
   * Responsible for storing the token with given ttlInMs
   * 
   * @param key 
   * @param token 
   * @param ttlInMs 
   */
  cache(key: string, token: IPerxToken, ttlInMs: number): Promise<void>

  /**
   * Responsible for retriving the token from the cache pool. If
   * the cahced item is invalid, or no longer available return null.
   * 
   * @param key 
   */
  get(key: string): Promise<IPerxToken | null>
}

/**
 * Default implementation of Token pool handler
 * 
 * API consumer can replace this with Other Implementation such as Redis.
 */
export class InMemoryTokenPool implements TokenPool {

  /**
   * !Never access this parameter directly!
   * !use `assureToken` instead.
   */
  private _mem: Record<string, { response: IPerxToken, expiredAt: Date }> = {}

  public async cache(key: string, token: IPerxToken, ttlInMs: number): Promise<void> {
    const nowMs = new Date().getTime()
    this._mem[key] = {
      response: token,
      expiredAt: new Date(nowMs + ttlInMs)
    }
  }

  public async get(key: string): Promise<IPerxToken | null> {
    const nowMs = new Date().getTime()
    const _token = this._mem[key]
    if (_token && _token.expiredAt.getTime() > nowMs) {
      return _token.response
    }
    return null
  }
}

/**
 * 
 */
export class PerxProxyManager implements IPerxProxyManager {

  private _instances: Record<string, IPerxService> = {}

  public constructor(private readonly _masterPerxService: IPerxService, private pool: TokenPool = new InMemoryTokenPool()) {
  }

  private service(lang: string): IPerxService {
    return this._instances[lang] = this._instances[lang] || this._masterPerxService.clone(lang)
  }

  public user(identification: PerxIdentification, lang: string): IPerxUserProxy {
    const user = new PerxUserProxy(() => this.assureToken(identification), this.service(lang))
    return user
  }

  public pos(lang: string): IPerxPosProxy {
    const pos = new PerxPosProxy(() => this.assureApplicationToken(), this.service(lang))
    return pos
  }

  public async merchantBearer(merchantIdentifier: string, lang: string = 'en'): Promise<BearerTokenResponse> {
    return this.service(lang).getMerchantBearerToken(merchantIdentifier)
  }

  /**
   * Use this method to access exposedToken
   * @returns 
   */
  public async assureToken(identification: PerxIdentification, perxService: IPerxService = this.service('en')): Promise<IPerxToken> {
    let identifier: string | null = null

    const key = identification.type === 'id'
      ? `id:${identification.id}`
      : `identifier:${identification.identifier}`
    const _token = await this.pool.get(key)
    if (_token) {
      return _token
    }

    if (identification.type === 'id') {
      const appTokenResp = await this.assureApplicationToken()
      const response = await perxService.getCustomerDetail(appTokenResp.accessToken, identification.id)
      if (response.identifier) {
        identifier = response.identifier
      }
    }

    if (identification.type === 'identifier') {
      identifier = identification.identifier
    }
    if (!identifier) {
      throw PerxError.badRequest('no identifier')
    }

    const response = await perxService.getUserToken(identifier)
    this.pool.cache(key, { accessToken: response.accessToken }, response.expiresIn * 1000)
    return response
  }

  /**
   * Issue the Applciation's level token, cache it.
   * 
   * @param perxService
   * @returns
   */
  public async assureApplicationToken(perxService: IPerxService = this.service('en')): Promise<IPerxToken> {
    const applicationTokenCacheKey = 'application'
    const resp = await this.pool.get(applicationTokenCacheKey)
    if (resp) {
      return resp
    }
    const tokenResp = await perxService.getApplicationToken()
    this.pool.cache(applicationTokenCacheKey, { accessToken: tokenResp.accessToken }, tokenResp.expiresIn * 1000)
    return tokenResp
  }
}