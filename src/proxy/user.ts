import type { IPerxUserProxy } from './manager'
import type {
  IPerxService,
  PerxCustomer,
  PerxRewardScope,
  PerxLoyalty,
  PerxLoyaltyTransactionsHistoryResponse,
  PerxRewardSearchResultResponse,
  PerxVoucher,
  PerxVoucherScope,
  PerxVouchersResponse,
  PerxRewardsResponse,
  PerxCategory,
  PerxRewardReservation,
  IPerxToken,
  PerxCategoriesResultResponse,
  PerxRewardResponse,
  PerxVoucherResponse,
  PerxMerchantResponse,
  PerxMerchant,
} from '..'
import { chunk } from 'lodash'

export class PerxUserProxy implements IPerxUserProxy {

  public constructor(public readonly getToken: () => Promise<IPerxToken>, private readonly perxService: IPerxService) {
  }

  public async getReward(rewardId: number): Promise<PerxRewardResponse> {
    const token = await this.getToken()
    return this.perxService.getReward(token.accessToken, rewardId)
  }

  public async queryRewards(scope: Partial<PerxRewardScope>): Promise<PerxRewardsResponse> {
    const token = await this.getToken()
    return this.perxService.getRewards(token.accessToken, scope)
  }

  public async searchRewards(keyword: string, page: number = 1, size: number = 25): Promise<PerxRewardSearchResultResponse> {
    const token = await this.getToken()
    return this.perxService.searchRewards(token.accessToken, keyword, page, size)
  }

  public async issueReward(rewardId: string): Promise<PerxVoucher> {
    const token = await this.getToken()
    return this.perxService.issueVoucher(token.accessToken, rewardId)
  }

  public async queryVouchers(scope: Partial<PerxVoucherScope>): Promise<PerxVouchersResponse> {
    const token = await this.getToken()
    return this.perxService.getVouchers(token.accessToken, scope)
  }

  public async listCategories(page: number, pageSize: number): Promise<PerxCategoriesResultResponse> {
    return this.listCategoriesByParentId(null, page, pageSize)
  }

  public async listCategoriesByParentId(parentId: number | null, page: number, pageSize: number): Promise<PerxCategoriesResultResponse> {
    const token = await this.getToken()
    return this.perxService.getCategories(token.accessToken, parentId, page, pageSize)
  }

  public async listAllCategories(parentId: number | null = null): Promise<PerxCategory[]> {
    const token = await this.getToken()
    let hasNextPage = false
    let page = 1
    const pageSize = 50
    const output: PerxCategory[] = []
    do {
      const resp = await this.perxService.getCategories(token.accessToken, parentId, page, pageSize)
      output.push(...resp.data)
      const totalPages = resp.meta.totalPages
      hasNextPage = totalPages > page
      page = resp.meta.nextPage || (page + 1)
    } while (hasNextPage)
    return output
  }

  public async reserveReward(rewardId: string, timeoutInMs: number = 900 * 1000): Promise<PerxRewardReservation> {
    const token = await this.getToken()
    return this.perxService.reserveReward(token.accessToken, rewardId, timeoutInMs)
  }

  public async releaseReservedReward(reservationId: string): Promise<PerxVoucher> {
    const token = await this.getToken()
    return this.perxService.releaseRewardReservation(token.accessToken, reservationId)
  }

  public async confirmReservedReward(reservationId: string): Promise<PerxVoucher> {
    const token = await this.getToken()
    return this.perxService.confirmRewardReservation(token.accessToken, reservationId)
  }

  public async reserveVouchers(voucherIds: string[]): Promise<PerxVoucher[]> {
    return this._forEachVoucher(voucherIds, (token, voucherId) => {
      return this.perxService.redeemVoucher(token.accessToken, voucherId, false)
    })
  }

  public async confirmVouchers(voucherIds: string[]): Promise<PerxVoucher[]> {
    return this._forEachVoucher(voucherIds, (token, voucherId) => {
      return this.perxService.redeemVoucher(token.accessToken, voucherId, true)
    })
  }

  public async getVoucher(voucherId: number): Promise<PerxVoucherResponse> {
    const userToken = await this.getToken()
    return this.perxService.getVoucher(userToken.accessToken, voucherId)
  }

  public async redeemVouchers(voucherIds: string[]): Promise<PerxVoucher[]> {
    return this._forEachVoucher(voucherIds, (token, voucherId) => {
      return this.perxService.redeemVoucher(token.accessToken, voucherId)
    })
  }

  public async getMe(): Promise<PerxCustomer> {
    const token = await this.getToken()
    return this.perxService.getMe(token.accessToken)
  }

  public async getLoyaltyProgram(loyaltyProgramId: number | string): Promise<PerxLoyalty> {
    const token = await this.getToken()
    return this.perxService.getLoyaltyProgram(token.accessToken, loyaltyProgramId)
  }

  public async queryLoyaltyPrograms(): Promise<PerxLoyalty[]> {
    const token = await this.getToken()
    return this.perxService.getLoyaltyPrograms(token.accessToken)
  }

  public async queryTransactionsHistory(page: number = 1, perPage: number = 25, transactionReference?: string): Promise<PerxLoyaltyTransactionsHistoryResponse> {
    const token = await this.getToken()
    return this.perxService.queryLoyaltyTransactionsHistory(token.accessToken, page, perPage, transactionReference)
  }

  public async listAllMerchants(page: number = 1, perPage: number = 25, favorite: boolean | undefined = undefined): Promise<PerxMerchantResponse> {
    const token = await this.getToken()
    return this.perxService.listAllMerchants(token.accessToken, page, perPage, favorite)
  }

  public async getMerchant(merchantId: number): Promise<PerxMerchant> {
    const token = await this.getToken()
    return this.perxService.getMerchant(token.accessToken, merchantId)
  }

  public async performCustomTrigger(perxCustomTriggerId: string): Promise<void> {
    const token = await this.getToken()
    return this.perxService.performCustomTrigger(token.accessToken, perxCustomTriggerId)
  }

  private async _forEachVoucher<R>(voucherIds: string[], callback: (token: IPerxToken, voucherId: string) => Promise<R>): Promise<R[]> {
    const token = await this.getToken()
    let results: R[] = []
    for(const chunkedVoucherIds of chunk(voucherIds, 5)) {
      const r = await Promise.all(chunkedVoucherIds.map((voucherId) => {
        return callback(token, voucherId)
      }))
      results = results.concat(r)
    }
    return results
  }
}