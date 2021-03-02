import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Static} from 'runtypes';
import {FSRestaurant, FSUser} from '../../../common/types/firestore';
import {formatFSTimestamp} from '../../../common/utils/dateOperations';
import CustomModal from '../../../components/CustomModal';
import {useSafeSelector} from '../../../redux/selectors';
import {useLocale} from '../../../hooks/useLocale';

type props = {
    show: boolean;
    onClose: () => any;
    user: Static<typeof FSUser>;
};

const ExpiryModal = (props: props) => {
    const {t} = useLocale();
    const safeRestaurant = useSafeSelector<Static<typeof FSRestaurant>>(
        (state) => state.restaurant,
    );
    return (
        <CustomModal show={props.show} onClose={props.onClose}>
            <View style={styles.content}>
                <Text style={styles.heading}>
                    {t('Your {{balance}} points expire at {{date}}', {
                        balance: props.user.balance,
                        date: formatFSTimestamp(props.user.expiryDate),
                    })}
                </Text>
                <Text style={{...styles.description, marginTop: 20}}>
                    {t(
                        'This period will be extended by another {{months}} months if you earn or spend your points',
                        {
                            months: safeRestaurant.mapOrDefault(
                                ($) => $.expiry.expire.months.toString(),
                                '',
                            ),
                        },
                    )}
                </Text>
            </View>
        </CustomModal>
    );
};

const styles = StyleSheet.create({
    content: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    heading: {
        color: '#FFFFFF',
        fontSize: 29,
        fontFamily: 'Roboto-Medium',
        textAlign: 'center',
    },
    description: {
        color: '#FFFFFF',
        fontSize: 15,
        fontFamily: 'Roboto-Regular',
        textAlign: 'center',
    },
    qrCodeBox: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'white',
        marginVertical: 45,
    },
    userImage: {marginBottom: 20, borderRadius: 100, height: 55, width: 55},
    displayName: {
        marginBottom: 10,
        color: '#FFFFFF',
        fontSize: 24,
        fontFamily: 'Roboto-Medium',
    },

    phoneNumber: {
        marginBottom: 20,
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Roboto-Light',
    },
});

export default ExpiryModal;
