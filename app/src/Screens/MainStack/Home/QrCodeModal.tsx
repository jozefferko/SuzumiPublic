import React from 'react';
import {Dimensions, ScrollView, StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import {Static} from 'runtypes';
import {defaultProfile, qrLogo} from '../../../assets/staticImages';
import {FSUser} from '../../../common/types/firestore';
import CustomModal from '../../../components/CustomModal';
import {useBrighterScreen} from '../../../hooks/useBrighterScreen';
import {scaleVertical} from '../../../utils/scale';
import FastImage from 'react-native-fast-image';
import {useLocale} from '../../../hooks/useLocale';

type props = {
    show: boolean;
    onClose: () => any;
    user: Static<typeof FSUser>;
};
const hackHeight = Dimensions.get('window').width / 1.5;
const QrCodeModal = (props: props) => {
    const {t} = useLocale();

    useBrighterScreen(props.show);
    return (
        <CustomModal height={'90%'} show={props.show} onClose={props.onClose}>
            <ScrollView
                contentContainerStyle={{
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    flex: 1,
                }}
                style={styles.content}>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Text style={styles.heading}>
                        {t('Collect points for')}
                    </Text>
                    <Text style={styles.heading}>
                        {t('your visit at Suzumi')}
                    </Text>
                    <Text style={{...styles.description, marginTop: 20}}>
                        {t(
                            'Please present your QR code to the cashier before payment is affected',
                        )}
                    </Text>
                </View>
                <View style={styles.qrCodeBox}>
                    <QRCode
                        size={hackHeight}
                        color="black"
                        logoSize={75}
                        // logoBackgroundColor={theme.BACKGROUND_COLOR}
                        backgroundColor="white"
                        value={props.user.id}
                        logo={qrLogo}
                    />
                </View>
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <FastImage
                        source={
                            props.user.photoUrl
                                ? {uri: props.user.photoUrl}
                                : defaultProfile
                        }
                        resizeMode="cover"
                        style={styles.userImage}
                    />
                    <Text style={styles.displayName}>
                        {props.user.displayName}
                    </Text>
                    <Text style={styles.phoneNumber}>
                        {props.user.phoneNumber}
                    </Text>
                </View>
            </ScrollView>
        </CustomModal>
    );
};

const styles = StyleSheet.create({
    content: {
        // height: ,
        paddingTop: scaleVertical(10),
    },
    heading: {
        color: '#FFFFFF',
        fontSize: scaleVertical(20),
        fontFamily: 'Roboto-Medium',
    },
    description: {
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: scaleVertical(15),
        fontFamily: 'Roboto-Regular',
    },
    qrCodeBox: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'white',
        marginVertical: scaleVertical(20),
    },
    userImage: {marginBottom: 20, borderRadius: 100, height: 55, width: 55},
    displayName: {
        marginBottom: 10,
        color: '#FFFFFF',
        fontSize: scaleVertical(24),
        fontFamily: 'Roboto-Medium',
    },

    phoneNumber: {
        marginBottom: scaleVertical(15),
        color: '#FFFFFF',
        fontSize: scaleVertical(18),
        fontFamily: 'Roboto-Light',
    },
});

export default QrCodeModal;
