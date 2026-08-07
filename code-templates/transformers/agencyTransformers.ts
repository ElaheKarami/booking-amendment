import {
  countryConvertToLocalData,
  locationConvertToLocalData,
} from "./Location";

export const agencyConvertToLocalData = (data: any): Agency => {
  return {
    id: data?.id,
    agencyName: data?.agencyName,
    salesOfficeObjectId: data?.salesOfficeObjectId,
    locations: data?.locations?.map((item: UnLocation) =>
      locationConvertToLocalData(item),
    ),
    country: countryConvertToLocalData(data?.country),
    //Note: backend doesn't want to change the array
    managedCountries: data?.managedCountries?.map(
      (item: { country: Country }) => countryConvertToLocalData(item?.country),
    ),
    lastModifiedDate: data?.lastModifiedDate,
    createdDate: data?.createdDate,
  };
};

export const agencyAgentConvertToLocalData = (
  data: AgencyAgent,
): AgencyAgent => {
  return {
    id: data?.id,
    firstName: data?.firstName,
    lastName: data?.lastName,
    email: data?.email,
    agencyId: data?.agencyId,
    type: data?.type,
    isCurrentUser: data?.isCurrentUser,
  };
};

export const agencyConvertToServerData = (data: any): AgencyServer => {
  return {
    id: data?.id,
    agencyName: data?.agencyName,
    salesOfficeObjectId: data?.salesOfficeObjectId,
    countryId: data?.country?.id,
    locations: data?.location?.map((item: any) => ({
      description: item?.description,
      loCode: item?.id,
      type: item?.type,
    })),
    //Note: backend needs them to be sent this way. each in a object
    managedCountries: data?.managedCountries?.map((item: Country) => ({
      country: item,
    })),
  };
};
