import { queryOptions, useQuery } from "@tanstack/react-query";
import {
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchSchedule,
  fetchLastRaceResults,
  fetchNews,
} from "@/lib/f1-data";

const STALE = 5 * 60 * 1000;

export const driversOptions = queryOptions({
  queryKey: ["f1", "drivers"],
  queryFn: ({ signal }) => fetchDriverStandings(signal),
  staleTime: STALE,
});

export const constructorsOptions = queryOptions({
  queryKey: ["f1", "constructors"],
  queryFn: ({ signal }) => fetchConstructorStandings(signal),
  staleTime: STALE,
});

export const scheduleOptions = queryOptions({
  queryKey: ["f1", "schedule"],
  queryFn: ({ signal }) => fetchSchedule(signal),
  staleTime: STALE,
});

export const lastRaceOptions = queryOptions({
  queryKey: ["f1", "last-race"],
  queryFn: ({ signal }) => fetchLastRaceResults(signal),
  staleTime: STALE,
});

export const newsOptions = queryOptions({
  queryKey: ["f1", "news"],
  queryFn: ({ signal }) => fetchNews(signal),
  staleTime: STALE,
});

export const useDrivers = () => useQuery(driversOptions);
export const useConstructors = () => useQuery(constructorsOptions);
export const useSchedule = () => useQuery(scheduleOptions);
export const useLastRace = () => useQuery(lastRaceOptions);
export const useNews = () => useQuery(newsOptions);
