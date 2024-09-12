import { autoserializeAs, Deserialize, inheritSerialization } from 'cerialize'
import {
  isArray,
  get,
} from 'lodash'
import { MerchantInfo, PerxCategory, PerxInvoice, PerxLoyaltyTransactionHistoryEntry, PerxRewardReservation } from '.'
import { PerxError } from '../error'
import { PerxCustomer } from './Customer'
import { PerxLoyalty } from './LoyaltyProgram'
import { PerxLoyaltyTransaction } from './LoyaltyTransaction'
import { PerxReward } from './Reward'
import { PerxRewardSearchResult } from './SearchResult'
import { PerxTransaction } from './Transaction'
import { PerxVoucher } from './Voucher'
import { PerxMerchant } from './Merchant'
import { PerxCampaign } from './Campaign'

export class BasePerxResponse {

  @autoserializeAs('error')
  protected errorCode?: string

  @autoserializeAs('error_description')
  protected errorDescription?: string

  public get hasError(): boolean {
    return Boolean(this.error)
  }

  protected afterDeserialized(json: any) {
  }

  public get error(): Error | undefined {
    if (this.errorCode || this.errorDescription) {
      const errorCode = this.errorCode || 'no-error-code'
      const errorDescritpion = this.errorDescription || 'no-error-description'
      return PerxError.serverRejected(errorCode, errorDescritpion)
    }
    return undefined
  }

  /**
   * Parse JSON response and Evaluate the result.
   * throws if error shown
   * 
   * @param json 
   * @param cnstr 
   * @returns 
   */
  public static parseAndEval<T extends BasePerxResponse>(json: any, httpStatus: number, cnstr: new () => T): T {
    if (!json) {
      throw PerxError.networkFailed(httpStatus)
    }
    const o = Deserialize(json, cnstr) as T
    if (httpStatus >= 400 && json.message) {
      throw PerxError.serverRejected(json.code, json.message)
    }
    o.afterDeserialized(json)
    const err = o.error
    if (err) {
      throw err
    }
    return o
  }
}

/**
 * Support following details
 * {
      "count": 63,
      "size": 10,
      "page": 1,
      "total_pages": 7,
      "order": null,
      "type": null
    }
 */
export class PerxPagingVoucherMeta {
  
  /**
   * Total count of complete query scope
   */
  @autoserializeAs('count')
  count: number = 0

  /**
   * Total count of items within this page
   */
  @autoserializeAs('size')
  size: number = 0

  /**
   * current page
   */
  @autoserializeAs('page')
  page: number = 1

  /**
   * total number of pages
   */
  @autoserializeAs('total_pages')
  totalPages: number = 0

  /**
   * current order sequence
   */
  @autoserializeAs('order')
  order: 'asc' | 'desc' | null = null

  /**
   * Type of query scope used.
   */
  @autoserializeAs('type')
  type: string | null = null
}

export class PerxPagingMeta {
  @autoserializeAs('count')
  count!: number

  @autoserializeAs('size')
  size!: number

  @autoserializeAs('total_pages')
  totalPages!: number

  @autoserializeAs('page')
  page!: number

  @autoserializeAs('current_page')
  currentPage!: number

  @autoserializeAs('per_page')
  perPage!: number

  @autoserializeAs('prev_page')
  prevPage: number | null = null

  @autoserializeAs('next_page')
  nextPage: number | null = null

  @autoserializeAs('total_count')
  totalCount: number | null = null
  
  @autoserializeAs('lat')
  lat: string | null = null

  @autoserializeAs('lng')
  lng: string | null = null

  @autoserializeAs('radius')
  radius: string | null = null

  // Unmapped fields.
  // "filter_for_catalogs": [],
  // "filter_for_brands": [],
  // "filter_for_states": [],
  // "filter_for_cities": [],
  // "filter_for_malls": [],
  // "filter_for_merchants": [],
  // "filter_for_locations": [],
  // "brands_index": [],
  // "states_index": [],
  // "cities_index": [],
  // "malls_index": [],
  // "campaigns_index": [],
  // "catalogues_index": []
}

@inheritSerialization(BasePerxResponse)
export abstract class ObjectPerxResponse<Obj> extends BasePerxResponse {

  data!: Obj

  protected constructor(private cnstr: new () => Obj) {
    super()
  }

  protected afterDeserialized(json: any) {
    const deserialized = Deserialize(json.data, this.cnstr)
    this.data = deserialized
  }
}

@inheritSerialization(BasePerxResponse)
export abstract class ItemListPerxResponse<Item> extends BasePerxResponse {

  protected constructor(
    private cnstr: new () => Item,
    protected readonly dataKeyPath: string = 'data'
  ) {
    super()
  }

  data: Item[] = []

  @autoserializeAs(PerxPagingMeta, 'meta')
  meta!: PerxPagingMeta

  protected afterDeserialized(json: any) {
    const deserialized = Deserialize(get(json, this.dataKeyPath), this.cnstr)
    if (!isArray(deserialized)) {
      throw new Error('Failed to deserialize item entries')
    }
    this.data = deserialized
  }
}

@inheritSerialization(BasePerxResponse)
export class TokenResponse extends BasePerxResponse {

  @autoserializeAs('access_token')
  accessToken!: string

  @autoserializeAs('token_type')
  tokenType!: string

  @autoserializeAs('refresh_token')
  refreshToken: string | null = null

