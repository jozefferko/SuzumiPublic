import storage from '@react-native-firebase/storage';
import _ from 'lodash/fp';
import {MaybeAsync} from 'purify-ts';
import {Maybe} from 'purify-ts/Maybe';
import {useCallback, useMemo} from 'react';
// @ts-ignore
import {launchImageLibrary} from 'react-native-image-picker';
import {useSelector} from 'react-redux';
import {FSDocumentPath, FSPathMap} from '../common/types/firestore';
import {fsUpload, fsUploadType} from '../common/utils/firestore/queries';
import {maybeAll} from '../common/utils/fp';
import {RootState} from '../redux';
import {loadedState, UserStatus} from '../redux/userSlice';
import {useSafeState} from './useSafeState';

type withImgUrl = {imgUrl: string};

const options = {
    title: 'Select Image',
    mediaType: 'photo',
    maxWidth: 300,
    maxHeight: 300,
    includeBase64: true,
};

const uploadUrl = <T extends withImgUrl>(path: FSDocumentPath<T>) => (
    downloadUrl: string,
): Promise<void> =>
    fsUpload<withImgUrl>({
        path,
        type: fsUploadType.update,
        data: {imgUrl: downloadUrl},
    }).catch(() => uploadUrl(path)(downloadUrl));

const safeExtensionFromType = _.cond<string, Maybe<string>>([
    [_.isEqual('image/jpeg'), () => Maybe.of('jpg')],
    [_.isEqual('image/jpg'), () => Maybe.of('jpg')],
    [_.isEqual('image/png'), () => Maybe.of('png')],
    [_.stubTrue, () => Maybe.empty()],
]);

export type loadImage = () => void;

export const useImageUpload = () => {
    const [uploadProgress, uploadProgressSetter] = useSafeState<number>();
    const [image, setImage] = useSafeState<string>();
    const [extension, setExtension] = useSafeState<string>();
    const [previewUrl, setPreviewUrl] = useSafeState<string>();
    const safeUser = useSelector(
        (state: RootState): Maybe<loadedState> =>
            state.user.status === UserStatus.loaded
                ? Maybe.of(state.user)
                : Maybe.empty(),
    );

    const loadImage: loadImage = useCallback(() => {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
            } else if (response.error) {
                console.log('select error', response.error);
            } else {
                setPreviewUrl(response.uri);
                Maybe.fromNullable(response.type)

                    .chain(safeExtensionFromType)
                    .ifJust(console.log)
                    .ifJust((e) => {
                        setExtension(e);
                        setImage(response.base64);
                    })
                    .ifNothing(() => console.log('error in upload'));
            }
        });
    }, [setExtension, setImage, setPreviewUrl]);

    const clear = useCallback(() => {
        setImage();
        setPreviewUrl();
        setExtension();
    }, [setExtension, setImage, setPreviewUrl]);
    const uploadImage = useCallback(
        async (ex: string, uri: string) => {
            safeUser.ifJust(async (user) => {
                uploadProgressSetter(1);
                try {
                    // const extension = filename.split('.').pop();
                    const fileSnapshot = await storage()
                        .ref(`profileImages/${user.id}.${ex}`)
                        .putString(uri, 'base64');
                    console.log(fileSnapshot.state);
                    console.log(fileSnapshot.ref);
                    const url = await storage()
                        .ref(`profileImages/${user.id}.${ex}`)
                        .getDownloadURL();
                    await fsUpload({
                        path: FSPathMap.users.doc(user.id),
                        type: fsUploadType.update,
                        data: {photoUrl: url},
                    });
                    clear();
                    uploadProgressSetter(null);
                } catch (e) {
                    console.log(e);
                    uploadProgressSetter(null);
                }
            });
        },
        [clear, safeUser, uploadProgressSetter],
    );

    const safeUploadImage = useCallback(
        () =>
            MaybeAsync.liftMaybe(maybeAll(image, extension))
                .chain(([i, e]) =>
                    MaybeAsync.fromPromise(() =>
                        uploadImage(e, i).then(Maybe.of),
                    ),
                )
                .run(),
        [extension, image, uploadImage],
    );
    // const uploadImage = useCallback(
    //     <T extends withImgUrl>(fsPath: FSDocumentPath<T>) =>
    //         image
    //             .map((i) => storage.child(fsPath.path).put(i))
    //             .ifJust((task) => {
    //                 task.on(
    //                     app.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    //                     (snapshot) => {
    //                         uploadProgressSetter(
    //                             (snapshot.bytesTransferred /
    //                                 snapshot.totalBytes) *
    //                                 100,
    //                         );
    //                     },
    //                     (error) => {
    //                         console.log(error);
    //                     },
    //                     () => {
    //                         task.snapshot.ref
    //                             .getDownloadURL()
    //                             .then(uploadUrl(fsPath))
    //                             .then(() => {
    //                                 clear();
    //                                 uploadProgressSetter();
    //                             });
    //                     },
    //                 );
    //             }),
    //     [clear, image, uploadProgressSetter],
    // );

    return useMemo(
        () => ({
            previewUrl,
            loadImage,
            uploadProgress,
            uploadImage: safeUploadImage,
            clear,
        }),
        [clear, loadImage, previewUrl, safeUploadImage, uploadProgress],
    );
};
