import { autoserializeAs, inheritSerialization } from 'cerialize'
import { ISODateTimeSerializer } from '../utils/cerialize'
import { PerxBaseInvoiceItem, PerxInvoiceItemType } from './Invoice'

export type PerxTransactionRequestDataType = 'purchase' | 'purchase-fix'

/**
 * You may override this class to create your own Custom Transaction Representation.
 */
export class PerxTransactionRequestData {

  @autoserializeAs('transaction_type')
  transactionType: PerxTransactionRequestDataType = 'purchase'

  @autoserializeAs('transaction_reference')
  transactionReference: string

  @autoserializeAs('amount')
  amount: number

  @autoserializeAs('currency')
  currency: string

  @autoserializeAs(ISODateTimeSerializer, 'transaction_date')
  transactionDate: Date

  @autoserializeAs('properties')
  properties: Record<string, string | number>

  public constructor(amount: number, currency: string, transactionReference: string, transactionType: PerxTransactionRequestDataType = 'purchase', properties: Record<string, string | number> = {}, transactionDate: Date = new Date()) {
    this.amount = amount
    this.currency = currency
    this.transactionReference = transactionReference
    this.transactionType = transactionType
    this.transactionDate = transactionDate
    this.properties = properties
  }
}

export class PerxTransactionReqeust {

  @autoserializeAs('user_account_id')
  userAccountId: string

  @autoserializeAs(PerxTransactionRequestData, 'transaction_data')
  transactionData: PerxTransactionRequestData

  public constructor(userAccountId: string, transactionData: PerxTransactionRequestData) {
    this.userAccountId = userAccountId
    this.transactionData = transactionData
  }

  /**
   * Make a valid transaction request object
   * 
   * @param userAccountId
   * @param amount 
   * @param currency 
   * @param transactionReference 
   * @param properties 
   */
  public static makePurchase(userAccountId: string, amount: number, currency: string, transactionReference: string, properties: Record<string, string | number> = {}): PerxTransactionReqeust {
    const data = new PerxTransactionRequestData(amount, currency, transactionReference, 'purchase', properties)
    return new PerxTransactionReqeust(userAccountId, data)
  }
  public static makePurchaseFix(userAccountId: string, amount: number, currency: string, transactionReference: string, properties: Record<string, string | number> = {}, transactionDate: Date): PerxTransactionReqeust {
    const data = new PerxTransactionRequestData(amount, currency, transactionReference, 'purchase-fix', properties, transactionDate)
    return new PerxTransactionReqeust(userAccountId, data)
  }
}

export interface PerxRawUserAccountId {
  type: 'id'
  id: number
}

export interface PerxRawUserAccountIdentifier {
  type: 'identifier'
  identifier: string
}

export type PerxRawUserAccount = PerxRawUserAccountId | PerxRawUserAccountIdentifier

export class PerxLoyaltyTransactionRequestUserAccount {
  @autoserializeAs('identifier')
  identifier?: string

  @autoserializeAs('id')
  id?: number

  public constructor(userAccount: PerxRawUserAccount) {
    if (userAccount.type === 'identifier') {
      this.identifier = userAccount.identifier
    } else {
      this.id = userAccount.id
    }
  }
}

export class PerxLoyaltyTransactionReservationRequest {
  
  @autoserializeAs(PerxLoyaltyTransactionRequestUserAccount, 'user_account')
  userAccount: PerxLoyaltyTransactionRequestUserAccount

  @autoserializeAs('amount_to_deduct')
  points!: number

  @autoserializeAs('loyalty_program_id')
  loyaltyProgramId!: number

  constructor(userAccount: PerxLoyaltyTransactionRequestUserAccount, loyaltyProgramId: number, points: number) {
    this.userAccount = userAccount
    this.points = points
    this.loyaltyProgramId = loyaltyProgramId
  }
}

export class PerxLoyaltyTransactionRequest {
  
  @autoserializeAs(PerxLoyaltyTransactionRequestUserAccount, 'user_account')
  userAccount: PerxLoyaltyTransactionRequestUserAccount

  @autoserializeAs('properties')
  properties: Record<string, string|number> = {}

  @autoserializeAs('points')
  points!: number

  @autoserializeAs('loyalty_program_id')
  loyaltyProgramId!: number

  @autoserializeAs('transaction_reference')
  transactionReference: string | null = null

  constructor(userAccount: PerxLoyaltyTransactionRequestUserAccount, loyaltyProgramId: number, points: number, transactionReference: string | null = null, properties: Record<string, string|number> = {}) {
    this.userAccount = userAccount
    this.points = points
    this.loyaltyProgramId = loyaltyProgramId
    this.properties = properties
    this.transactionReference = transactionReference
  }

  public static makeBurnRequest(userAccount: PerxRawUserAccount, loyaltyProgramId: number, pointsToBurn: number, transactionReference: string | null = null, properties: Record<string, string|number> = {}): PerxLoyaltyTransactionRequest {
    const request = new PerxLoyaltyTransactionRequest(
      new PerxLoyaltyTransactionRequestUserAccount(userAccount),
      loyaltyProgramId,
      -pointsToBurn,
      transactionReference,
      properties,
    )
    return request
  }

