import { REQUEST_TYPE, apiRequestObject } from "@/services/apiRequestObject";
import {
  assessAmendmentConvertToServerData,
  bookingConvertToLocalData,
  impactConvertToLocalData,
  latestBookingVersionConvertToLocalData,
  submissionConvertToLocalData,
  submissionStatusConvertToLocalData,
  submitAmendmentConvertToServerData,
  voyageConvertToLocalData,
} from "@/transformers/bookingAmendmentTransformer";

type RequestOptions = {
  scenario?: MockScenario;
  signal?: AbortSignal;
};

function withScenario(url: string, scenario?: MockScenario): string {
  if (!scenario || scenario === "normal") return url;
  return `${url}${url.includes("?") ? "&" : "?"}scenario=${scenario}`;
}

export async function getBooking(
  bookingId: string,
  options: RequestOptions = {},
): Promise<Booking> {
  const response = await apiRequestObject<BookingDto, Booking>({
    url: withScenario(`/bookings/${bookingId}`, options.scenario),
    transformer: bookingConvertToLocalData,
    config: { signal: options.signal },
  });

  return response.data as Booking;
}

export async function getVoyages(
  search: VoyageSearch,
  options: RequestOptions = {},
): Promise<VoyageOption[]> {
  const query = new URLSearchParams({
    portOfLoading: search.portOfLoading,
    portOfDischarge: search.portOfDischarge,
    readinessDate: search.readinessDate,
    search: search.search,
  });
  if (options.scenario && options.scenario !== "normal") {
    query.set("scenario", options.scenario);
  }

  const response = await apiRequestObject<VoyageOptionDto, VoyageOption>({
    url: `/voyages?${query.toString()}`,
    transformer: voyageConvertToLocalData,
    config: { signal: options.signal },
  });

  return response.data as VoyageOption[];
}

export async function assessAmendment(
  data: AssessAmendmentRequest,
  options: RequestOptions = {},
): Promise<AmendmentImpact> {
  const response = await apiRequestObject<
    AmendmentImpactDto,
    AmendmentImpact,
    AssessAmendmentRequest
  >({
    url: withScenario(
      `/bookings/${data.bookingId}/amendments/assess`,
      options.scenario,
    ),
    type: REQUEST_TYPE.POST,
    body: data,
    inputTransformer: assessAmendmentConvertToServerData,
    transformer: impactConvertToLocalData,
    config: { signal: options.signal },
  });

  return response.data as AmendmentImpact;
}

export async function submitAmendment(
  data: SubmitAmendmentCommand,
  options: RequestOptions = {},
): Promise<AmendmentSubmission> {
  const response = await apiRequestObject<
    AmendmentSubmissionDto,
    AmendmentSubmission,
    SubmitAmendmentCommand
  >({
    url: withScenario(
      `/bookings/${data.bookingId}/amendments`,
      options.scenario,
    ),
    type: REQUEST_TYPE.POST,
    body: data,
    inputTransformer: submitAmendmentConvertToServerData,
    transformer: submissionConvertToLocalData,
    config: { signal: options.signal },
  });

  return response.data as AmendmentSubmission;
}

export async function getSubmissionStatus(
  submissionId: string,
  options: RequestOptions = {},
): Promise<AmendmentSubmissionStatus> {
  const response = await apiRequestObject<
    AmendmentSubmissionStatusDto,
    AmendmentSubmissionStatus
  >({
    url: withScenario(
      `/amendment-submissions/${submissionId}/status`,
      options.scenario,
    ),
    transformer: submissionStatusConvertToLocalData,
    config: { signal: options.signal },
  });

  return response.data as AmendmentSubmissionStatus;
}

export async function getLatestBookingVersion(
  bookingId: string,
  options: RequestOptions = {},
): Promise<LatestBookingVersionDto> {
  const response = await apiRequestObject<
    LatestBookingVersionDto,
    LatestBookingVersionDto
  >({
    url: withScenario(
      `/bookings/${bookingId}/latest-version`,
      options.scenario,
    ),
    transformer: latestBookingVersionConvertToLocalData,
    config: { signal: options.signal },
  });

  return response.data as LatestBookingVersionDto;
}
