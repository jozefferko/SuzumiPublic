import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import DatePicker from 'react-native-date-picker';
import Modal from 'react-native-modal';
import {Static} from 'runtypes';
import {useLocale} from '../../../../hooks/useLocale';
import theme from '../../../../assets/theme.style';
import ConfirmButton from '../../../../components/ConfirmButton';

type CommentPopUpProps = {
    confirm: (a?: string) => any;
    value?: string;
    show: boolean;
};

const CommentPopUp = (props: CommentPopUpProps) => {
    // const [show, setShow] = useState(props.data.isJust());
    const {t, i18n} = useLocale();
    const [comment, setComment] = useState<string>('');
    useEffect(() => setComment(props.value ?? ''), [props.value]);
    const close = () => props.confirm(comment);

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
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                margin: 0,
            }}>
            <View style={styles.content}>
                <View
                    style={{
                        alignItems: 'flex-start',
                        width: '100%',
                    }}>
                    <Text style={styles.label}>{t('Comment') + ':'}</Text>
                    <TextInput
                        autoCapitalize="words"
                        textContentType="name"
                        keyboardType="default"
                        autoCompleteType="name"
                        style={styles.input}
                        onChangeText={setComment}
                        value={comment}
                        onSubmitEditing={close}
                        autoFocus={true}
                        multiline={true}
                    />
                </View>
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
        margin: 15,

        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        padding: 30,
        paddingBottom: theme.padding,

        width: 300,
        maxWidth: '100%',
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
    input: {
        textAlignVertical: 'top',
        width: '100%',
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,0.1)',
        fontFamily: 'Roboto-light',
        fontSize: 13,
        color: '#000',
        marginVertical: 12,
        padding: 6,
        minHeight: 80,
        marginBottom: 12,
    },
    label: {
        fontFamily: 'Roboto-light',
        fontSize: 13,
        color: '#000',
    },
});

export default CommentPopUp;
