import {useNavigation} from '@react-navigation/native';
import {Maybe} from 'purify-ts';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import {Static} from 'runtypes';
import theme from '../../../../assets/theme.style';
import {FSPathMap, FSProduct} from '../../../../common/types/firestore';
import {fsRunTransaction} from '../../../../common/utils/firestore/fsTransaction';
import {serverTimestamp} from '../../../../common/utils/firestore/normalize';
import ConfirmButton from '../../../../components/ConfirmButton';
import {useLocale} from '../../../../hooks/useLocale';
import {useSafeSelector} from '../../../../redux/selectors';
import {loadedState, UserStatus} from '../../../../redux/userSlice';
import {endpoint} from '../../../../utils/cloud';
import {onCallAppSignatures} from '../../../../common/types/calls';

type props = {
    onClose: () => any;
    data: Maybe<Static<typeof FSProduct>>;
};

const ConfirmPurchaseContent = (props: {
    onClose: () => any;
    data: Static<typeof FSProduct>;
}) => {
    const navigation = useNavigation();

    const {t} = useLocale();
    const safeUser = useSafeSelector<loadedState>((state) =>
        state.user.status === UserStatus.loaded ? state.user : null,
    );

    const purchase = () =>
        endpoint(onCallAppSignatures.purchase)({
            productID: props.data.id,
        }).then(() => {
            props.onClose();
            navigation.navigate('claimed');
        });

    return (
        <View style={styles.content}>
            <Text style={styles.header}>
                {t("You're about to activate this reward")}
            </Text>
            <Text style={styles.text}>
                {t(
                    '{{price}} points will be deducted from your point balance for the reward "{{reward}}"',
                    {
                        price: props.data.price,
                        reward: t(props.data.displayName),
                    },
                )}
            </Text>
            <Text style={styles.text}>
                {t(
                    'The reward will be saved until you want to use it for your next visit. Before you pay, slide the button and present your phone to the cashier to redeem your reward.',
                )}
            </Text>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    width: '100%',
                }}>
                <ConfirmButton
                    textStyle={{fontSize: 13, fontFamily: 'Roboto-Light'}}
                    outlined={true}
                    title={t('Cancel')}
                    onPress={props.onClose}
                />
                <ConfirmButton
                    textStyle={{fontSize: 13, fontFamily: 'Roboto-Light'}}
                    style={{marginLeft: 5, paddingVertical: 7}}
                    title={t('Confirm')}
                    onPress={purchase}
                />
            </View>
        </View>
    );
};
const ConfirmPurchase = (props: props) => {
    const [show, setShow] = useState(props.data.isJust());
    useEffect(() => setShow(props.data.isJust()), [props.data]);

    const close = () => setShow(false);
    return (
        <Modal
            // deviceWidth={deviceWidth}
            // deviceHeight={deviceHeight}
            propagateSwipe
            backdropTransitionOutTiming={0}
            isVisible={show}
            onSwipeComplete={close}
            swipeDirection="down"
            onBackdropPress={close}
            onModalHide={props.onClose}
            style={{justifyContent: 'center', margin: 0}}>
            {props.data.mapOrDefault(
                (data) => (
                    <ConfirmPurchaseContent onClose={close} data={data} />
                ),
                <View />,
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    content: {
        backgroundColor: '#FFF',
        flexDirection: 'column',
        margin: 22,
        justifyContent: 'center',
        alignItems: 'flex-start',
        borderRadius: 5,
        padding: 30,
        paddingBottom: theme.padding,
    },
    title: {
        width: 190,
        textAlign: 'left',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
        color: theme.BACKGROUND_COLOR,
    },
    header: {
        textAlign: 'left',
        fontSize: 17,
        paddingBottom: 10,
        fontFamily: 'Roboto-Medium',
        color: theme.BACKGROUND_COLOR,
    },
    text: {
        textAlign: 'left',
        fontSize: 14,
        fontFamily: 'Roboto-Light',
        color: theme.BACKGROUND_COLOR,
        paddingBottom: 20,
    },
});

export default ConfirmPurchase;
