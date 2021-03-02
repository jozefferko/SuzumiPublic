import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {Maybe} from 'purify-ts';
import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Barcode, RNCamera} from 'react-native-camera';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux';
import {openLink, openLinkInApp} from '../../utils/link';
import {useLocale} from '../../hooks/useLocale';

type props = {
    navigation: BottomTabNavigationProp<any>;
};

const qrCodeHandler = (barodes: Barcode[], constraint: string) => {
    barodes
        .filter((barcode) =>
            // @ts-ignore
            barcode.data.includes(constraint),
        )
        .map((v) => openLinkInApp(v.data));
};

const Scanner = (props: props) => {
    const {t} = useLocale();
    const isfocused = props.navigation.isFocused();
    useEffect(() => {
        console.log('isfocused', isfocused);
    }, [isfocused]);
    const qrContains: Maybe<string> = useSelector((state: RootState) =>
        state.restaurant
            ? Maybe.of(state.restaurant.qrContains)
            : Maybe.empty(),
    );

    return (
        <View style={styles.wrapper}>
            <RNCamera
                style={styles.preview}
                type={RNCamera.Constants.Type.back}
                androidCameraPermissionOptions={{
                    title: t('Permission to use camera'),
                    message: t('We need your permission to use your camera'),
                    buttonPositive: t('Ok'),
                    buttonNegative: t('Cancel'),
                }}
                captureAudio={false}
                onGoogleVisionBarcodesDetected={({barcodes}) =>
                    qrContains.ifJust((s) => qrCodeHandler(barcodes, s))
                }
            />
            <View style={styles.content}>
                <View style={{...styles.flexBackground, paddingHorizontal: 30}}>
                    <Text style={styles.heading}>{t('Eating at Suzumi?')}</Text>
                    <Text style={styles.description}>
                        {t(
                            'Align the QR code within the frame to view the menu card and to start ordering',
                        )}
                    </Text>
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                    }}>
                    <View style={styles.flexBackground} />
                    <View style={styles.viewPort}>
                        <Corner horizontalAlign="left" verticalAlign="top" />
                        <Corner horizontalAlign="right" verticalAlign="top" />
                        <Corner horizontalAlign="left" verticalAlign="bottom" />
                        <Corner
                            horizontalAlign="right"
                            verticalAlign="bottom"
                        />
                    </View>
                    <View style={styles.flexBackground} />
                </View>
                <View style={styles.flexBackground} />
            </View>
        </View>
    );
};

const Corner = (props: {
    horizontalAlign: 'left' | 'right';
    verticalAlign: 'top' | 'bottom';
}) => (
    <View
        style={{
            position: 'absolute',
            borderColor: '#FFF',
            width: 45,
            aspectRatio: 1,
            ...(props.horizontalAlign === 'left'
                ? {left: 0, borderLeftWidth: 10}
                : {right: 0, borderRightWidth: 10}),
            ...(props.verticalAlign === 'top'
                ? {top: 0, borderTopWidth: 10}
                : {bottom: 0, borderBottomWidth: 10}),
        }}
    />
);

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#000000',
        flex: 1,
        alignSelf: 'center',
        width: '100%',
    },
    flexBackground: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    viewPort: {
        height: '100%',
        aspectRatio: 1,
    },
    heading: {
        marginBottom: 20,
        color: '#FFFFFF',
        fontSize: 25,
        fontFamily: 'Roboto-Medium',
        textAlign: 'center',
    },
    description: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Roboto-Medium',
        textAlign: 'center',
        marginBottom: 45,
    },
    content: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    area: {
        flexDirection: 'column',
        alignContent: 'flex-start',
        flex: 1,
    },
    preview: {
        flex: 1,
    },
});

export default Scanner;