  @autoserializeAs('expires_in')
  expiresIn: number = 0

  @autoserializeAs('scope')
  scope?: string
}

export class BearerTokenResponse {

  /**
   * Error Code
   */
  @autoserializeAs('code')
  code?: number

  /**
   * Error Message
   */
  @autoserializeAs('message')
  message?: string

  @autoserializeAs('bearer_token')
  bearerToken!: string

  @autoserializeAs('tenant')
  tenant!: string

  public get hasError(): boolean {
    return Boolean(this.error)
  }

  protected afterDeserialized(json: any) {
  }

  public get error(): Error | undefined {
    if (this.code || this.message) {
      const errorCode = `${this.code || ''}` || 'no-error-code'
      const errorDescritpion = `$${this.message || ''}` || 'no-error-description'
      return PerxError.serverRejected(errorCode, errorDescritpion)
    }
    return undefined
  }
}

@inheritSerialization(ItemListPerxResponse)
export class PerxRewardsResponse extends ItemListPerxResponse<PerxReward> {
  public constructor() { super(PerxReward) }
}

@inheritSerialization(ObjectPerxResponse)
export class PerxVoucherResponse extends ObjectPerxResponse<PerxVoucher> {
  public constructor() { super(PerxVoucher) }
}

@inheritSerialization(BasePerxResponse)
export class PerxVouchersResponse extends BasePerxResponse {

  @autoserializeAs(PerxVoucher, 'data')
  public data: PerxVoucher[] = []

  @autoserializeAs(PerxPagingVoucherMeta, 'meta')
  meta!: PerxPagingVoucherMeta
}

@inheritSerialization(ObjectPerxResponse)
export class PerxRewardResponse extends ObjectPerxResponse<PerxReward> {
  public constructor() { super(PerxReward) }
}

@inheritSerialization(ObjectPerxResponse)
export class VoucherResponse extends ObjectPerxResponse<PerxVoucher> {
  public constructor() { super(PerxVoucher) }
}

@inheritSerialization(ObjectPerxResponse)
export class LoyaltyProgramResponse extends ObjectPerxResponse<PerxLoyalty> {
  public constructor() { super(PerxLoyalty) }
}

@inheritSerialization(ItemListPerxResponse)
export class LoyaltyProgramsResponse extends ItemListPerxResponse<PerxLoyalty> {
  public constructor() { super(PerxLoyalty) }
}

@inheritSerialization(ObjectPerxResponse)
export class PerxCustomerResponse extends ObjectPerxResponse<PerxCustomer> {
  public constructor() { super(PerxCustomer) }
}

@inheritSerialization(ObjectPerxResponse)
export class PerxTransactionResponse extends ObjectPerxResponse<PerxTransaction> {
  public constructor() { super(PerxTransaction) }
}

@inheritSerialization(ObjectPerxResponse)
export class PerxLoyaltyTransactionResponse extends ObjectPerxResponse<PerxLoyaltyTransaction> {
  public constructor() { super(PerxLoyaltyTransaction) }
}

@inheritSerialization(ItemListPerxResponse)
export class PerxLoyaltyTransactionsHistoryResponse extends ItemListPerxResponse<PerxLoyaltyTransactionHistoryEntry> {
  public constructor() { super(PerxLoyaltyTransactionHistoryEntry) }
}

@inheritSerialization(ItemListPerxResponse)
export class PerxRewardSearchResultResponse extends ItemListPerxResponse<PerxRewardSearchResult> {
  public constructor() { super(PerxRewardSearchResult, 'data.rewards')}
}

@inheritSerialization(ItemListPerxResponse)
export class PerxCategoriesResultResponse extends ItemListPerxResponse<PerxCategory> {
  public constructor() { super(PerxCategory) }
}

@inheritSerialization(ObjectPerxResponse)
export class PerxRewardReservationResponse extends ObjectPerxResponse<PerxRewardReservation> {
  public constructor() { super(PerxRewardReservation) }
}

class IdHolder {
  @autoserializeAs('id')
  id!: string
}

@inheritSerialization(ObjectPerxResponse)
export class IdObjectResponse extends ObjectPerxResponse<IdHolder> {
  public constructor() { super(IdHolder) }
}

@inheritSerialization(ObjectPerxResponse)
export class PerxInvoiceCreationResponse extends ObjectPerxResponse<PerxInvoice> {
  public constructor() { super(PerxInvoice) }
}

@inheritSerialization(ObjectPerxResponse)
export class PerxMerchantInfoResponse extends ObjectPerxResponse<MerchantInfo> {
  public constructor() { super(MerchantInfo) }
}

@inheritSerialization(ObjectPerxResponse)
export class PerxMerchantResponse extends ObjectPerxResponse<PerxMerchant> {
  public constructor() { super(PerxMerchant) }
}

@inheritSerialization(ItemListPerxResponse)
export class PerxMerchantsResponse extends ItemListPerxResponse<PerxMerchant> {
  public constructor() { super(PerxMerchant) }
}

@inheritSerialization(ObjectPerxResponse)
export class PerxCampaignResponse extends ObjectPerxResponse<PerxCampaign> {
  public constructor() { super(PerxCampaign) }
}

@inheritSerialization(ItemListPerxResponse)
export class PerxCampaignsResponse extends ItemListPerxResponse<PerxCampaign> {
  public constructor() { super(PerxCampaign) }
}