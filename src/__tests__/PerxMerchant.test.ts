import { PerxMerchant, PerxCategory, PerxTag } from '..'
import { Deserialize } from 'cerialize'
import { makePolicy, ComparePolicy } from './utils/compare'

const _fixture = {
  withPRH: {
    "id": 291,
    "name": "Absolute Siam Store",
    "images": [],
    "ecommerce_only": null,
    "website": null,
    "custom_fields": {
        "identifier": "123",
        "store_type": "PRH",
        "building_code": "1001",
        "building_name": "Siam Center"
    },
    "category_tags": [
      {
        "id": 72,
        "title": "JoinVizCoin",
        "parent": null,
        "title_en": "JoinVizCoin",
        "title_th": null,
        "title_zh": null,
        "title_vi": null,
        "title_zh_hans": null,
        "title_zh_hant": null
      }
    ],
    "is_favorite": false,
    "is_featured": false,
    "tags": [
      {
        "id": 153,
        "name": "luxury"
      }
    ]
  },
  withoutPRH: {
    "id": 465,
    "name": "3 K",
    "images": [],
    "ecommerce_only": null,
    "website": "",
    "custom_fields": {
      "brand_id": "001910",
      "brand_name": "K",
      "identifier": "191021",
      "building_code": "5001",
      "building_name": "ICON Building 1",
      "industry_code": "SS"
    },
    "category_tags": [
      {
        "id": 72,
        "title": "JoinVizCoin",
        "parent": null,
        "title_en": "JoinVizCoin",
        "title_th": null,
        "title_zh": null,
        "title_vi": null,
        "title_zh_hans": null,
        "title_zh_hant": null
      },
    ],
    "is_favorite": false,
    "is_featured": false,
    "tags": [
      {
        "id": 153,
        "name": "luxury"
      }
    ]
  },
  withCategoryTags: {
    "id": 465,
    "name": "3 K",
    "images": [],
    "ecommerce_only": null,
    "website": "",
    "custom_fields": {
      "brand_id": "001910",
      "brand_name": "K",
      "identifier": "191021",
      "store_type": "PRH",
      "building_code": "5001",
      "building_name": "ICON Building 1",
      "industry_code": "SS"
    },
    "category_tags": [
      {
        "id": 72,
        "title": "JoinVizCoin",
        "parent": null,
        "title_en": "JoinVizCoin",
        "title_th": null,
        "title_zh": null,
        "title_vi": null,
        "title_zh_hans": null,
        "title_zh_hant": null
      },
    ],
    "is_favorite": false,
    "is_featured": false,
    "tags": [
      {
        "id": 153,
        "name": "luxury"
      }
    ]
  },
  withoutCategoryTags: {
    "id": 465,
    "name": "3 K",
    "images": [],
    "ecommerce_only": null,
    "website": "",
    "custom_fields": {
      "brand_id": "001910",
      "brand_name": "K",
      "identifier": "191021",
      "building_code": "5001",
      "building_name": "ICON Building 1",
      "industry_code": "SS"
    },
    "category_tags": [],
    "is_favorite": false,
    "is_featured": false,
    "tags": [
      {
        "id": 153,
        "name": "luxury"
      }
    ]
  },
  withTags: {
    "id": 465,
    "name": "3 K",
    "images": [],
    "ecommerce_only": null,
    "website": "",
    "custom_fields": {
      "brand_id": "001910",
      "brand_name": "K",
      "identifier": "191021",
      "building_code": "5001",
      "building_name": "ICON Building 1",
      "industry_code": "SS"
    },
    "category_tags": [
      {
        "id": 72,
        "title": "JoinVizCoin",
        "parent": null,
        "title_en": "JoinVizCoin",
        "title_th": null,
        "title_zh": null,
        "title_vi": null,
        "title_zh_hans": null,
        "title_zh_hant": null
      },
    ],
    "is_favorite": false,
    "is_featured": false,
    "tags": [
      {
        "id": 153,
        "name": "luxury"
      },
      {
        "id": 152,
        "name": "luxury2"
      }
    ]
  },
  withoutTags: {
    "id": 465,
    "name": "3 K",
    "images": [],
    "ecommerce_only": null,
    "website": "",
    "custom_fields": {
      "brand_id": "001910",
      "store_type": "PRH",
      "brand_name": "K",
      "identifier": "191021",
      "building_code": "5001",
      "building_name": "ICON Building 1",
      "industry_code": "SS"
    },
    "category_tags": [
      {
        "id": 72,
        "title": "JoinVizCoin",
        "parent": null,
        "title_en": "JoinVizCoin",
        "title_th": null,
        "title_zh": null,
        "title_vi": null,
        "title_zh_hans": null,
        "title_zh_hant": null
      },
    ],
    "is_favorite": false,
    "is_featured": false,
    "tags": []
  },
}

describe('Perx Merchant', () => {
  it.each`
    name                                | fixtureData
    ${'with PRH'}                       | ${_fixture.withPRH}
    ${'without PRH'}                    | ${_fixture.withoutPRH}
    ${'with category_tags'}             | ${_fixture.withCategoryTags}
    ${'without category_tags'}          | ${_fixture.withoutCategoryTags}
    ${'with tags'}                      | ${_fixture.withTags}
    ${'without tags'}                   | ${_fixture.withoutTags}
  `('can deserialized $name from JSON', ({ fixtureData }) => {
    const o: PerxMerchant = Deserialize(fixtureData, PerxMerchant)

    expect(o).toBeInstanceOf(PerxMerchant)
    if (o.customFields?.store_type) {
      expect(o.customFields?.store_type).toBeTruthy()
      expect(o.customFields?.store_type).toEqual('PRH')
    } else {
      expect(o.customFields?.store_type).toBeUndefined()
    }
    expect(o.categoryTags.every((o) => o instanceof PerxCategory)).toBeTruthy()
    expect(o.categoryTags).toBeInstanceOf(Array)

    expect(o.tags.every((o) => o instanceof PerxTag)).toBeTruthy()
    expect(o.tags).toBeInstanceOf(Array)

    const policy = makePolicy(o, fixtureData)
    let fieldCompare: Array<[keyof typeof _fixture.withPRH, ComparePolicy]> = [
      ['id', policy.equal],
      ['name', policy.equal],
      ['ecommerce_only', policy.equal],
      ['website', policy.equal],
      ['custom_fields', policy.equal],
      ['category_tags', policy.array([
        ['id', policy.equal],
        ['title', policy.equal],
      ])],
      ['is_favorite', policy.equal],
      ['is_featured', policy.equal],
      ['tags', policy.array([
        ['id', policy.equal],
        ['name', policy.equal],
      ])],
    ]
    for (const f of fieldCompare) {
      const fieldName = f[0]
      const policyComparer = f[1]
      policyComparer(fieldName)
    }
  })
})