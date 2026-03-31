"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

type GroupsRealtimeListenerProps = {
  groupId?: string;
  currentUserId: string;
};

type RealtimeRow = {
  id?: string;
  group_id?: string;
  user_id?: string;
};

export function GroupsRealtimeListener({
  groupId,
  currentUserId,
}: GroupsRealtimeListenerProps) {
  const router = useRouter();
  const refreshTimeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const channelHealthyRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const channelName = groupId ? `group-${groupId}` : "groups-dashboard";
    const channel = supabase.channel(channelName);

    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = window.setTimeout(() => {
        refreshTimeoutRef.current = null;
        router.refresh();
      }, 120);
    };

    const startPolling = () => {
      if (intervalRef.current) {
        return;
      }

      intervalRef.current = window.setInterval(() => {
        if (document.visibilityState === "visible") {
          router.refresh();
        }
      }, 2000);
    };

    const stopPolling = () => {
      if (!intervalRef.current) {
        return;
      }

      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!channelHealthyRef.current) {
          scheduleRefresh();
          startPolling();
        }

        return;
      }

      stopPolling();
    };

    const markChannelHealthy = () => {
      channelHealthyRef.current = true;
      stopPolling();
    };

    const markChannelUnhealthy = () => {
      channelHealthyRef.current = false;
      if (document.visibilityState === "visible") {
        startPolling();
      }
    };

    const handleGroupMembersChange = (
      payload: RealtimePostgresChangesPayload<RealtimeRow>,
    ) => {
      const row = ((payload.new ?? payload.old ?? null) as RealtimeRow | null);

      if (!row) {
        return;
      }

      if (groupId) {
        const eventBelongsToCurrentGroup = row.group_id === groupId;

        if (!eventBelongsToCurrentGroup) {
          return;
        }

        const currentUserLostMembership =
          payload.eventType === "DELETE" && row.user_id === currentUserId;

        if (currentUserLostMembership) {
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        scheduleRefresh();
        return;
      }

      scheduleRefresh();
    };

    const handleGroupsChange = (payload: RealtimePostgresChangesPayload<RealtimeRow>) => {
      const row = ((payload.new ?? payload.old ?? null) as RealtimeRow | null);

      if (!row) {
        return;
      }

      if (groupId) {
        if (row.id !== groupId) {
          return;
        }

        if (payload.eventType === "DELETE") {
          router.replace("/dashboard");
          router.refresh();
          return;
        }

        scheduleRefresh();
        return;
      }

      scheduleRefresh();
    };

    const handleBetScopedChange = (payload: RealtimePostgresChangesPayload<RealtimeRow>) => {
      const row = ((payload.new ?? payload.old ?? null) as RealtimeRow | null);

      if (!row || !groupId) {
        return;
      }

      if (row.group_id !== groupId) {
        return;
      }

      scheduleRefresh();
    };

    const subscribeStatus = (status: string) => {
      if (status === "SUBSCRIBED") {
        markChannelHealthy();
        return;
      }

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        markChannelUnhealthy();
      }
    };

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "group_members",
      },
      handleGroupMembersChange,
    );

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "groups",
      },
      handleGroupsChange,
    );

    if (groupId) {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bets",
        },
        handleBetScopedChange,
      );

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bet_options",
        },
        handleBetScopedChange,
      );

      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wagers",
        },
        handleBetScopedChange,
      );
    }

    channel.subscribe(subscribeStatus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }

      channelHealthyRef.current = false;
      stopPolling();
      refreshTimeoutRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, groupId, router]);

  return null;
}
