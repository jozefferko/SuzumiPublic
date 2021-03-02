import {useNavigation} from '@react-navigation/native';
import _ from 'lodash/fp';
import {Maybe} from 'purify-ts/Maybe';
import {MaybeAsync} from 'purify-ts/MaybeAsync';
import React, {useEffect, useRef, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {Static} from 'runtypes';
import {defaultProfile} from '../../../../assets/staticImages';
import theme from '../../../../assets/theme.style';
import {FSBirthday, FSPathMap} from '../../../../common/types/firestore';
import {fsRunTransaction} from '../../../../common/utils/firestore/fsTransaction';
import BirthdayPicker from '../../../../components/BirthdayPicker';
import ConfirmButton from '../../../../components/ConfirmButton';
import {Condition} from '../../../../components/logicalLib';
import {useImageUpload} from '../../../../hooks/useImageUpload';
import {useLocale} from '../../../../hooks/useLocale';
import {useSafeState} from '../../../../hooks/useSafeState';
import {loadedState} from '../../../../redux/userSlice';

type props = {
    user: loadedState;
    onSave?: () => any;
};

const formatBirthday = (b: Static<typeof FSBirthday>) =>
    b ? `${b.day}/${b.month}/${b.year}` : '';

const checkEmail = (s: string): boolean => {
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return re.test(String(s).toLowerCase());
};
const checkName = (s: string): boolean => {
    const re = /^[\p{L}-]+(\s[\p{L}-]+)*$/u;
    return re.test(String(s).toLowerCase());
};
// const checkBirthday = (a:Maybe<any>)=>
const Editor = (props: props) => {
    const {t} = useLocale();

    const [displayName, setDisplayName] = useState<string>(
        props.user.displayName,
    );
    const [displayNameError, setDisplayNameError] = useState(false);
    const stringTrim = (s: string): string => s.trim();
    useEffect(() => {
        setDisplayName(props.user.displayName);
        setEmailError(true);
    }, [props.user.displayName]);
    useEffect(() => {
        if (displayNameError && checkName(displayName)) {
            setDisplayNameError(false);
        }
    }, [displayName, displayNameError]);

    const [email, setEmail] = useState<string>(props.user.email);
    const [emailError, setEmailError] = useState(false);
    useEffect(() => {
        setEmail(props.user.email);
        setEmailError(false);
    }, [props.user.email]);
    useEffect(() => {
        if (emailError && checkEmail(email)) {
            setEmailError(false);
        }
    }, [emailError, email]);

    const emailRef = useRef<TextInput>();

    const [birthday, setBirthday] = useSafeState<Static<typeof FSBirthday>>();
    const [birthdayError, setBirthdayError] = useState(false);

    useEffect(() => {
        setBirthday(props.user.birthday);
        setBirthdayError(false);
    }, [props.user.birthday, setBirthday]);
    useEffect(() => {
        if (birthdayError && birthday.isJust()) {
            setBirthdayError(false);
        }
    }, [birthdayError, birthday]);

    const [showPopUP, setShowPopUP] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const confirmBirthday = (date: Static<typeof FSBirthday>) => {
        setBirthday(date);
        setShowPopUP(false);
    };
    const {
        clear,
        loadImage,
        previewUrl,
        uploadImage,
        uploadProgress,
    } = useImageUpload();
    const updateUser = async () => {
        if (
            !checkEmail(email) ||
            !checkName(displayName.trim()) ||
            birthday.isNothing()
        ) {
            if (!checkEmail(email)) {
                setEmailError(true);
            }
            if (!checkName(displayName.trim())) {
                setDisplayNameError(true);
            }
            if (birthday.isNothing()) {
                setBirthdayError(true);
            }
        } else {
            setLoading(true);
            await uploadImage();
            // auth()
            //     .currentUser?.updateEmail(email)
            //     .then(() =>

            await fsRunTransaction((transaction) =>
                MaybeAsync.liftMaybe(
                    Maybe.of(
                        transaction.update(FSPathMap.users.doc(props.user.id))({
                            email,
                            birthday: birthday.extract(),
                            displayName: displayName.trim(),
                        }),
                    ),
                )
                    .map(_.stubTrue)
                    .run(),
            );
            setLoading(false);
            if (props.onSave) props.onSave;
        }
    };
    const navigation = useNavigation();
    useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                if (
                    previewUrl.isNothing() &&
                    _.isEqual(
                        {
                            email,
                            birthday: birthday.extract(),
                            displayName: displayName.trim(),
                        },
                        {
                            email: props.user.email,
                            birthday: props.user.birthday,
                            displayName: props.user.displayName,
                        },
                    )
                ) {
                    // If we don't have unsaved changes, then we don't need to do anything
                    return;
                }

                // Prevent default behavior of leaving the screen
                e.preventDefault();

                // Prompt the user before leaving the screen
                Alert.alert(
                    'Discard changes?',
                    'You have unsaved changes. Are you sure to discard them and leave the screen?',
                    [
                        {
                            text: "Don't leave",
                            style: 'cancel',
                            onPress: () => {},
                        },
                        {
                            text: 'Discard',
                            style: 'destructive',
                            // If the user confirmed, then we dispatch the action we blocked earlier
                            // This will continue the action that had triggered the removal of the screen
                            onPress: () => navigation.dispatch(e.data.action),
                        },
                    ],
                );
            }),
        [
            birthday,
            displayName,
            email,
            navigation,
            previewUrl,
            props.user.birthday,
            props.user.displayName,
            props.user.email,
        ],
    );
    return (
        <>
            <Pressable style={styles.userImageBox} onPress={loadImage}>
                <FastImage
                    source={previewUrl
                        .alt(
                            Maybe.fromPredicate(
                                ($) => !!$,
                                props.user.photoUrl,
                            ),
                        )
                        .map(($) => ({uri: $}))
                        .orDefault(defaultProfile)}
                    style={styles.userImage}
                />
                <Text style={styles.imageLabel}>
                    {t('Change profile photo')}
                </Text>
            </Pressable>
            <View>
                <Text
                    style={{
                        ...styles.label,
                        ...(displayNameError
                            ? {color: theme.NOTIFICATION_COLOR}
                            : {}),
                    }}>
                    {t('Name')}
                </Text>
                <TextInput
                    autoCapitalize="words"
                    textContentType="name"
                    keyboardType="default"
                    autoCompleteType="name"
                    style={{
                        ...styles.input,
                        ...(displayNameError
                            ? {color: theme.NOTIFICATION_COLOR}
                            : {}),
                    }}
                    onChangeText={setDisplayName}
                    value={displayName}
                    onSubmitEditing={() => emailRef.current?.focus()}
                />
                <View style={styles.separator} />
                <Text
                    style={{
                        ...styles.label,
                        ...(emailError
                            ? {color: theme.NOTIFICATION_COLOR}
                            : {}),
                    }}>
                    {t('Email address')}
                </Text>
                <TextInput //@ts-ignore
                    ref={emailRef}
                    autoCapitalize="none"
                    textContentType="emailAddress"
                    keyboardType="email-address"
                    autoCompleteType="email"
                    style={{
                        ...styles.input,
                        ...(emailError
                            ? {color: theme.NOTIFICATION_COLOR}
                            : {}),
                    }}
                    onChangeText={_.flow(stringTrim, setEmail)}
                    value={email}
                    onSubmitEditing={() => setShowPopUP(true)}
                />
                <View style={styles.separator} />
                <Pressable onPress={() => setShowPopUP(true)}>
                    <Text
                        style={{
                            ...styles.label,
                            ...(birthdayError
                                ? {color: theme.NOTIFICATION_COLOR}
                                : {}),
                        }}>
                        {t('Birthday')}
                    </Text>
                    <Text
                        style={{
                            ...styles.input,
                            paddingVertical: 15,
                            ...(birthdayError
                                ? {color: theme.NOTIFICATION_COLOR}
                                : {}),
                        }}>
                        {birthday.mapOrDefault(formatBirthday, '')}
                    </Text>
                </Pressable>
                <View style={styles.separator} />
                <BirthdayPicker confirm={confirmBirthday} show={showPopUP} />
            </View>
            <Condition if={loading}>
                <ActivityIndicator size={40} color={theme.HIGHLIGHT} />
                <ConfirmButton title={t('Save changes')} onPress={updateUser} />
            </Condition>
        </>
    );
};

const styles = StyleSheet.create({
    userImageBox: {
        paddingVertical: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userImage: {
        borderRadius: 85,
        height: 125,
        width: 125,
    },
    imageLabel: {
        paddingTop: 20,
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Roboto-Light',
    },
    input: {
        borderRadius: 5,
        backgroundColor: 'transparent',
        fontFamily: 'Roboto-light',
        fontSize: 13,
        color: '#FFF',
        paddingLeft: 0,
        paddingVertical: 12,
        paddingBottom: 12,
    },
    label: {
        fontFamily: 'Roboto-light',
        fontSize: 13,
        color: '#FFF',
    },
    separator: {
        backgroundColor: '#373B4C',
        height: 1,
        marginBottom: 20,
    },
    wrapper: {
        flex: 1,
        flexDirection: 'column',
    },
    scroll: {
        flex: 1,
    },
});

export default Editor;
