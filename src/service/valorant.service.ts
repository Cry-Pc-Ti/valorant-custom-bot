import axios from "axios"
import { AbilitiesData, MapData, RoleData } from "../types/valorantData";

const VALORANT_MAPINFO_URL = 'https://valorant-api.com/v1/maps'
const VALORANT_AGENTINFO_URL = 'https://valorant-api.com/v1/agents'

// MAP情報を取得
export const getMapInfo = async () => {
    const res = await axios.get(VALORANT_MAPINFO_URL + '?language=ja-JP');

    const mapInfo: MapData[] = res.data.data.map((map: { tacticalDescription: string | null; uuid: string; displayName: string; }) => {
        if(map.tacticalDescription !== null){
            return{
                id: map.uuid,
                name: map.displayName
            }
        }
    }).filter((map: { tacticalDescription: string | null; uuid: string; displayName: string; }) => map)

    return mapInfo
}

// エージェント情報を取得
// TODO:interfaceを整える。
export const getAgentsInfo = async () => {
    const res = await axios.get(VALORANT_AGENTINFO_URL + '?language=ja-JP');

    const agentsInfo =  res.data.data.map((agent: {
        uuid: string; displayName: string; abilities:  AbilitiesData[]; role: RoleData; 
}) =>{
        return {
            id: agent.uuid,
            name: agent.displayName,
            role: agent.role,
            abilities: agent.abilities
        }
    })
    return agentsInfo
}