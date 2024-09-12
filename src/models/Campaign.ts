import { autoserializeAs } from 'cerialize'
import { ISODateTimeSerializer } from '../utils/cerialize'
import { PerxImage, PerxReward } from './Reward'
import { PerxCategory, PerxTag } from './Taxonomy'

export class PerxCampaign {

  @autoserializeAs('id')
  id!: number

  @autoserializeAs('name')
  name: string = ''

  @autoserializeAs('description')
  description: string | null = null

  @autoserializeAs('terms_and_conditions')
  termsAndConditions: string | null = null

  @autoserializeAs(ISODateTimeSerializer, 'begins_at')
  beginsAt!: Date

  @autoserializeAs(ISODateTimeSerializer, 'ends_at')
  endsAt: Date | null = null

  @autoserializeAs('enrolled')
  enrolled: boolean = false
  
  @autoserializeAs('campaign_type')
  campaignType: string | null = null

  @autoserializeAs('campaign_referral_type')
  campaignReferralType: string | null = null

  @autoserializeAs('campaign_config')
  campaignConfig: any = {}

  @autoserializeAs(PerxImage, 'images')
  images: PerxImage[] = []

  @autoserializeAs('favourite')
  favourite: boolean = false

  @autoserializeAs('custom_fields')
  customFields: any = {}

  @autoserializeAs(PerxCategory, 'category_tags')
  categoryTags: PerxCategory[] = []

  @autoserializeAs(ISODateTimeSerializer, 'active_at')
  activeAt: Date | null = null

  @autoserializeAs('game_type')
  gameType: string | null = null

  @autoserializeAs('operating_now')
  operatingNow: boolean = false

  @autoserializeAs(PerxReward, 'rewards')
  rewards!: PerxReward[]

  @autoserializeAs('display_properties')
  displayProperties: any = {}

  @autoserializeAs(PerxTag, 'tags')
  tags: PerxTag[] = []

  private _token: string = ''

  private _microSiteBaseUrl: string = ''

  /**
   * Automatically invoke this API when client has been invoked.
   * 
   * This method will set a volatile context for compute the micrositeUrl.
   * 
   * Consumer may just call `makeMicrositeUrl` to produce the expected micrositeUrl on its own.
   * 
   * @param token 
   * @param baseUrl 
   */
  public configMicrositeContext(token: string, baseUrl: string) {
    this._token = token
    this._microSiteBaseUrl = baseUrl
  }

  public makeMicrositeUrl(token: string, baseUrl: string) {
    return `${baseUrl}/loading?token=${token}&cid=${this.id}`
  }

  public get micrositeUrl(): string {
    return this.makeMicrositeUrl(this._token, this._microSiteBaseUrl)
  }

  public toJSON(): { [p: string]: any } {
    return {
      ...this,
      micrositeUrl: this.micrositeUrl
    }
  }
}