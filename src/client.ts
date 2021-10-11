import type { PerxConfig } from './config'

import { Serialize } from 'cerialize'
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
  PerxCategory,
  PerxVoucherState,
  PerxRewardReservation,
  PerxRewardReservationResponse,
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
}

export interface IPerxUserService {

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
    * Release locked voucher from PerxService
    * 
    * @param userToken 
    * @param voucherId 
    */
  releaseVoucher(userToken: string, voucherId: number | string): Promise<PerxVoucher>
 
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
  queryLoyaltyTransactionsHistory(userToken: string, page: number, perPage: number): Promise<PerxLoyaltyTransactionsHistoryResponse>
}

export interface IPerxPosService {

  /**
   * Burn/Earn loyalty transaction (See static methods of `PerxLoyaltyTransactionRequest`)
   * construct the request to make Burn/Earn transaction.
   * 
   * @param applicationToken 
   * @param request 
   */
  submitLoyaltyTransaction(applicationToken: string, request: PerxLoyaltyTransactionRequest): Promise<PerxLoyaltyTransaction>

  /**
   * Submit new transaction to perx service via POS Access.
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
}

export type IPerxService = IPerxAuthService & IPerxUserService & IPerxPosService

export class PerxService implements IPerxService {

  private axios: AxiosInstance

  /**
   * Create perx service
   *
   * @param config 
   */
  public constructor(public readonly config: PerxConfig, public readonly debug: 'request' | 'response' | 'all' | 'none' = 'none') {
    this.axios = axios.create({
      baseURL: this.config.baseURL,
      validateStatus: (status: number) => status < 450,     // all statuses are to be parsed by service layer.
    })
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

  public async releaseVoucher(userToken: string, voucherId: string | number): Promise<PerxVoucher> {
    if (!/^\d+$/.test(`${voucherId}`)) {
      throw PerxError.badRequest(`Invalid voucherId: ${voucherId}, expected voucherId as integer`)
    }
    const resp = await this.axios.patch(`/v4/vouchers/${voucherId}/release`, {}, {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {}
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, VoucherResponse)
    return result.data
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

  public async queryLoyaltyTransactionsHistory(userToken: string, page: number, perPage: number): Promise<PerxLoyaltyTransactionsHistoryResponse> {
    const resp = await this.axios.get('/v4/loyalty/transactions_history', {
      headers: {
        authorization: `Bearer ${userToken}`,
      },
      params: {
        page,
        size: perPage,
      }
    })

    const result = BasePerxResponse.parseAndEval(resp.data, resp.status, PerxLoyaltyTransactionsHistoryResponse)
    return result
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
}