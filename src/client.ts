import type { PerxConfig } from './config'

import { Deserialize, Serialize } from 'cerialize'
import axios, { AxiosInstance } from 'axios'

import { PerxError } from './error'

import {
  BasePerxResponse,
  PerxRewardsResponse,
  TokenResponse,
  VoucherResponse,
  PerxVouchersResponse,
  PerxVoucher,
  PerxLoyalty,
  LoyaltyProgramResponse,
  LoyaltyProgramsResponse,
  PerxCustomer,
  PerxCustomerResponse,
  PerxTransaction,
  PerxTransactionReqeust,
  PerxTransactionResponse,
  PerxLoyaltyTransactionRequest,
  PerxLoyaltyTransaction,
  PerxLoyaltyTransactionResponse,
  PerxLoyaltyTransactionsHistoryResponse,
  PerxRewardSearchResultResponse,
  PerxCategoriesResultResponse,
  PerxVoucherState,
  PerxRewardReservation,
  PerxRewardReservationResponse,
  PerxLoyaltyTransactionRequestUserAccount,
  PerxLoyaltyTransactionReservationRequest,
  IdObjectResponse,
  PerxInvoiceRequest,
  PerxInvoiceCreationResponse,
  BearerTokenResponse,
  PerxMerchantInfoResponse,
  MerchantInfo,
  PerxRewardResponse,
  PerxVoucherResponse,
  PerxMerchant,
  PerxMerchantResponse,
  PerxMerchantsResponse,
  PerxCampaign,
  PerxCampaignResponse,
  PerxCampaignsResponse,
} from './models'

export interface PerxVoucherScope {
  size: number
  page: number
  sortBy: 'issued_date' | 'valid_to'
  order: 'asc' | 'desc'
  state: PerxVoucherState
  type: 'active' | 'all' | 'expired' | 'gifted' | 'redeemed' | 'redemption_in_progress'
}

export interface PerxRewardScope {

  /**
   * Page's sequence start with 1 *NOT* 0.
   */
  page: number

  /**
   * How much should Perx retrieve per page
   */
  pageSize: number

  /**
   * Category's Name
   * 
   * !warning: This is not exact match search!
   */
  categoryNamePrefix: string

  /**
   * mapped to: `filter_for_catalogs`
   * !warning: from manualy testing The API doesn't support multiple value
   */
  catalogId: string

  /**
   * mapped to: `filter_for_brands`
   * !warning: from manualy testing The API doesn't support multiple vlaue
   */
  brandId: string

  /**
   * tagIds to apply against
   */
  tagIds: string[]

  /**
   * translated to: `filter_by_points_balance` // undefined or none
   */
  filterByPointsBalance: boolean

  /**
   * translated to: `filter_for_merchants`
   * !warning: from manualy testing The API doesn't support multiple value
   */
  filterForMerchants: string

  /**
   * Sorting
   */
  sortBy: 'name' | 'id' | 'updated_at' | 'begins_at' | 'ends_at'

  /**
   * sortBy's order
   */
  order: 'asc' | 'desc'
}

export interface IPerxAuthService {
  /**
   * Issue the token by assuming role of user (customer).
   * 
   * @param userIdentifier 
   */
   getUserToken(userIdentifier: string): Promise<TokenResponse>

   /**
    * Issue the application's token
    */
   getApplicationToken(): Promise<TokenResponse>

   /**
    * 
    * @param merchantIdentifier 
    */
   getMerchantBearerToken(merchantIdentifier: string): Promise<BearerTokenResponse>
}

export interface IPerxUserService {

  /**
   * Get single reward by id
   * 
   * @param userToken 
   * @param rewardId 
   */
  getReward(userToken: string, rewardId: number): Promise<PerxRewardResponse>

  /**
   * List rewards for specific user
   * 
   * @param userToken 
   * @param scope 
   */
  getRewards(userToken: string, scope: Partial<PerxRewardScope>): Promise<PerxRewardsResponse>

  /**
   * Search rewards for that matched the keyword
   * 
   * @param userToken 
   * @param keyword keyword to search
   * @param page start with 1
   * @param size page size to load results
   */
  searchRewards(userToken: string, keyword: string, page: number, size: number): Promise<PerxRewardSearchResultResponse>
  
  /**
   * Reserve reward for particular user
   * 
   * This API can be commit and release by saving the id generated `ReservationId`, and use it to corresponding APIs
   * 
   * @param userToken 
   * @param rewardId
   */
  reserveReward(userToken: string, rewardId: string): Promise<PerxRewardReservation>

