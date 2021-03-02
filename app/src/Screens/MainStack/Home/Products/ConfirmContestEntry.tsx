import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import theme from '../../../../assets/theme.style';
import ConfirmButton from '../../../../components/ConfirmButton';
import {useLocale} from '../../../../hooks/useLocale';
import {useSelector} from 'react-redux';
import {RootState} from '../../../../redux';
import {endpoint} from '../../../../utils/cloud';
import {onCallAppSignatures} from '../../../../common/types/calls';

type props = {
    onClose: () => any;
    show: boolean;
};

const ConfirmPurchase = (props: props) => {
    const {t} = useLocale();
    const {show, onClose} = props;
    const price = useSelector(
        (state: RootState) => state.restaurant?.contest.current.price ?? 0,
    );

    const confirm = () =>
        endpoint(onCallAppSignatures.purchaseContest)({
            count: 1,
        }).then(() => {
            props.onClose();
        });

    return (
        <Modal
            propagateSwipe
            backdropTransitionOutTiming={0}
            isVisible={show}
            onSwipeComplete={onClose}
            swipeDirection="down"
            onBackdropPress={onClose}
            onModalHide={props.onClose}
            style={{justifyContent: 'center', margin: 0}}>
            <View style={styles.content}>
                <Text style={styles.header}>
                    {t('You are about to purchase a contest entry')}
                </Text>
                <Text style={styles.text}>
                    {t(
                        '{{price}} points will be deducted from your point balance for an entry to the current contest',
                        {
                            price: price,
                        },
                    )}
                </Text>
                <Text style={styles.text}>
                    {t(
                        'If you win the contest you will be notified and the prize will show up in the purchases section.',
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
                        onPress={onClose}
                    />
                    <ConfirmButton
                        textStyle={{fontSize: 13, fontFamily: 'Roboto-Light'}}
                        style={{marginLeft: 5, paddingVertical: 7}}
                        title={t('Confirm')}
                        onPress={confirm}
                    />
                </View>
            </View>
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
