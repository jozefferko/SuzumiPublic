import imageCompression from "browser-image-compression";
import { Maybe } from "purify-ts/Maybe";
import React, { useCallback, useMemo } from "react";
import { FSDocumentPath } from "../common/types/firestore";
import { fsUpload, fsUploadType } from "../common/utils/firestore/queries";
import { fThen } from "../common/utils/fp";
import { app, storage } from "../firebase";
import { useSafeState } from "./useSafeState";

const compressionOptions = {
    maxSizeMB: 0.3,
    // maxWidthOrHeight: 1080,
};
const compressImage = (f: File) => imageCompression(f, compressionOptions);

type withImgUrl = { imgUrl: string };

const uploadUrl = <T extends withImgUrl>(path: FSDocumentPath<T>) => (
    downloadUrl: string
): Promise<void> =>
    fsUpload<withImgUrl>({
        path: path,
        type: fsUploadType.update,
        data: { imgUrl: downloadUrl },
    }).catch(() => uploadUrl(path)(downloadUrl));

export type loadImage = (event: React.ChangeEvent<HTMLInputElement>) => void;

export const useImageUpload = () => {
    const [uploadProgress, uploadProgressSetter] = useSafeState<number>();
    const [image, setImage] = useSafeState<File>();
    const [previewUrl, setPreviewUrl] = useSafeState<string>();

    const loadImage: loadImage = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) =>
            Maybe.fromNullable(event.target.files)
                .map((list) => list[0])
                .map(compressImage)
                .ifJust(
                    fThen((file) => {
                        setImage(file);
                        setPreviewUrl(URL.createObjectURL(file));
                    })
                ),
        //
        // setImage(safeImage);
        // setPreviewUrl(safeImage.map((file) => URL.createObjectURL(file)));
        [setImage, setPreviewUrl]
    );

    const clear = useCallback(() => {
        setImage();
        setPreviewUrl();
    }, [setImage, setPreviewUrl]);

    const uploadImage = useCallback(
        <T extends withImgUrl>(fsPath: FSDocumentPath<T>) =>
            image
                .map((i) => storage.child(fsPath.path).put(i))
                .ifJust((task) => {
                    task.on(
                        app.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
                        (snapshot) => {
                            uploadProgressSetter(
                                (snapshot.bytesTransferred /
                                    snapshot.totalBytes) *
                                    100
                            );
                        },
                        (error) => {
                            console.log(error);
                        },
                        () => {
                            task.snapshot.ref
                                .getDownloadURL()
                                .then(uploadUrl(fsPath))
                                .then(() => {
                                    clear();
                                    uploadProgressSetter();
                                });
                        }
                    );
                }),
        [clear, image, uploadProgressSetter]
    );

    return useMemo(
        () => ({
            previewUrl,
            loadImage,
            uploadProgress,
            uploadImage,
            clear,
        }),
        [clear, loadImage, previewUrl, uploadImage, uploadProgress]
    );
};