  /**
   * Reserve reward for particular user
   * 
   * This API can be commit and release by saving the id generated `ReservationId`, and use the corresponding APIs
   * 
   * @param userToken 
   * @param rewardId 
   * @param timeoutInMs 
   */
  reserveReward(userToken: string, rewardId: string, timeoutInMs: number): Promise<PerxRewardReservation>

  /**
   * Release reward's reservation with its id.
   * 
   * Reservation ID is generated from reserveReward() API
   * 
   * @param userToken 
   * @param reservationId 
   */
  releaseRewardReservation(userToken: string, reservationId: string): Promise<PerxVoucher>

  /**
   * Confirm reward's reservation with its id.
   * 
   * Reservation ID is generated from reserveReward() API
   * 
   * @param userToken 
   * @param reservationId 
   */
  confirmRewardReservation(userToken: string, reservationId: string): Promise<PerxVoucher>
 
   /**
    * Issue a voucher from particular reward for specific user
    *
    * @param userToken 
    * @param rewardId 
    */
  issueVoucher(userToken: string, rewardId: number | string): Promise<PerxVoucher>
 
  /**
   * Get single voucher by Id
   *
   * @param userToken 
   * @param voucherId 
   */
  getVoucher(userToken: string, voucherId: number): Promise<PerxVoucherResponse>

   /**
    * List vouchers for specific users
    * 
    * @param userToken
    * @param scope 
    */
  getVouchers(userToken: string, scope: Partial<PerxVoucherScope>): Promise<PerxVouchersResponse>
 
   /**
    * Redeem the voucher with specific voucherId and pass confirm boolean flag
    * 
    * For 2 phase action
    * if confirm flag = false, to reserve
    * if confirm flag = true, to confirm
    * 
    * For single shot
    * if confirm flag = undefined, to confirm right away
    * 
    * @param userToken 
    * @param voucherId 
    * @param confirm 
    * @returns 
    */
  redeemVoucher(userToken: string, voucherId: number | string): Promise<PerxVoucher>
  redeemVoucher(userToken: string, voucherId: number | string, confirm: boolean): Promise<PerxVoucher>
 
  /**
   * Query perx loyalty points
   */
  getLoyaltyProgram(userToken: string, loyaltyProgramId: string | number): Promise<PerxLoyalty>
 
 
  /**
   * Query perx loyalty list
   */
  getLoyaltyPrograms(userToken: string): Promise<PerxLoyalty[]>

   /**
    * Fetch specific perx's customer
    * 
    * @param userToken
    * @param customerId
    */
  getCustomer(userToken: string, customerId: string | number): Promise<PerxCustomer>

   /**
    * Fetch myself as customer
    * 
    * @param userToken
    */
  getMe(userToken: string): Promise<PerxCustomer>

  /**
   * List all existing categories
   * 
   * @param userToken 
   * @param parentId list categories with specific parentId null to list all.
   */
  getCategories(userToken: string, parentId: number | null, page: number, size: number): Promise<PerxCategoriesResultResponse>

  /**
   * Fetch customer's transaction history from Perx's service
   * 
   * @param userToken
   * @param page start with 1
   * @param perPage desinate the page size
   */
  queryLoyaltyTransactionsHistory(userToken: string, page: number, perPage: number, transactionReference?: string): Promise<PerxLoyaltyTransactionsHistoryResponse>

  /**
   * Query all merchants from Perx
   * @param  {boolean} favorite
   * @param  {number} perPage
   * @returns
   */
  listAllMerchants(userToken: string, page: number, perPage: number, favorite: boolean | undefined): Promise<PerxMerchantsResponse>

  /**
   * Query merchants by merchant id from Perx
   * @param  {number} merchantId
   * @param  {boolean} favorite
   * @returns
   */
  getMerchant(userToken: string, merchantId: number): Promise<PerxMerchant>

  /**
   * Execute custom trigger on Perx with specific user.
   * 
   * This API is fire & forget API. No response is provided. 
   * However invalid key will be responsed with Axios error (400 Bad Request)
   * 
   * @param userToken 
   * @param perxCustomTriggerId 
   */
  performCustomTrigger(userToken: string, perxCustomTriggerId: string): Promise<void>

