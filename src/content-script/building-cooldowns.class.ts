import { LANISTA_BASE_URL } from 'src/app/shared/constants/lanista.constants'
import { Building, BuildingId, ClanBuilding, ClanBuildingId } from './buildings'
import { getToken } from './lanista'
import { Me } from 'src/app/shared/services/me-api.service'
import { getNextUsageHtml } from './helpers'
import { intervalToDuration, isAfter, isSameDay } from 'date-fns'

export class BuildingCooldowns {
  private readonly _cityBuildingsEndpoint = `${LANISTA_BASE_URL}/api/city/buildings`

  readonly me: Me
  readonly buildings: Promise<Building[]>
  readonly clanBuildings: Promise<ClanBuilding[]>

  constructor(me: Me) {
    this.me = me
    this.buildings = this._getCityBuildings()
    this.clanBuildings = me?.avatar?.clan?.id
      ? this._getClanBuildings(me.avatar.clan.id)
      : Promise.resolve([])
  }

  async getBuildingsHtml(): Promise<string> {
    const hasClan = Boolean(this.me.avatar?.clan?.id)
    const buildings = await this.buildings
    const clanBuildings = await this.clanBuildings

    // Add clan buildings
    const buildingData: { name: string; nextUsageLabel: string }[] = []
    if (hasClan) {
      const library = clanBuildings.find(
        (building) => building.id === ClanBuildingId.LIBRARY,
      )
      if (library) {
        buildingData.push({
          name: this._getNameForClanBuilding(library, buildings),
          nextUsageLabel: this._getTimeLabel(
            library?.clan_building_usage?.next_usage,
          ),
        })
      }
      const training = clanBuildings.find(
        (building) => building.id === ClanBuildingId.TRAINING,
      )
      if (training) {
        buildingData.push({
          name: this._getNameForClanBuilding(training, buildings),
          nextUsageLabel: this._getTimeLabel(
            training?.clan_building_usage?.next_usage,
          ),
        })
      }
      const mine = clanBuildings.find(
        (building) => building.id === ClanBuildingId.MINE,
      )
      if (mine) {
        buildingData.push({
          name: this._getNameForClanBuilding(mine, buildings),
          nextUsageLabel: this._getTimeLabel(
            mine?.clan_building_usage?.next_usage,
          ),
        })
      }
    }

    // Add city buildings
    const library = buildings.find(
      (building) => building.id === BuildingId.LIBRARY,
    )
    if (library && !hasClan) {
      buildingData.push({
        name: library.name,
        nextUsageLabel: this._getTimeLabel(library?.usage?.next_usage),
      })
    }
    const training = buildings.find(
      (building) => building.id === BuildingId.TRAINING,
    )
    if (training && !hasClan) {
      buildingData.push({
        name: training.name,
        nextUsageLabel: this._getTimeLabel(training?.usage?.next_usage),
      })
    }
    const healing = buildings.find(
      (building) => building.id === BuildingId.HEALING,
    )
    if (healing) {
      buildingData.push({
        name: healing.name,
        nextUsageLabel: this._getTimeLabel(healing?.usage?.next_usage),
      })
    }

    // Generate and return html
    const html = buildingData.map(({ name, nextUsageLabel }) =>
      getNextUsageHtml(name, nextUsageLabel),
    )
    return html.join('\n')
  }

  isBuildingUseCall(url: string): boolean {
    const urlSegments = url.split('/')
    return (
      urlSegments.at(-3).includes('buildings') &&
      urlSegments.at(-1).includes('use')
    )
  }

  private _getTimeLabel(nextUsage: string | undefined): string {
    const date = nextUsage ? new Date(nextUsage) : null
    const now = new Date()
    if (!date) {
      return 'Redo'
    } else if (!isAfter(date, now)) {
      return 'Redo'
    } else {
      const duration = intervalToDuration({ start: now, end: date })

      const hours = (duration.days ?? 0) * 24 + (duration.hours ?? 0)
      const minutes = duration.minutes ?? 0
      const seconds = duration.seconds ?? 0

      const label = [...(hours ? [hours] : []), minutes, seconds]
        .map((value) => value.toString().padStart(2, '0'))
        .join(':')
      return label
    }
  }

  private _getNameForClanBuilding(
    clanBuilding: ClanBuilding,
    buildings: Building[],
  ): string {
    if (clanBuilding.id === ClanBuildingId.LIBRARY) {
      return (
        buildings.find((building) => building.id === BuildingId.LIBRARY)
          ?.name || ''
      )
    } else if (clanBuilding.id === ClanBuildingId.TRAINING) {
      return (
        buildings.find((building) => building.id === BuildingId.TRAINING)
          ?.name || ''
      )
    } else if (clanBuilding.id === ClanBuildingId.MINE) {
      return 'Gruva'
    } else {
      return ''
    }
  }

  private async _getCityBuildings(): Promise<Building[]> {
    const token = getToken()
    const buildings = await fetch(this._cityBuildingsEndpoint, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-xsrf-token': token,
      },
      method: 'GET',
    }).then((response) => response.json())
    return buildings
  }

  private async _getClanBuildings(clanId: number): Promise<ClanBuilding[]> {
    const token = getToken()
    const buildings = await fetch(this._getClanBuildingsEndpoint(clanId), {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-xsrf-token': token,
      },
      method: 'GET',
    }).then((response) => response.json())
    return buildings
  }

  private _getClanBuildingsEndpoint(clanId: number): string {
    return `${LANISTA_BASE_URL}/api/clans/${clanId}/buildings`
  }
}