  public static makeEarnRequest(userAccount: PerxRawUserAccount, loyaltyProgramId: number, pointsToEarn: number, transactionReference: string | null = null, properties: Record<string, string|number> = {}): PerxLoyaltyTransactionRequest {
    const request = new PerxLoyaltyTransactionRequest(
      new PerxLoyaltyTransactionRequestUserAccount(userAccount),
      loyaltyProgramId,
      pointsToEarn,
      transactionReference,
      properties,
    )
    return request
  }
}

@inheritSerialization(PerxBaseInvoiceItem)
export class PerxInvoiceRequestUsedItem extends PerxBaseInvoiceItem {

  constructor(itemType: PerxInvoiceItemType, itemId: number) {
    super()
    this.itemId = itemId
    this.itemType = itemType
  }

  public static points(perxLoyaltyTransactionId: number): PerxInvoiceRequestUsedItem {
    return new PerxInvoiceRequestUsedItem(
      'StoredValue::Transaction',
      perxLoyaltyTransactionId,
    )
  }

  public static reward(tempRewardVoucherId: number): PerxInvoiceRequestUsedItem {
    return new PerxInvoiceRequestUsedItem(
      'Reward::Transaction',
      tempRewardVoucherId,
    )
  }
}

/**
 * Raw representation of Invoice Transactions' Data
 * 
 * Special parameter:
 * 
 * `appliedVouchers: string[]` will be stored into properties automatically as comma separated value
 * `appliedPoints: string` will be stored into properties automatically as string
 */
export type PerxInvoiceRequestTransactionDataRaw = {
  transactionType: PerxTransactionRequestDataType
  properties: Record<string, string | number>
  transactionReference: string
  currency: string
  // Will be stored in `properties` node with key: `applied_vouchers`
  appliedVouchers: (number|string)[]
  // Will be stored in `properties` node with key: `applied_points`
  appliedPoints: (number|string)
}

/**
 * Override this class to customize your own payload!
 */
export class PerxInvoiceRequestTransactionData {

  @autoserializeAs('transaction_type')
  transactionType: PerxTransactionRequestDataType = 'purchase'

  @autoserializeAs('collected_amount')
  amount: number

  @autoserializeAs('transaction_reference')
  transactionReference: string | undefined = undefined

  @autoserializeAs('currency')
  currency: string | undefined = undefined

  @autoserializeAs('merchant_identifier')
  merchantIdentifier: string

  @autoserializeAs('properties')
  properties: Partial<Record<string, string | number>>

  public constructor(amount: number, merchantIdentifier: string, data: Partial<PerxInvoiceRequestTransactionDataRaw>) {
    this.amount = amount
    this.transactionType = data.transactionType || 'purchase'
    this.merchantIdentifier = merchantIdentifier
    this.properties = {
      applied_vouchers: data.appliedVouchers && data.appliedVouchers.map(String).join(',') || undefined,
      applied_points: data.appliedPoints && `${data.appliedPoints}` || undefined,
      merchant_identifier: merchantIdentifier,
      ...data.properties,
    }
    this.currency = data.currency
    this.transactionReference = data.transactionReference
  }
}

/**
 * Use this class to create the invoice creation
 * 
 * required:
 * - userAccount
 * 
 * Usage
 * 
 * ```ts
 * const req = new PerxInvoiceRequest({ type: 'id', id: 253 })
 *    .addTransactions(
 *        new PerxInvoiceRequestTransactionData(10000, 69, {
 *            appliedVouchers: [3843],
 *            appliedPoints: 20,
 *            properties: {
 *              merchant_identifier: '123',
 *              merchant_categories: 'ABC',
 *              merchant_tags: 'luxury',
 *            }
 *        }),
 *        new PerxInvoiceRequestTransactionData(50000, 291, {
 *            appliedPoints: 80,
 *            properties: {
 *              merchant_identifier: '123456',
 *              merchant_categories: 'ABC',
 *              merchant_tags: 'luxury',
 *            }
 *        }),
 *    )
 *    .usedItems(
 *        PerxInvoiceRequestUsedItem.points(3630),        // loyalty reservation id
 *        PerxInvoiceRequestUsedItem.reward(3843),        // perx voucher id issued by reward's reservation api.
 *    )
 * ```
 */
export class PerxInvoiceRequest {
  
  @autoserializeAs(PerxLoyaltyTransactionRequestUserAccount, 'user_account')
  userAccount: PerxLoyaltyTransactionRequestUserAccount

  @autoserializeAs(PerxInvoiceRequestTransactionData, 'transaction_data')
  transactionData: PerxInvoiceRequestTransactionData[] = []

  @autoserializeAs(PerxInvoiceRequestUsedItem, 'used_items')
  usedItems: PerxInvoiceRequestUsedItem[] = []

  constructor(userAccount: PerxLoyaltyTransactionRequestUserAccount | PerxRawUserAccount) {
    this.userAccount = userAccount instanceof PerxLoyaltyTransactionRequestUserAccount
      ? userAccount
      : new PerxLoyaltyTransactionRequestUserAccount(userAccount)
  }

  public addTransactions(...transactionData: PerxInvoiceRequestTransactionData[]): this {
    this.transactionData.push(...transactionData)
    return this
  }

  public used(...items: PerxInvoiceRequestUsedItem[]): this {
    this.usedItems.push(...items)
    return this
  }

}