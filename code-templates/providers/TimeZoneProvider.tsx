"use client";
import { createContext, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { usePermission } from "../PermissionProvider/PermissionProvider";
import { fetcherWrapper } from "@/services/apiRequestObject";
import {
  userTimeZoneAdminUrl,
  userTimeZoneAgentUrl,
} from "@/services/apiEndpoint";
import { timeZoneConvertToLocalData } from "@/objects/Profile";
import dateFormatWithZone from "@/utils/dateFormat";

interface ContextProps {
  timeZone: TimeZoneLocal | null;
  setTimeZone: Function;
  isLoading: boolean;
  dateFormat: Function;
  mutateTimeZone: Function;
}

export const TimeZoneContext = createContext<ContextProps | undefined>(
  undefined,
);

export const TimeZoneProvider = ({ children }: { children: any }) => {
  const [timeZone, setTimeZone] = useState<TimeZoneLocal | null>(null);

  const { data: session } = useSession();
  const { hasAdminAccess } = usePermission();

  const url = hasAdminAccess ? userTimeZoneAdminUrl : userTimeZoneAgentUrl;
  const { data, isValidating, mutate } = useSWR(
    !!session ? url : "",
    fetcherWrapper({ url, transformer: timeZoneConvertToLocalData }),
    {
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (data?.success) {
      setTimeZone(data);
    }
  }, [data]);

  const dateFormat = (value: string, formatString = "yyyy-MM-dd") =>
    dateFormatWithZone(value, formatString, timeZone?.region || "UTC");

  return (
    <TimeZoneContext.Provider
      value={{
        timeZone,
        setTimeZone,
        isLoading: isValidating,
        mutateTimeZone: mutate,
        dateFormat,
      }}
    >
      {children}
    </TimeZoneContext.Provider>
  );
};

export default TimeZoneProvider;

export const useTimeZone = () => {
  const context = useContext(TimeZoneContext);
  if (!context) {
    throw new Error("useTimeZone must be used within a TimeZoneProvider");
  }
  return context;
};