  /**
   * Query all campaign from Perx
   * @param userToken 
   * @param page 
   * @param perPage 
   * @param campaignType 
   */
  listAllCampaign(userToken: string, page: number, perPage: number, campaignType: string | undefined): Promise<PerxCampaignsResponse>

  /**
   * Query campaign by campaign id from Perx
   * @param userToken 
   * @param campaignId 
   */
  getCampaign(userToken: string, campaignId: number): Promise<PerxCampaign>
}

export interface IPerxPosService {

  /**
   * @param userToken 
   * @param voucherId
   */
  posReleaseReservedVoucher(applicationToken: string, voucherId: number | string): Promise<PerxVoucher>

  /**
   * POS operation, create invoice based on given request.
   * 
   * @param applicationToken 
   * @param request 
   */
  posCreateInvoice(applicationToken: string, request: PerxInvoiceRequest): Promise<PerxInvoiceCreationResponse>

  /**
   * Burn/Earn loyalty transaction (See static methods of `PerxLoyaltyTransactionRequest`)
   * construct the request to make Burn/Earn transaction.
   * 
   * @param applicationToken 
   * @param request 
   */
  submitLoyaltyTransaction(applicationToken: string, request: PerxLoyaltyTransactionRequest): Promise<PerxLoyaltyTransaction>

  /**
   * Reserve amount of Loyalty points to be confirm
   * 
   * @param applicationToken 
   * @param request 
   */
  reserveLoyaltyPoints(applicationToken: string, request: PerxLoyaltyTransactionReservationRequest): Promise<PerxLoyaltyTransaction>

  /**
   * Reserve amount of Loyalty points to be confirm
   * 
   * @param applicationToken 
   * @param request 
   * @param loyaltyTransactionId that holding the value to release
   */
  releaseLoyaltyPoints(applicationToken: string, account: PerxLoyaltyTransactionRequestUserAccount, transactionId: string): Promise<boolean>

  /**
   * Submit new transaction to perx service via POS Access.
   * 
   * An Amount Transaction should be submitted here.
   * 
   * @param transaction 
   */
  submitTransaction(applicationToken: string, transaction: PerxTransactionReqeust): Promise<PerxTransaction>

  /**
   * get customer detail via POS Access.
   * 
   * @param userId
   */
  getCustomerDetail(applicationToken: string, userId: number): Promise<PerxCustomer>

  /**
   * Create merchant object via POS Access.
   * 
   * @param applicationToken 
   * @param username 
   * @param email 
   * @param merchantAccountId 
   */
  createMerchantInfo(applicationToken: string, username: string, email: string, merchantAccountId: number): Promise<MerchantInfo>
}

export type IPerxService = IPerxAuthService & IPerxUserService & IPerxPosService & { clone(lang: string): IPerxService }

export class PerxService implements IPerxService {

  private axios: AxiosInstance

  public clone(lang: string): PerxService {
    return new PerxService({
      ...this.config,
      lang,
    }, this.debug)
  }

  /**
   * Create perx service
   *
   * @param config 
   */
  public constructor(public readonly config: PerxConfig, public readonly debug: ((axios: AxiosInstance) => void) | 'request' | 'response' | 'all' | 'none' = 'none') {
    this.axios = axios.create({
      baseURL: this.config.baseURL,
      headers: config.lang && {
        'Accept-Language': config.lang,
      } || {},
      validateStatus: (status: number) => status < 450,     // all statuses are to be parsed by service layer.
    })
    if (typeof debug === 'function') {
      debug(this.axios)
    }
    if (debug === 'request' || debug === 'all') {
      this.axios.interceptors.request.use((config) => {
        console.log(`REQ> ${config.url}`, config)
        return config
      })
    }
    if (debug === 'response' || debug === 'all') {
      this.axios.interceptors.response.use((resp) => {
        console.log(`RESP< ${resp.config.url}`, resp.data)
        return resp
      })
    }
  }

  /**
   * Find and create the userToken
   *
   * @param userIdentifier 
   */
  public async getUserToken(userIdentifier: string): Promise<TokenResponse> {
    const resp = await this.axios.post('/v4/oauth/token', {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'client_credentials',
      scope: `user_account(identifier:${userIdentifier})`,
      expires_in: this.config.tokenDurationInSeconds, // Expires it actually expire for 5 minutes
    })

    if (resp.status == 401) {
      throw PerxError.unauthorized()
    }

    return BasePerxResponse.parseAndEval(resp.data, resp.status, TokenResponse)
  }

