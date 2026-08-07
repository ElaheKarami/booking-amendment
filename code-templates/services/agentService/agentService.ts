import { REQUEST_TYPE, apiRequestObject } from "@/services/apiRequestObject";
import {
  addNewAgentUrl,
  editAgentUrl,
  deleteAgencyUrl,
} from "@/services/apiEndpoint";
import {
  agencyConvertToServerData,
  agencyConvertToLocalData,
} from "@/objects/Agency";

export async function addNewAgent(data: Agency) {
  const res = await apiRequestObject({
    url: addNewAgentUrl,
    type: REQUEST_TYPE.POST,
    body: { ...data },
    inputTransformer: (body: Agency) => agencyConvertToServerData(body),
  });

  return res;
}

export async function editAgent(data: Agency) {
  const res = await apiRequestObject({
    url: editAgentUrl,
    type: REQUEST_TYPE.PUT,
    body: { ...data },
    inputTransformer: (body: Agency) => agencyConvertToServerData(body),
  });

  return res;
}

export async function deleteAgency(agencyId: string) {
  const res = await apiRequestObject({
    url: deleteAgencyUrl(agencyId),
    type: REQUEST_TYPE.REMOVE,
    transformer: agencyConvertToLocalData,
  });

  return res;
}
