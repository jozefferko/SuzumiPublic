import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';
import {Static} from 'runtypes';
import theme from '../assets/theme.style';
import {FSBirthday} from '../common/types/firestore';
import {
    dateToFSBirthday,
    fsBirthdayToDate,
} from '../common/utils/dateOperations';
import {useLocale} from '../hooks/useLocale';
import ConfirmButton from './ConfirmButton';

type props = {
    confirm: (a: Static<typeof FSBirthday>) => any;
    value?: Static<typeof FSBirthday> | null;
    show: boolean;
};

const dateLimit = (): Date => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
};

const BirthdayPicker = (props: props) => {
    // const [show, setShow] = useState(props.data.isJust());
    useEffect(
        () =>
            setDate(props.value ? fsBirthdayToDate(props.value) : dateLimit()),
        [props.value],
    );
    const [date, setDate] = useState<Date>(new Date());
    const {t, i18n} = useLocale();
    const close = () => props.confirm(dateToFSBirthday(date));

    return (
        <Modal
            // deviceWidth={deviceWidth}
            // deviceHeight={deviceHeight}
            propagateSwipe
            backdropTransitionOutTiming={0}
            isVisible={props.show}
            onSwipeComplete={close}
            swipeDirection="down"
            onBackdropPress={close}
            onModalHide={close}
            style={{justifyContent: 'center', alignItems: 'center', margin: 0}}>
            <View style={styles.content}>
                <DatePicker
                    maximumDate={dateLimit()}
                    mode="date"
                    date={date}
                    onDateChange={setDate}
                    textColor={'#000000'}
                    androidVariant={'iosClone'}
                    locale={i18n.language}
                />
                {/*<View*/}
                {/*    style={{*/}
                {/*        paddingTop: 10,*/}
                {/*        flexDirection: 'row',*/}
                {/*        justifyContent: 'center',*/}
                {/*        alignItems: 'center',*/}
                {/*        width: '100%',*/}
                {/*    }}>*/}
                <ConfirmButton
                    // textStyle={{fontSize: 13, fontFamily: 'Roboto-Light'}}
                    // style={{marginLeft: 5, paddingVertical: 7}}
                    title={'  ' + t('Confirm') + '  '}
                    onPress={close}
                />
                {/*</View>*/}
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
        alignItems: 'center',
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

export default BirthdayPicker;