  public async getMerchantBearerToken(merchantIdentifier: string): Promise<BearerTokenResponse> {
    const resp = await this.axios.post('/v4/oauth/token', {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'client_credentials',
      identifier: merchantIdentifier,
      scope: `merchant_user_account`,
    })

    if (resp.status == 401) {
      throw PerxError.unauthorized()
    }

    const r = Deserialize(resp.data, BearerTokenResponse)
    if (!r) {
      throw PerxError.serverRejected('Cannot create bearer token', 'no data converted')
    }
    return r
  }

  public async getCustomerDetail(applicationToken: string, userId: number): Promise<PerxCustomer> {
    const resp = await this.axios.get(`/v4/pos/user_accounts/${userId}`, {
      headers: {
        authorization: `Bearer ${applicationToken}`,
      },
    })
    if (resp.status == 401) {
      throw PerxError.unauthorized()
    }
    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxCustomerResponse)
    return result.data
  }

  public async getApplicationToken(): Promise<TokenResponse> {
    const resp = await this.axios.post('/v4/oauth/token', {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'client_credentials',
    })

    if (resp.status == 401) {
      throw PerxError.unauthorized()
    }

    return BasePerxResponse.parseAndEval(resp.data, resp.status, TokenResponse)
  }

  public async getReward(userToken: string, rewardId: number): Promise<PerxRewardResponse> {
    const resp = await this.axios.get(`/v4/rewards/${rewardId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxRewardResponse)
    return result
  }

  public async getRewards(userToken: string, scope: Partial<PerxRewardScope>): Promise<PerxRewardsResponse> {
    const params = PerxService.fromRewardsScopeToQueryParams(scope)
    const resp = await this.axios.get('/v4/rewards', {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params,
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxRewardsResponse)
    return result
  }

  public async issueVoucher(userToken: string, rewardId: number | string): Promise<PerxVoucher> {
    if (!/^\d+$/.test(`${rewardId}`)) {
      throw PerxError.badRequest(`Invalid rewardId: ${rewardId}, expected rewardId as integer`)
    }
    const resp = await this.axios.post(`/v4/rewards/${rewardId}/issue`, {}, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, VoucherResponse)
    return result.data
  }

  public async getVoucher(userToken: string, voucherId: number): Promise<PerxVoucherResponse> {
    const resp = await this.axios.get(`/v4/vouchers/${voucherId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxVoucherResponse)
    return result
  }

  public async getVouchers(userToken: string, scope: Partial<PerxVoucherScope>): Promise<PerxVouchersResponse> {
    const resp = await this.axios.get('/v4/vouchers', {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {
        size: scope?.size || 24,
        page: scope?.page || 1,
        state: scope.state || undefined,
        type: scope.type || undefined,
        sort_by: scope.sortBy || undefined,
        order: scope.order || undefined,
      },
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxVouchersResponse)
    return result
  }

  public async reserveReward(userToken: string, rewardId: string, timeoutInMs: number = 900 * 1000): Promise<PerxRewardReservation> {
    if (!/^\d+$/.test(`${rewardId}`)) {
      throw PerxError.badRequest(`Invalid rewardId: ${rewardId}, expected rewardId as integer`)
    }
    const resp = await this.axios.post(`/v4/rewards/${rewardId}/reserve`, {}, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {
        timeout: timeoutInMs,
      }
    })
  
    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxRewardReservationResponse)
    return result.data
  }

  public async releaseRewardReservation(userToken: string, reservationId: string): Promise<PerxVoucher> {
    if (!/^\d+$/.test(`${reservationId}`)) {
      throw PerxError.badRequest(`Invalid reservationId: ${reservationId}, expected reservationId as integer`)
    }
    const resp = await this.axios.patch(`/v4/vouchers/${reservationId}/release`, {}, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {}
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, VoucherResponse)
    return result.data
  }

  public async confirmRewardReservation(userToken: string, reservationId: string): Promise<PerxVoucher> {
    if (!/^\d+$/.test(`${reservationId}`)) {
      throw PerxError.badRequest(`Invalid reservationId: ${reservationId}, expected reservationId as integer`)
    }
    const resp = await this.axios.patch(`/v4/vouchers/${reservationId}/confirm`, {}, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {}
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, VoucherResponse)
    return result.data
  }

  public async redeemVoucher(userToken: string, voucherId: string | number, confirm: boolean | undefined = undefined): Promise<PerxVoucher> {
    if (!/^\d+$/.test(`${voucherId}`)) {
      throw PerxError.badRequest(`Invalid voucherId: ${voucherId}, expected voucherId as integer`)
    }
    const resp = await this.axios.post(`/v4/vouchers/${voucherId}/redeem`, {}, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {
        confirm,
      }
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, VoucherResponse)
    return result.data
  }

  public async posReleaseReservedVoucher(applicationToken: string, voucherId: string | number): Promise<PerxVoucher> {
    if (!/^\d+$/.test(`${voucherId}`)) {
      throw PerxError.badRequest(`Invalid voucherId: ${voucherId}, expected voucherId as integer`)
    }
    const resp = await this.axios.put(`/v4/pos/vouchers/${voucherId}/revert_redemption`, {}, {
      headers: {
        authorization: `Bearer ${applicationToken}`,
      },
      params: {
      }
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, VoucherResponse)
    return result.data
  }

  /**
   * According to Perx's response, this API doesn't response any payload.
   * 
   * This API is fire & forget.
   * 
   * @param userToken 
   * @param perxCustomTriggerId 
   * @returns nothing
   */
  public async performCustomTrigger(userToken: string, perxCustomTriggerId: string): Promise<void> {
    const resp = await this.axios.put(`/v4/app_triggers/${perxCustomTriggerId}`, {}, {
      headers: {
        authorization: `Bearer ${userToken}`,
      }
    })
    // Just eval for error if status is not 200
    if (resp && resp.data && resp.status >= 400) {
      BasePerxResponse.parseAndEval(resp.data, resp.status, BasePerxResponse)
    }
    return
  }

  public async getLoyaltyProgram(userToken: string, loyaltyProgramId: string | number): Promise<PerxLoyalty> {
    if (!/^\d+$/.test(`${loyaltyProgramId}`)) {
      throw PerxError.badRequest(`Invalid loyaltyProgramId: ${loyaltyProgramId}, expected loyaltyProgramId as integer`)
    }
    const resp = await this.axios.get(`/v4/loyalty/${loyaltyProgramId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {}
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, LoyaltyProgramResponse)
    return result.data
  }

  public async getLoyaltyPrograms(userToken: string): Promise<PerxLoyalty[]> {
    const resp = await this.axios.get('/v4/loyalty', {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {}
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, LoyaltyProgramsResponse)
    return result.data
  }

  public async getMe(userToken: string): Promise<PerxCustomer> {
    return this.getCustomer(userToken, 'me')
  }

  public async getCustomer(userToken: string, customerId: string | number = 'me'): Promise<PerxCustomer> {
    if (!/^(me|\d+)$/.test(`${customerId}`)) {
      throw PerxError.badRequest(`Invalid customerId: ${customerId}, expected customer as integer`)
    }
    const resp = await this.axios.get(`/v4/customers/${customerId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {}
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxCustomerResponse)
    return result.data
  }

  public async submitTransaction(applicationToken: string, transaction: PerxTransactionReqeust): Promise<PerxTransaction> {
    const body = Serialize(transaction)
    const resp = await this.axios.post('/v4/pos/transactions', body, {
      headers: {
        authorization: `Bearer ${applicationToken}`,
      },
      params: {}
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxTransactionResponse)
    return result.data
  }

  public async submitLoyaltyTransaction(applicationToken: string, request: PerxLoyaltyTransactionRequest): Promise<PerxLoyaltyTransaction> {
    const body = Serialize(request)
    const resp = await this.axios.post('/v4/pos/loyalty_transactions', body, {
      headers: {
        authorization: `Bearer ${applicationToken}`,
      },
      params: {}
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxLoyaltyTransactionResponse)
    return result.data
  }

  public async reserveLoyaltyPoints(applicationToken: string, request: PerxLoyaltyTransactionReservationRequest): Promise<PerxLoyaltyTransaction> {
    const body = Serialize(request)
    const resp = await this.axios.post('/v4/pos/loyalty_transactions/reserve', body, {
      headers: {
        authorization: `Bearer ${applicationToken}`,
      },
      params: {}
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxLoyaltyTransactionResponse)
    return result.data
  }

  public async releaseLoyaltyPoints(applicationToken: string, account: PerxLoyaltyTransactionRequestUserAccount, transactionId: string): Promise<boolean> {
    const accountBody = Serialize(account)
    const resp = await this.axios.put(`/v4/pos/loyalty_transactions/${transactionId}/revert_redemption`, {
      user_account: accountBody,
    }, {
      headers: {
        authorization: `Bearer ${applicationToken}`,
      },
      params: {}
    })
    
    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, IdObjectResponse)
    return result.data.id === transactionId
  }

  public async posCreateInvoice(applicationToken: string, request: PerxInvoiceRequest): Promise<PerxInvoiceCreationResponse> {
    const body = Serialize(request)
    const resp = await this.axios.post('/v4/pos/invoices', body, {
      headers: {
        authorization: `Bearer ${applicationToken}`,
      },
    })
  
    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxInvoiceCreationResponse)
    return result
  }

  public async searchRewards(userToken: string, keyword: string, page: number, size: number): Promise<PerxRewardSearchResultResponse> {
    const resp = await this.axios.get('/v4/search', {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {
        search_string: keyword,
        page,
        size,
      }
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxRewardSearchResultResponse)
    return result
  }

  public async getCategories(userToken: string, parentId: number | null, page: number, size: number): Promise<PerxCategoriesResultResponse> {
    const resp = await this.axios.get('/v4/categories', {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {
        ...(parentId && { parent_id: parentId } || {}),
        page,
        size,
      }
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxCategoriesResultResponse)
    return result
  }

  public async queryLoyaltyTransactionsHistory(userToken: string, page: number, perPage: number, transactionReference?: string): Promise<PerxLoyaltyTransactionsHistoryResponse> {
    const resp = await this.axios.get('/v4/loyalty/transactions_history', {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {
        page,
        size: perPage,
        transaction_reference: transactionReference,
      }
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxLoyaltyTransactionsHistoryResponse)
    return result
  }

  public async listAllMerchants(userToken: string, page: number,  perPage: number, favorite: boolean | undefined = undefined): Promise<PerxMerchantsResponse> {
    const resp = await this.axios.get('/v4/merchants', {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {
        favorite,
        page,
        size: perPage,
      }
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxMerchantsResponse)
    return result
  }

  public async getMerchant(userToken: string, merchantId: number): Promise<PerxMerchant> {
    const resp = await this.axios.get(`/v4/merchants/${merchantId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxMerchantResponse)
    return result.data
  }

  public async createMerchantInfo(applicationToken: string, username: string, email: string, merchantAccountId: number): Promise<MerchantInfo> {
    const resp = await this.axios.post('/v4/pos/merchant_user_accounts', {
      username,
      email,
      merchant_account_id: merchantAccountId,
    }, {
      headers: {
        authorization: `Bearer ${applicationToken}`,
      },
    })
    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxMerchantInfoResponse)
    return result.data
  }

  private static fromRewardsScopeToQueryParams(scope: Partial<PerxRewardScope>): Record<string, string | string[]> {
    const out: Record<string, string | string[]> = {}
    if (scope.catalogId) {
      out.filter_for_catalogs = scope.catalogId
    }
    if (scope.tagIds) {
      out.tag_ids = scope.tagIds
    }
    if (scope.filterByPointsBalance) {
      out.filter_by_points_balance = 'true'
    }
    if (scope.brandId) {
      out.filter_for_brands = scope.brandId
    }
    if (scope.sortBy) {
      out.sort_by = scope.sortBy
    }
    if (scope.order) {
      out.order_by = scope.order
    }
    if (scope.categoryNamePrefix) {
      out.categories = scope.categoryNamePrefix
    }
    if (scope.page) {
      out.page = `${scope.page}`
    }
    if (scope.pageSize) {
      out.size = `${scope.pageSize}`
    }
    if (scope.filterForMerchants) {
      out.filter_for_merchants = scope.filterForMerchants
    }
    return out
  }

  public async listAllCampaign(userToken: string, page: number, perPage: number, campaignType: string | undefined = undefined): Promise<PerxCampaignsResponse> {
    const resp = await this.axios.get('/v4/campaigns', {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {
        page,
        size: perPage,
        campaign_type: campaignType || undefined
      }
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxCampaignsResponse)

    if (result.data) {
      result.data.forEach((p) => p.configMicrositeContext(userToken, this.config.microSiteBaseUrl || ''))
    }
    return result
  }

  public async getCampaign(userToken: string, campaignId: number): Promise<PerxCampaign> {
    const resp = await this.axios.get(`/v4/campaigns/${campaignId}`, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxCampaignResponse)
    if (result.data) {
      result.data.configMicrositeContext(userToken, this.config.microSiteBaseUrl || '')
    }
    return result.data
  }
}