import { FC, useCallback, useMemo } from "react";
import { Editor } from "@/components/pages/editor/editor";
import { Editor as GEditor, ProjectData } from "grapesjs";
import { Invitation, Media } from "@/components/providers/payload-types";
import { useApiUrl, useCreate, useDelete, useUpdate } from "@refinedev/core";
import { useRouter } from "next/navigation";
import { generateId } from "@repo/ui/lib/generate-id";
import { htmlToImageFile } from "@/components/hooks/html-to-file";
import { AssetType } from "@/components/pages/editor/asset-manager";

type EditorWrapperProps = {
  invitation: Invitation;
  assets: Media[];
};

export const EditorWrapper: FC<EditorWrapperProps> = ({
  invitation: invitation,
  assets,
}) => {
  const route = useRouter();
  const apiUrl = useApiUrl();
  const initialData = useMemo(() => {
    const invitationAssets: Media[] = (invitation.assets as Media[]) || [];
    const data: ProjectData =
      (invitation.data as ProjectData) ||
      ({
        assets: [],
        pages: [
          {
            name: "Home page",
            component: `<h1>Start to styling, double click me to edit</h1>`,
          },
        ],
      } as ProjectData);
    data.assets = [
      ...invitationAssets.map(
        ({ id, alt, url, thumbnailURL }: Media): AssetType => ({
          assetId: id,
          src: url as string,
          alt,
          thumbnail: thumbnailURL!,
          category: "project-assets",
        })
      ),
      ...assets.map(
        ({ id, alt, url, thumbnailURL }): AssetType => ({
          assetId: id,
          src: url as string,
          alt,
          thumbnail: thumbnailURL!,
          category: "user-assets",
        })
      ),
    ];

    data.dataSources = {
      globalData: {
        user: { firstName: "Alice", isCustomer: true },
        products: [
          { name: "Laptop Pro X15", price: 1200.0 },
          { name: "Wireless Mouse M2", price: 25.99 },
        ],
      },
    };

    return data;
  }, [invitation, assets]);

  const { mutate: handleUpdate } = useUpdate();
  const { mutate: handleCreate } = useCreate();
  const { mutate: handleDelete } = useDelete();

  const handleSave = useCallback(
    async (data: ProjectData, editor: GEditor) => {
      if (!invitation) return null;
      const el = editor.getContainer();
      const html = (
        el?.getElementsByClassName("gjs-frame")[0] as HTMLIFrameElement
      ).contentDocument?.body as HTMLBodyElement;
      if (!el) return;

      const file = await htmlToImageFile(html, {
        filename: `${invitation?.slug}_thumbnail_${generateId()}.jpeg`,
        mime: "image/jpeg",
      });

      const assets = (data.assets as AssetType[])
        .filter(({ category }) => category === "project-assets")
        .map(({ assetId }) => {
          return assetId;
        });

      await new Promise((resolve, reject) => {
        const onSettled = async (thumbnailAsset: any) => {
          if (!thumbnailAsset) return;
          delete data.assets;
          handleUpdate(
            {
              resource: "invitations",
              id: invitation?.id,
              values: {
                assets,
                data,
                thumbnailAsset: thumbnailAsset.id,
              },
            },
            {
              onError: reject,
              onSettled() {
                resolve(true);
              },
            }
          );
        };

        const thumbnailId = (invitation?.thumbnailAsset as Media)?.id;
        if (thumbnailId) {
          handleUpdate(
            {
              resource: "media",
              id: thumbnailId,
              values: {
                _file: file,
              },
              successNotification: false,
            },
            { onError: reject, onSettled }
          );
        } else {
          handleCreate(
            {
              resource: "media",
              successNotification: false,
              values: {
                _file: file,
                alt: `Thumbnail Image of invitation ${invitation.id}`,
                filename: file.name,
                tags: [
                  "thumbnail",
                  "thumbnail-invitation",
                  `thumbnail-${invitation?.id}`,
                ],
              },
            },
            { onError: reject, onSettled }
          );
        }
      });
    },
    [invitation]
  );

  const handleExit = async (editor: GEditor) => {
    await handleSave(editor.getProjectData(), editor);
    route.back();
  };

  const handleAssetUpload = async (
    files: File[]
  ): Promise<AssetType[] | undefined> => {
    if (!invitation) return;

    const url = new URL(apiUrl);
    const result: AssetType[] = [];
    for (let file of files) {
      const filename = `${invitation?.slug}_asset_${generateId()}.png`;
      const res = await new Promise<Media>((resolve, reject) =>
        handleCreate(
          {
            resource: "media",
            values: {
              _file: file,
              filename,
              alt: `asset_${invitation?.slug}`,
            },
          },
          {
            onSettled: (response) => resolve(response?.data as Media),
            onError: reject,
          }
        )
      );
      if (res.url) {
        result.push({
          assetId: res.id,
          src: `${url.origin}${res.url}`,
          alt: res.alt,
          thumbnail: res.thumbnailURL!,
          category: "project-assets",
        });
      }
    }
    return result;
  };

  const handleAssetRemove = async (id: string | number) => {
    const res = await new Promise((resolve, reject) =>
      handleDelete(
        { resource: "media", id: id },
        { onSettled: resolve, onError: reject }
      )
    );
  };

  return (
    <Editor
      onSave={handleSave}
      onExit={handleExit}
      initialData={initialData}
      assetManager={{
        onUpload: handleAssetUpload,
        onRemove: handleAssetRemove,
      }}
    />
  );
};
