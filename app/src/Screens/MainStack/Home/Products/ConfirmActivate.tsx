import {useNavigation} from '@react-navigation/native';
import {Maybe} from 'purify-ts';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import {Static} from 'runtypes';
import theme from '../../../../assets/theme.style';
import {
    FSPathMap,
    FSProduct,
    FSPurchase,
} from '../../../../common/types/firestore';
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
    data: Maybe<Static<typeof FSPurchase>>;
};

const ConfirmActivateContent = (props: {
    onClose: () => any;
    data: Static<typeof FSPurchase>;
}) => {
    const {t} = useLocale();
    const activate = () =>
        endpoint(onCallAppSignatures.activate)({
            purchaseID: props.data.id,
        }).then(() => props.onClose());

    return (
        <View style={styles.content}>
            <Text style={styles.header}>
                {t("You're about to activate this reward")}
            </Text>

            <Text style={styles.text}>
                {t(
                    'You are about to activate this reward, it will be active for 10 minutes after which it will expire.',
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
                    onPress={activate}
                />
            </View>
        </View>
    );
};
const ConfirmActivate = (props: props) => {
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
                    <ConfirmActivateContent onClose={close} data={data} />
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

export default ConfirmActivate;
