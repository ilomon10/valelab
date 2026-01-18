"use client";

import { ReactElement } from "react";
import { Invitation, Media } from "@/components/providers/payload-types";
import { useList, useShow } from "@refinedev/core";
import { useParams } from "next/navigation";
import { LoadingOverlay } from "@/components/refine-ui/layout/loading-overlay";
import { LoadingPage } from "@/components/pages/loading-page";
import { EditorWrapper } from "./editor";
import { Metadata } from "next";

export default function EditorPage(): ReactElement {
  const params = useParams();
  const {
    result: data,
    query: { isLoading: invitationLoading, error },
  } = useShow<Invitation>({
    resource: "invitations",
    id: 0,
    meta: {
      slug: params.slug as string,
    },
  });
  const {
    result: media,
    query: { isLoading: mediaLoading },
  } = useList<Media>({
    resource: "media",
  });

  if (error) return <div>Something error</div>;
  if (invitationLoading || mediaLoading)
    return <LoadingPage label="Fetching data" />;
  return (
    <div className="fixed inset-0">
      <LoadingOverlay loading={invitationLoading}>
        {data && media.data && (
          <EditorWrapper invitation={data} assets={media.data} />
        )}
      </LoadingOverlay>
    </div>
  );
}
